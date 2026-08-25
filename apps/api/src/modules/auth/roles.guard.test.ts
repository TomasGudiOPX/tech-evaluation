import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { RolesGuard } from './roles.guard.js';
import type { AuthenticatedRequest } from './auth.types.js';

function contextFor(request: AuthenticatedRequest) {
  return {
    getHandler: vi.fn(() => function createAdminProduct() {}),
    getClass: vi.fn(() => class AdminProductsController {}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  };
}

function adminOnlyGuard() {
  const reflector = {
    getAllAndOverride: vi.fn(() => ['admin']),
  } satisfies Pick<Reflector, 'getAllAndOverride'>;

  return new RolesGuard(reflector as unknown as Reflector);
}

describe('RolesGuard', () => {
  it('rejects customer users from admin-only product writes', () => {
    const guard = adminOnlyGuard();

    expect(() =>
      guard.canActivate(
        contextFor({
          headers: {},
          user: { id: 'user-1', email: 'customer@example.com', role: 'customer', externalId: null },
        }) as never,
      ),
    ).toThrow(ForbiddenException);
  });

  it('allows admin users through admin-only product writes', () => {
    const guard = adminOnlyGuard();

    expect(
      guard.canActivate(
        contextFor({
          headers: {},
          user: { id: 'admin-1', email: 'admin@example.com', role: 'admin', externalId: null },
        }) as never,
      ),
    ).toBe(true);
  });
});
