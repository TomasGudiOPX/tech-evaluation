import { describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import { AppError } from '../../platform/app-error.js';
import type { ReviewRepository } from './review.repository.js';
import { ReviewService } from './review.service.js';
import type { ReviewRow } from './review.types.js';

const userId = '00000000-0000-4000-8000-000000000001';
const otherUserId = '00000000-0000-4000-8000-000000000002';
const productId = '00000000-0000-4000-8000-000000000003';
const otherProductId = '00000000-0000-4000-8000-000000000004';
const retiredProductId = '00000000-0000-4000-8000-000000000005';
const reviewId = '00000000-0000-4000-8000-000000000006';
const otherReviewId = '00000000-0000-4000-8000-000000000007';

function review(overrides: Partial<ReviewRow> = {}): ReviewRow {
  return {
    id: reviewId,
    productId,
    userId,
    rating: 8,
    comment: 'Sturdy and simple.',
    createdAt: new Date('2026-08-06T10:00:00.000Z'),
    updatedAt: new Date('2026-08-06T10:00:00.000Z'),
    ...overrides,
  };
}

function product(id = productId, isActive = true) {
  return {
    id,
    name: 'Minimal Desk Lamp',
    sku: 'MP-WRK-02',
    description: 'Warm adjustable lamp for focused work sessions.',
    category: 'workspace' as const,
    priceCents: 4599,
    imageUrl: 'https://example.com/lamp.jpg',
    stock: 18,
    isActive,
    createdAt: new Date('2026-08-06T10:00:00.000Z'),
    updatedAt: new Date('2026-08-06T10:00:00.000Z'),
  };
}

function createService(reviews: ReviewRow[] = [review(), review({ id: otherReviewId, productId: otherProductId })]) {
  const repository = {
    findActiveProduct: vi.fn(async (id: string) => (id === retiredProductId ? null : product(id))),
    listForActiveProduct: vi.fn(async (id: string) => reviews.filter((item) => item.productId === id)),
    create: vi.fn(async (reviewUserId: string, id: string, input) =>
      review({ userId: reviewUserId, productId: id, rating: input.rating, comment: input.comment }),
    ),
    updateOwned: vi.fn(async (id: string, reviewUserId: string, input) => {
      const existing = reviews.find((item) => item.id === id && item.userId === reviewUserId);
      return existing ? review({ ...existing, rating: input.rating, comment: input.comment }) : null;
    }),
  } satisfies Pick<ReviewRepository, 'findActiveProduct' | 'listForActiveProduct' | 'create' | 'updateOwned'>;

  return {
    repository,
    service: new ReviewService(repository as unknown as ReviewRepository),
  };
}

describe('ReviewService', () => {
  it('lists reviews for only the requested active product', async () => {
    const { repository, service } = createService();

    await expect(service.listForProduct(productId)).resolves.toEqual([
      expect.objectContaining({ id: reviewId, productId }),
    ]);
    expect(repository.listForActiveProduct).toHaveBeenCalledWith(productId);
  });

  it('returns an empty list for an active product without reviews', async () => {
    const { service } = createService([]);

    await expect(service.listForProduct(productId)).resolves.toEqual([]);
  });

  it('rejects missing or retired products for listing and creation', async () => {
    const { service } = createService();

    await expect(service.listForProduct(retiredProductId)).rejects.toMatchObject({
      code: 'REVIEW_PRODUCT_NOT_FOUND',
    } satisfies Partial<AppError>);
    await expect(service.create(userId, retiredProductId, { rating: 7, comment: 'Useful.' })).rejects.toMatchObject({
      code: 'REVIEW_PRODUCT_NOT_FOUND',
    } satisfies Partial<AppError>);
  });

  it('creates a valid authenticated customer review', async () => {
    const { repository, service } = createService();

    await expect(service.create(userId, productId, { rating: 10, comment: '  Excellent shelf.  ' })).resolves.toEqual(
      expect.objectContaining({ productId, userId, rating: 10, comment: 'Excellent shelf.' }),
    );
    expect(repository.create).toHaveBeenCalledWith(userId, productId, { rating: 10, comment: 'Excellent shelf.' });
  });

  it('rejects duplicate customer and product reviews', async () => {
    const { repository, service } = createService();
    repository.create.mockRejectedValueOnce(
      new AppError(409, 'REVIEW_ALREADY_EXISTS', 'Customer already reviewed this product'),
    );

    await expect(service.create(userId, productId, { rating: 8, comment: 'Good fit.' })).rejects.toMatchObject({
      code: 'REVIEW_ALREADY_EXISTS',
      statusCode: 409,
    } satisfies Partial<AppError>);
  });

  it('updates only the authenticated customer owned review', async () => {
    const { service } = createService([review(), review({ id: otherReviewId, userId: otherUserId })]);

    await expect(service.update(userId, reviewId, { rating: 6, comment: 'Still useful.' })).resolves.toEqual(
      expect.objectContaining({ id: reviewId, userId, rating: 6, comment: 'Still useful.' }),
    );
    await expect(service.update(userId, otherReviewId, { rating: 9, comment: 'No access.' })).rejects.toMatchObject({
      code: 'REVIEW_NOT_FOUND',
    } satisfies Partial<AppError>);
  });

  it('rejects invalid ratings and comments with validation errors', async () => {
    const { service } = createService();

    await expect(service.create(userId, productId, { rating: 0, comment: 'Too low.' })).rejects.toBeInstanceOf(
      ZodError,
    );
    await expect(service.create(userId, productId, { rating: 11, comment: 'Too high.' })).rejects.toBeInstanceOf(
      ZodError,
    );
    await expect(service.create(userId, productId, { rating: 4.5, comment: 'Fractional.' })).rejects.toBeInstanceOf(
      ZodError,
    );
    await expect(service.create(userId, productId, { rating: 8, comment: 'x'.repeat(101) })).rejects.toBeInstanceOf(
      ZodError,
    );
  });
});
