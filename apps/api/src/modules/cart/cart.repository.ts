import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma.service.js';
import type { CartRow } from './cart.types.js';

const cartInclude = {
  items: {
    include: { product: true },
    orderBy: { createdAt: 'asc' as const },
  },
};

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(userId: string): Promise<CartRow> {
    const existing = await this.findByUser(userId);

    if (existing) {
      return existing;
    }

    return this.prisma.cart.create({
      data: { userId },
      include: cartInclude,
    });
  }

  async findActiveProduct(productId: string) {
    return this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<CartRow> {
    const cart = await this.getOrCreate(userId);

    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
    });

    return this.getOrCreate(userId);
  }

  async updateItem(userId: string, productId: string, quantity: number): Promise<CartRow | null> {
    const item = await this.prisma.cartItem.findFirst({
      where: {
        productId,
        cart: { userId },
      },
    });

    if (!item) {
      return null;
    }

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    return this.getOrCreate(userId);
  }

  async removeItem(userId: string, productId: string): Promise<CartRow | null> {
    const result = await this.prisma.cartItem.deleteMany({
      where: {
        productId,
        cart: { userId },
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.getOrCreate(userId);
  }

  private async findByUser(userId: string): Promise<CartRow | null> {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });
  }
}
