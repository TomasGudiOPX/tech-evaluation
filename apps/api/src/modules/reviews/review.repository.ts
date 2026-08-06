import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ReviewMutationInput } from '@vps-template/contracts/reviews';
import { AppError } from '../../platform/app-error.js';
import { PrismaService } from '../../platform/prisma.service.js';
import type { ReviewRow } from './review.types.js';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveProduct(productId: string) {
    return this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });
  }

  async listForActiveProduct(productId: string): Promise<ReviewRow[]> {
    return this.prisma.review.findMany({
      where: {
        productId,
        product: { isActive: true },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, productId: string, input: ReviewMutationInput): Promise<ReviewRow> {
    try {
      return await this.prisma.review.create({
        data: {
          userId,
          productId,
          rating: input.rating,
          comment: input.comment,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(409, 'REVIEW_ALREADY_EXISTS', 'Customer already reviewed this product');
      }

      throw error;
    }
  }

  async updateOwned(reviewId: string, userId: string, input: ReviewMutationInput): Promise<ReviewRow | null> {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, userId },
    });

    if (!review) {
      return null;
    }

    return this.prisma.review.update({
      where: { id: review.id },
      data: {
        rating: input.rating,
        comment: input.comment,
      },
    });
  }
}
