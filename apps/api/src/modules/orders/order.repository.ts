import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { AppError } from '../../platform/app-error.js';
import { PrismaService } from '../../platform/prisma.service.js';
import type { OrderRow } from './order.types.js';

type CheckoutTransaction = Prisma.TransactionClient;
type CheckoutCartItem = {
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    priceCents: number;
    isActive: boolean;
  };
};

const orderInclude = {
  items: {
    orderBy: { id: 'asc' as const },
  },
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function fingerprint(userId: string, items: CheckoutCartItem[]) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        userId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    )
    .digest('hex');
}

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string): Promise<OrderRow[]> {
    return this.prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async checkout(userId: string, key: string): Promise<OrderRow> {
    try {
      return await this.prisma.$transaction((tx) => this.checkoutInTransaction(tx, userId, key));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return this.checkout(userId, key);
      }

      throw error;
    }
  }

  private async checkoutInTransaction(tx: CheckoutTransaction, userId: string, key: string): Promise<OrderRow> {
    const existingKey = await tx.checkoutIdempotencyKey.findUnique({
      where: {
        userId_key: { userId, key },
      },
    });

    if (existingKey?.orderId) {
      const currentItems = await this.cartItemsForCheckout(tx, userId);
      const currentFingerprint =
        currentItems.length > 0 ? fingerprint(userId, currentItems) : existingKey.requestFingerprint;

      if (currentFingerprint !== existingKey.requestFingerprint) {
        throw new AppError(
          409,
          'IDEMPOTENCY_KEY_REUSED',
          'Idempotency key was reused for a different checkout request',
        );
      }

      const order = await this.findOrder(tx, userId, existingKey.orderId);

      if (order) {
        return order;
      }
    }

    const cartItems = await this.cartItemsForCheckout(tx, userId);

    if (cartItems.length === 0) {
      throw new AppError(409, 'CART_EMPTY', 'Cart is empty');
    }

    if (cartItems.some((item) => !item.product.isActive)) {
      throw new AppError(404, 'CART_PRODUCT_NOT_FOUND', 'Product not found');
    }

    const requestFingerprint = fingerprint(userId, cartItems);

    if (existingKey && existingKey.requestFingerprint !== requestFingerprint) {
      throw new AppError(409, 'IDEMPOTENCY_KEY_REUSED', 'Idempotency key was reused for a different checkout request');
    }

    if (!existingKey) {
      await tx.checkoutIdempotencyKey.create({
        data: {
          userId,
          key,
          requestFingerprint,
          responseCode: 'PENDING',
          expiresAt: new Date(Date.now() + DAY_IN_MS),
        },
      });
    }

    const orderItems = [];

    for (const item of cartItems) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          isActive: true,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (updated.count !== 1) {
        throw new AppError(409, 'INSUFFICIENT_STOCK', 'Insufficient stock for one or more products');
      }

      orderItems.push({
        productId: item.productId,
        productName: item.product.name,
        unitPriceCents: item.product.priceCents,
        quantity: item.quantity,
        lineTotalCents: item.product.priceCents * item.quantity,
      });
    }

    const totalCents = orderItems.reduce((total, item) => total + item.lineTotalCents, 0);
    const order = await tx.order.create({
      data: {
        userId,
        totalCents,
        items: {
          create: orderItems,
        },
      },
      include: orderInclude,
    });

    await tx.checkoutIdempotencyKey.update({
      where: {
        userId_key: { userId, key },
      },
      data: {
        orderId: order.id,
        responseCode: 'ORDER_CREATED',
      },
    });

    await tx.cartItem.deleteMany({
      where: {
        cart: { userId },
      },
    });

    return order;
  }

  private async cartItemsForCheckout(tx: CheckoutTransaction, userId: string) {
    return tx.cartItem.findMany({
      where: {
        cart: { userId },
      },
      include: { product: true },
      orderBy: { productId: 'asc' },
    });
  }

  private async findOrder(tx: CheckoutTransaction, userId: string, orderId: string): Promise<OrderRow | null> {
    return tx.order.findFirst({
      where: { id: orderId, userId },
      include: orderInclude,
    });
  }
}
