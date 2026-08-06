import { describe, expect, it } from 'vitest';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ProductReviewController, ReviewController } from './review.controller.js';

const GUARDS_METADATA = '__guards__';

function guardsFor(target: object, propertyKey?: string) {
  return Reflect.getMetadata(GUARDS_METADATA, propertyKey ? target.constructor.prototype[propertyKey] : target) ?? [];
}

describe('ReviewController auth contract', () => {
  it('keeps public product review listing unauthenticated', () => {
    const guards = guardsFor(ProductReviewController.prototype, 'list');

    expect(guards).not.toContain(JwtAuthGuard);
  });

  it('requires authentication for creating a product review', () => {
    const guards = guardsFor(ProductReviewController.prototype, 'create');

    expect(guards).toContain(JwtAuthGuard);
  });

  it('requires authentication for updating a review', () => {
    const guards = guardsFor(ReviewController);

    expect(guards).toContain(JwtAuthGuard);
  });
});
