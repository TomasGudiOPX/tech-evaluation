import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../../platform/app-error.js';
import { CartService } from './cart.service.js';
import type { CartRepository } from './cart.repository.js';
import type { CartRow } from './cart.types.js';

const userId = '00000000-0000-4000-8000-000000000001';
const productId = '00000000-0000-4000-8000-000000000002';
const retiredProductId = '00000000-0000-4000-8000-000000000003';

function product(id = productId, isActive = true, stock = 5) {
  return {
    id,
    name: 'Minimal Desk Lamp',
    sku: 'MP-WRK-02',
    description: 'Warm adjustable lamp for focused work sessions.',
    category: 'workspace' as const,
    priceCents: 4599,
    imageUrl: 'https://example.com/lamp.jpg',
    stock,
    isActive,
    createdAt: new Date('2026-08-03T10:00:00.000Z'),
    updatedAt: new Date('2026-08-03T10:00:00.000Z'),
  };
}

function cart(items: CartRow['items'] = []): CartRow {
  return {
    id: '00000000-0000-4000-8000-000000000010',
    userId,
    items,
    createdAt: new Date('2026-08-03T10:00:00.000Z'),
    updatedAt: new Date('2026-08-03T10:00:00.000Z'),
  };
}

function createService(existingCart = cart()) {
  const updateItem = vi.fn(async (_userId: string, id: string, quantity: number): Promise<CartRow | null> =>
    cart([{ id: 'cart-item-1', productId: id, quantity, product: product(id) }]),
  );
  const repository = {
    getOrCreate: vi.fn(async () => existingCart),
    findActiveProduct: vi.fn(async (id: string) => (id === retiredProductId ? null : product(id))),
    addItem: vi.fn(async (_userId: string, id: string, quantity: number) =>
      cart([{ id: 'cart-item-1', productId: id, quantity, product: product(id) }]),
    ),
    updateItem,
    removeItem: vi.fn(async () => cart()),
  } satisfies Pick<CartRepository, 'getOrCreate' | 'findActiveProduct' | 'addItem' | 'updateItem' | 'removeItem'>;

  return {
    repository,
    service: new CartService(repository as unknown as CartRepository),
  };
}

describe('CartService', () => {
  it('creates or returns the current user cart on first read', async () => {
    const { repository, service } = createService();

    await expect(service.get(userId)).resolves.toMatchObject({ userId, items: [], totalCents: 0 });
    expect(repository.getOrCreate).toHaveBeenCalledWith(userId);
  });

  it('adds active products and returns line totals', async () => {
    const { repository, service } = createService();

    await expect(service.addItem(userId, { productId, quantity: 2 })).resolves.toMatchObject({
      items: [{ productId, quantity: 2, lineTotalCents: 9198 }],
      totalCents: 9198,
    });
    expect(repository.addItem).toHaveBeenCalledWith(userId, productId, 2);
  });

  it('updates and removes only existing user-owned lines', async () => {
    const { repository, service } = createService();

    await expect(service.updateItem(userId, productId, { quantity: 3 })).resolves.toMatchObject({
      items: [{ productId, quantity: 3 }],
    });
    await expect(service.removeItem(userId, productId)).resolves.toMatchObject({ items: [] });

    repository.updateItem.mockResolvedValueOnce(null);
    await expect(service.updateItem(userId, productId, { quantity: 1 })).rejects.toMatchObject({
      code: 'CART_ITEM_NOT_FOUND',
    } satisfies Partial<AppError>);
  });

  it('rejects retired or missing products', async () => {
    const { service } = createService();

    await expect(service.addItem(userId, { productId: retiredProductId, quantity: 1 })).rejects.toMatchObject({
      code: 'CART_PRODUCT_NOT_FOUND',
    } satisfies Partial<AppError>);
  });
});
