import { Controller, Get, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { OrderService } from './order.service.js';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('api/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orders: OrderService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Simulate checkout and create an idempotent order' })
  @ApiHeader({ name: 'Idempotency-Key', required: true, description: 'Unique key for retry-safe checkout requests.' })
  async checkout(@Req() request: AuthenticatedRequest, @Headers('idempotency-key') idempotencyKey: string | undefined) {
    return { order: await this.orders.checkout(request.user!.id, idempotencyKey) };
  }

  @Get()
  @ApiOperation({ summary: 'List the authenticated customer order history' })
  async list(@Req() request: AuthenticatedRequest) {
    return { orders: await this.orders.listForUser(request.user!.id) };
  }
}
