import { Injectable } from '@nestjs/common';
import type { Order } from '@vps-template/contracts/orders';
import { AppError } from '../../platform/app-error.js';
import { OrderRepository } from './order.repository.js';
import { toOrder } from './order.types.js';

@Injectable()
export class OrderService {
  constructor(private readonly repository: OrderRepository) {}

  async checkout(userId: string, idempotencyKey: string | undefined): Promise<Order> {
    const key = idempotencyKey?.trim();

    if (!key) {
      throw new AppError(400, 'CHECKOUT_IDEMPOTENCY_KEY_REQUIRED', 'Idempotency-Key header is required');
    }

    return toOrder(await this.repository.checkout(userId, key));
  }

  async listForUser(userId: string): Promise<Order[]> {
    return (await this.repository.listForUser(userId)).map(toOrder);
  }

  async listOrders(limit = 50): Promise<Order[]> {
    return (await this.repository.listAll(limit)).map(toOrder);
  }

  async getOrder(id: string): Promise<Order> {
    const order = await this.repository.findById(id);

    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }

    return toOrder(order);
  }
}
