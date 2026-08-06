import { Injectable } from '@nestjs/common';
import type { Review } from '@vps-template/contracts/reviews';
import { reviewMutationSchema } from '@vps-template/contracts/reviews';
import { z } from 'zod';
import { AppError } from '../../platform/app-error.js';
import { ReviewRepository } from './review.repository.js';
import { toReview } from './review.types.js';

const productIdSchema = z.string().uuid();
const reviewIdSchema = z.string().uuid();

@Injectable()
export class ReviewService {
  constructor(private readonly repository: ReviewRepository) {}

  async listForProduct(productId: string): Promise<Review[]> {
    const parsedProductId = productIdSchema.parse(productId);
    await this.ensureActiveProduct(parsedProductId);

    return (await this.repository.listForActiveProduct(parsedProductId)).map(toReview);
  }

  async create(userId: string, productId: string, input: unknown): Promise<Review> {
    const parsedProductId = productIdSchema.parse(productId);
    const parsed = reviewMutationSchema.parse(input);
    await this.ensureActiveProduct(parsedProductId);

    return toReview(await this.repository.create(userId, parsedProductId, parsed));
  }

  async update(userId: string, reviewId: string, input: unknown): Promise<Review> {
    const parsedReviewId = reviewIdSchema.parse(reviewId);
    const parsed = reviewMutationSchema.parse(input);
    const review = await this.repository.updateOwned(parsedReviewId, userId, parsed);

    if (!review) {
      throw new AppError(404, 'REVIEW_NOT_FOUND', 'Review not found');
    }

    return toReview(review);
  }

  private async ensureActiveProduct(productId: string) {
    const product = await this.repository.findActiveProduct(productId);

    if (!product) {
      throw new AppError(404, 'REVIEW_PRODUCT_NOT_FOUND', 'Product not found');
    }
  }
}
