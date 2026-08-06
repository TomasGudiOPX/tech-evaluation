import type { Review } from '@vps-template/contracts/reviews';

export type ReviewRow = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
};

export function toReview(row: ReviewRow): Review {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
