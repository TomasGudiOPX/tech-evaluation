import { describe, expect, it } from 'vitest';
import { AppError } from '../../platform/app-error.js';
import type { PrismaService } from '../../platform/prisma.service.js';
import { OrderRepository } from './order.repository.js';

const userA = '00000000-0000-4000-8000-000000000001';
const userB = '00000000-0000-4000-8000-000000000002';
const productId = '00000000-0000-4000-8000-000000000010';
const otherProductId = '00000000-0000-4000-8000-000000000011';

type ProductState = {
  id: string;
  name: string;
  priceCents: number;
  stock: number;
  isActive: boolean;
};

type OrderItemCreate = {
  productId: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

function createPrisma(initialStock = 2) {
  const products = new Map<string, ProductState>([
    [productId, { id: productId, name: 'Minimal Desk Lamp', priceCents: 4599, stock: initialStock, isActive: true }],
    [otherProductId, { id: otherProductId, name: 'Desk Mat', priceCents: 1999, stock: 5, isActive: true }],
  ]);
  const cartItems = [
    { id: 'cart-item-a', cart: { userId: userA }, productId, quantity: 1 },
    { id: 'cart-item-b', cart: { userId: userB }, productId, quantity: 1 },
  ];
  const orders: Array<{
    id: string;
    userId: string;
    status: 'placed';
    totalCents: number;
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      unitPriceCents: number;
      quantity: number;
      lineTotalCents: number;
    }>;
    createdAt: Date;
  }> = [];
  const idempotencyKeys: Array<{
    userId: string;
    key: string;
    requestFingerprint: string;
    responseCode: string;
    orderId: string | null;
    expiresAt: Date;
  }> = [];

  const tx = {
    checkoutIdempotencyKey: {
      findUnique: async ({ where }: { where: { userId_key: { userId: string; key: string } } }) =>
        idempotencyKeys.find((item) => item.userId === where.userId_key.userId && item.key === where.userId_key.key) ??
        null,
      create: async ({ data }: { data: (typeof idempotencyKeys)[number] }) => {
        idempotencyKeys.push({ ...data, orderId: null });
      },
      update: async ({
        where,
        data,
      }: {
        where: { userId_key: { userId: string; key: string } };
        data: { orderId: string; responseCode: string };
      }) => {
        const existing = idempotencyKeys.find(
          (item) => item.userId === where.userId_key.userId && item.key === where.userId_key.key,
        );
        Object.assign(existing!, data);
      },
    },
    cartItem: {
      findMany: async ({ where }: { where: { cart: { userId: string } } }) =>
        cartItems
          .filter((item) => item.cart.userId === where.cart.userId)
          .sort((left, right) => left.productId.localeCompare(right.productId))
          .map((item) => ({ ...item, product: products.get(item.productId)! })),
      deleteMany: async ({ where }: { where: { cart: { userId: string } } }) => {
        for (let index = cartItems.length - 1; index >= 0; index -= 1) {
          if (cartItems[index].cart.userId === where.cart.userId) {
            cartItems.splice(index, 1);
          }
        }
      },
    },
    product: {
      updateMany: async ({
        where,
        data,
      }: {
        where: { id: string; isActive: true; stock: { gte: number } };
        data: { stock: { decrement: number } };
      }) => {
        const product = products.get(where.id);
        if (!product || !product.isActive || product.stock < where.stock.gte) {
          return { count: 0 };
        }
        product.stock -= data.stock.decrement;
        return { count: 1 };
      },
    },
    order: {
      create: async ({
        data,
      }: {
        data: { userId: string; totalCents: number; items: { create: OrderItemCreate[] } };
      }) => {
        const order = {
          id: `order-${orders.length + 1}`,
          userId: data.userId,
          status: 'placed' as const,
          totalCents: data.totalCents,
          items: data.items.create.map((item, index) => ({ ...item, id: `order-item-${index + 1}` })),
          createdAt: new Date('2026-08-03T10:00:00.000Z'),
        };
        orders.push(order);
        return order;
      },
      findFirst: async ({ where }: { where: { id: string; userId: string } }) =>
        orders.find((order) => order.id === where.id && order.userId === where.userId) ?? null,
      findMany: async ({ where }: { where: { userId: string } }) =>
        orders.filter((order) => order.userId === where.userId),
    },
  };

  const prisma = {
    $transaction: async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx),
    order: {
      findMany: tx.order.findMany,
    },
  };

  return {
    cartItems,
    orders,
    products,
    repository: new OrderRepository(prisma as unknown as PrismaService),
  };
}

describe('OrderRepository checkout', () => {
  it('creates an order, decrements stock, stores snapshots, and clears the user cart', async () => {
    const { cartItems, orders, products, repository } = createPrisma(2);

    await expect(repository.checkout(userA, 'checkout-key-1')).resolves.toMatchObject({
      userId: userA,
      totalCents: 4599,
      items: [{ productId, productName: 'Minimal Desk Lamp', unitPriceCents: 4599, quantity: 1 }],
    });

    expect(products.get(productId)?.stock).toBe(1);
    expect(cartItems.some((item) => item.cart.userId === userA)).toBe(false);
    expect(orders).toHaveLength(1);
  });

  it('rejects insufficient stock without creating an order', async () => {
    const { orders, repository } = createPrisma(0);

    await expect(repository.checkout(userA, 'checkout-key-2')).rejects.toMatchObject({
      code: 'INSUFFICIENT_STOCK',
    } satisfies Partial<AppError>);
    expect(orders).toHaveLength(0);
  });

  it('replays identical checkout retries and rejects changed cart reuse', async () => {
    const { cartItems, repository } = createPrisma(3);
    const firstOrder = await repository.checkout(userA, 'checkout-key-3');

    await expect(repository.checkout(userA, 'checkout-key-3')).resolves.toMatchObject({ id: firstOrder.id });

    cartItems.push({ id: 'cart-item-a2', cart: { userId: userA }, productId: otherProductId, quantity: 1 });
    await expect(repository.checkout(userA, 'checkout-key-3')).rejects.toMatchObject({
      code: 'IDEMPOTENCY_KEY_REUSED',
    } satisfies Partial<AppError>);
  });

  it('allows only one concurrent final-unit checkout to succeed', async () => {
    const { products, repository } = createPrisma(1);
    const results = await Promise.allSettled([
      repository.checkout(userA, 'checkout-key-4a'),
      repository.checkout(userB, 'checkout-key-4b'),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    expect(products.get(productId)?.stock).toBe(0);
  });

  it('lists only one user orders', async () => {
    const { repository } = createPrisma(3);

    await repository.checkout(userA, 'checkout-key-5a');
    await repository.checkout(userB, 'checkout-key-5b');

    await expect(repository.listForUser(userA)).resolves.toEqual([expect.objectContaining({ userId: userA })]);
  });
});
