import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ReviewService } from './review.service.js';

const reviewBodySchema = {
  type: 'object',
  required: ['rating', 'comment'],
  properties: {
    rating: { type: 'integer', minimum: 1, maximum: 10 },
    comment: { type: 'string', minLength: 1, maxLength: 100 },
  },
};

@ApiTags('product reviews')
@Controller('api/products/:productId/reviews')
export class ProductReviewController {
  constructor(private readonly reviews: ReviewService) {}

  @Get()
  @ApiOperation({ summary: 'List public reviews for an active product' })
  async list(@Param('productId') productId: string) {
    return { reviews: await this.reviews.listForProduct(productId) };
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create the authenticated customer review for an active product' })
  @ApiBody({ schema: reviewBodySchema })
  async create(@Req() request: AuthenticatedRequest, @Param('productId') productId: string, @Body() body: unknown) {
    return { review: await this.reviews.create(request.user!.id, productId, body) };
  }
}

@ApiTags('product reviews')
@ApiBearerAuth()
@Controller('api/reviews')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviews: ReviewService) {}

  @Patch(':reviewId')
  @ApiOperation({ summary: 'Replace the authenticated customer review rating and comment' })
  @ApiBody({ schema: reviewBodySchema })
  async update(@Req() request: AuthenticatedRequest, @Param('reviewId') reviewId: string, @Body() body: unknown) {
    return { review: await this.reviews.update(request.user!.id, reviewId, body) };
  }
}
