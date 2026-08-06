import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ProductReviewController, ReviewController } from './review.controller.js';
import { ReviewRepository } from './review.repository.js';
import { ReviewService } from './review.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ProductReviewController, ReviewController],
  providers: [ReviewRepository, ReviewService],
  exports: [ReviewService],
})
export class ReviewsModule {}
