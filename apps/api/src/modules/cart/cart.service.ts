import { Injectable } from '@nestjs/common';
import type { Cart } from '@vps-template/contracts/cart';
import { cartItemMutationSchema } from '@vps-template/contracts/cart';
import { z } from 'zod';
import { AppError } from '../../platform/app-error.js';
import { CartRepository } from './cart.repository.js';
import { toCart } from './cart.types.js';

const productIdSchema = z.string().uuid();

@Injectable()
export class CartService {
  constructor(private readonly repository: CartRepository) {}

  async get(userId: string): Promise<Cart> {
    return toCart(await this.repository.getOrCreate(userId));
  }

  async addItem(userId: string, input: unknown): Promise<Cart> {
    const parsed = cartItemMutationSchema.parse(input);
    await this.ensureEligibleProduct(parsed.productId);

    return toCart(await this.repository.addItem(userId, parsed.productId, parsed.quantity));
  }

  async updateItem(userId: string, productId: string, input: unknown): Promise<Cart> {
    const parsedProductId = productIdSchema.parse(productId);
    const parsed = cartItemMutationSchema.pick({ quantity: true }).parse(input);
    await this.ensureEligibleProduct(parsedProductId);

    const cart = await this.repository.updateItem(userId, parsedProductId, parsed.quantity);

    if (!cart) {
      throw new AppError(404, 'CART_ITEM_NOT_FOUND', 'Cart item not found');
    }

    return toCart(cart);
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const parsedProductId = productIdSchema.parse(productId);
    const cart = await this.repository.removeItem(userId, parsedProductId);

    if (!cart) {
      throw new AppError(404, 'CART_ITEM_NOT_FOUND', 'Cart item not found');
    }

    return toCart(cart);
  }

  private async ensureEligibleProduct(productId: string) {
    const product = await this.repository.findActiveProduct(productId);

    if (!product || product.stock <= 0) {
      throw new AppError(404, 'CART_PRODUCT_NOT_FOUND', 'Product not found');
    }
  }
}
