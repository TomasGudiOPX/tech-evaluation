import { z } from 'zod';

export const reviewSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().int().min(1).max(10),
  comment: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const reviewMutationSchema = z.object({
  rating: z.number().int().min(1).max(10),
  comment: z.string().trim().min(1).max(100),
});

export const reviewListResponseSchema = z.object({
  reviews: z.array(reviewSchema),
});

export const reviewResponseSchema = z.object({
  review: reviewSchema,
});

export type Review = z.infer<typeof reviewSchema>;
export type ReviewMutationInput = z.infer<typeof reviewMutationSchema>;
export type ReviewListResponse = z.infer<typeof reviewListResponseSchema>;
export type ReviewResponse = z.infer<typeof reviewResponseSchema>;
