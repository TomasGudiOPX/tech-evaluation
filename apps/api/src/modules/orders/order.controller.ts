import { Controller, Get, Headers, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { OrderService } from './order.service.js';

@Controller('api/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orders: OrderService) {}

  @Post('checkout')
  async checkout(@Req() request: AuthenticatedRequest, @Headers('idempotency-key') idempotencyKey: string | undefined) {
    return { order: await this.orders.checkout(request.user!.id, idempotencyKey) };
  }

  @Get()
  async list(@Req() request: AuthenticatedRequest) {
    return { orders: await this.orders.listForUser(request.user!.id) };
  }
}
