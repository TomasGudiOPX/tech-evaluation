import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { ROLES_METADATA_KEY } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { AdminProductController } from './product.controller.js';

describe('AdminProductController RBAC contract', () => {
  it('requires admin role for product writes', () => {
    const reflector = new Reflector();

    expect(reflector.get<string[]>(ROLES_METADATA_KEY, AdminProductController)).toEqual(['admin']);
  });

  it('rejects customer users and allows admins at the guard boundary', () => {
    const reflector = {
      getAllAndOverride: vi.fn(() => ['admin']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const contextFor = (role: 'customer' | 'admin') =>
      ({
        getHandler: vi.fn(),
        getClass: vi.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
            user: { id: 'user-1', email: `${role}@example.com`, role },
          }),
        }),
      }) as never;

    expect(() => guard.canActivate(contextFor('customer'))).toThrow();
    expect(guard.canActivate(contextFor('admin'))).toBe(true);
  });
});
