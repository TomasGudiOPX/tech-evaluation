import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from '@vps-template/contracts/auth';
import type { Product } from '@vps-template/contracts/products';
import type { Review } from '@vps-template/contracts/reviews';
import { request } from '../services/api';
import type { ToastType } from '../types';
import { categoryLabel, errorMessage, formatDate, money } from '../utils/formatters';

interface ProductDetailViewProps {
  product: Product | null;
  user: AuthUser | null;
  token: string;
  onBack: () => void;
  onAddToCart: (productId: string, quantity?: number) => Promise<void>;
  onOpenAuth: () => void;
  onToast: (message: string, type?: ToastType) => void;
  isBusy: boolean;
}

export function ProductDetailView({
  product,
  user,
  token,
  onBack,
  onAddToCart,
  onOpenAuth,
  onToast,
  isBusy,
}: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(10);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isReviewBusy, setIsReviewBusy] = useState(false);

  const existingReview = useMemo(
    () => (user ? reviews.find((review) => review.userId === user.id) ?? null : null),
    [reviews, user],
  );

  useEffect(() => {
    if (!product) {
      setReviews([]);
      return;
    }

    let ignore = false;

    async function loadReviews() {
      try {
        const data = await request<{ reviews: Review[] }>(`/products/${product!.id}/reviews`);
        if (!ignore) {
          setReviews(data.reviews);
        }
      } catch (caught) {
        if (!ignore) {
          setReviewError(errorMessage(caught));
        }
      }
    }

    setReviewError('');
    void loadReviews();

    return () => {
      ignore = true;
    };
  }, [product]);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
      return;
    }

    setRating(10);
    setComment('');
  }, [existingReview]);

  if (!product) {
    return (
      <section className="detail-section">
        <div className="empty-detail">
          <p>Product not found.</p>
          <button className="secondary-btn" onClick={onBack} type="button">
            Return to Catalog
          </button>
        </div>
      </section>
    );
  }

  const p = product;
  const isOutOfStock = p.stock <= 0;

  function handleIncrement() {
    if (quantity < p.stock) {
      setQuantity((q) => q + 1);
    }
  }

  function handleDecrement() {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      onOpenAuth();
      onToast('Please sign in to write a product review.', 'info');
      return;
    }

    setIsReviewBusy(true);
    setReviewError('');

    try {
      const body = JSON.stringify({ rating, comment });
      const data = await request<{ review: Review }>(
        existingReview ? `/reviews/${existingReview.id}` : `/products/${p.id}/reviews`,
        { method: existingReview ? 'PATCH' : 'POST', body },
        token,
      );

      setReviews((current) => {
        const withoutCurrent = current.filter((review) => review.id !== data.review.id);
        return [data.review, ...withoutCurrent];
      });
      onToast(existingReview ? 'Review updated' : 'Review posted', 'success');
    } catch (caught) {
      const message = errorMessage(caught);
      setReviewError(message);
      onToast(message, 'error');
    } finally {
      setIsReviewBusy(false);
    }
  }

  return (
    <section className="detail-section view-transition">
      <button className="back-btn" onClick={onBack} type="button">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>Back to Catalog</span>
      </button>

      <div className="detail-grid">
        <div className="detail-image-box">
          <img alt={p.name} src={p.imageUrl} />
        </div>

        <div className="detail-content">
          <span className="eyebrow">Product Overview</span>
          <span className="category-pill detail-category">{categoryLabel(p.category)}</span>
          <h1 className="detail-title">{p.name}</h1>
          <span className="detail-price">{money(p.priceCents)}</span>

          <p className="detail-description">{p.description}</p>

          <div className="detail-status">
            <span className="status-label">Availability:</span>
            <span className={`status-pill ${isOutOfStock ? 'pill-danger' : 'pill-success'}`}>
              {isOutOfStock ? 'Out of Stock' : `${p.stock} units in stock`}
            </span>
          </div>

          {!isOutOfStock && (
            <div className="quantity-selector">
              <span className="quantity-label">Quantity</span>
              <div className="stepper-controls">
                <button
                  className="stepper-btn"
                  disabled={quantity <= 1 || isBusy}
                  onClick={handleDecrement}
                  type="button"
                  aria-label="Decrease quantity"
                >
                  &minus;
                </button>
                <span className="stepper-val">{quantity}</span>
                <button
                  className="stepper-btn"
                  disabled={quantity >= p.stock || isBusy}
                  onClick={handleIncrement}
                  type="button"
                  aria-label="Increase quantity"
                >
                  &#43;
                </button>
              </div>
            </div>
          )}

          <button
            className="primary-btn detail-add-btn"
            disabled={isOutOfStock || isBusy}
            onClick={() => void onAddToCart(p.id, quantity)}
            type="button"
          >
            {isBusy ? (
              <span className="btn-spinner"></span>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span>
                  Add {quantity > 1 ? `${quantity} Items` : 'to Cart'} &bull; {money(p.priceCents * quantity)}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      <section className="reviews-panel" aria-labelledby="reviews-title">
        <div className="reviews-header">
          <div>
            <span className="eyebrow">Customer Reviews</span>
            <h2 id="reviews-title">Reviews for {p.name}</h2>
          </div>
          <span className="review-count">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
        </div>

        <form className="review-form" onSubmit={submitReview}>
          <div className="review-form-header">
            <h3>{existingReview ? 'Update your review' : 'Write a review'}</h3>
            {!user && <span className="review-auth-note">Sign in to post</span>}
          </div>

          <div className="review-form-grid">
            <label className="form-field">
              <span>Rating</span>
              <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}/10
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field review-comment-field">
              <span>Comment</span>
              <textarea
                maxLength={100}
                rows={3}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share a short note about this product..."
              />
              <span className="form-hint">{comment.length}/100 characters</span>
            </label>
          </div>

          {reviewError && <p className="review-error">{reviewError}</p>}

          <button className="primary-btn review-submit-btn" disabled={isReviewBusy || isBusy} type="submit">
            {isReviewBusy ? <span className="btn-spinner"></span> : existingReview ? 'Update Review' : 'Post Review'}
          </button>
        </form>

        {reviews.length === 0 ? (
          <div className="empty-reviews">
            <p>No reviews yet.</p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-card-header">
                  <span className="review-rating">{review.rating}/10</span>
                  <span className="review-date">{formatDate(review.updatedAt)}</span>
                </div>
                <p>{review.comment}</p>
                {user?.id === review.userId && <span className="own-review-label">Your review</span>}
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
