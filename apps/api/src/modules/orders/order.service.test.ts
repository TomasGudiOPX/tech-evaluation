import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../../platform/app-error.js';
import { OrderService } from './order.service.js';
import type { OrderRepository } from './order.repository.js';
import type { OrderRow } from './order.types.js';

const order: OrderRow = {
  id: '00000000-0000-4000-8000-000000000100',
  userId: '00000000-0000-4000-8000-000000000001',
  status: 'placed',
  totalCents: 4599,
  items: [
    {
      id: '00000000-0000-4000-8000-000000000101',
      productId: '00000000-0000-4000-8000-000000000010',
      productName: 'Minimal Desk Lamp',
      unitPriceCents: 4599,
      quantity: 1,
      lineTotalCents: 4599,
    },
  ],
  createdAt: new Date('2026-08-03T10:00:00.000Z'),
};

function createService() {
  const repository = {
    checkout: vi.fn(async () => order),
    listForUser: vi.fn(async () => [order]),
  } satisfies Pick<OrderRepository, 'checkout' | 'listForUser'>;

  return {
    repository,
    service: new OrderService(repository as unknown as OrderRepository),
  };
}

describe('OrderService', () => {
  it('requires an idempotency key for checkout', async () => {
    const { service } = createService();

    await expect(service.checkout(order.userId, undefined)).rejects.toMatchObject({
      code: 'CHECKOUT_IDEMPOTENCY_KEY_REQUIRED',
    } satisfies Partial<AppError>);
  });

  it('checks out and maps immutable snapshots', async () => {
    const { repository, service } = createService();

    await expect(service.checkout(order.userId, 'checkout-key')).resolves.toMatchObject({
      id: order.id,
      items: [{ productName: 'Minimal Desk Lamp', unitPriceCents: 4599 }],
      createdAt: '2026-08-03T10:00:00.000Z',
    });
    expect(repository.checkout).toHaveBeenCalledWith(order.userId, 'checkout-key');
  });

  it('lists only the current user orders through the repository boundary', async () => {
    const { repository, service } = createService();

    await expect(service.listForUser(order.userId)).resolves.toHaveLength(1);
    expect(repository.listForUser).toHaveBeenCalledWith(order.userId);
  });
});
