import { useState } from 'react';
import type { Product } from '@vps-template/contracts/products';
import { categoryLabel, money } from '../utils/formatters';

interface ProductDetailViewProps {
  product: Product | null;
  onBack: () => void;
  onAddToCart: (productId: string, quantity?: number) => Promise<void>;
  isBusy: boolean;
}

export function ProductDetailView({ product, onBack, onAddToCart, isBusy }: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState(1);

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

  return (
    <section className="detail-section view-transition">
      <button className="back-btn" onClick={onBack} type="button">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span>Add {quantity > 1 ? `${quantity} Items` : 'to Cart'} &bull; {money(p.priceCents * quantity)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
