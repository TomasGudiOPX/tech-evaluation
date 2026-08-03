import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CartService } from './cart.service.js';

@Controller('api/cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  async get(@Req() request: AuthenticatedRequest) {
    return { cart: await this.cart.get(request.user!.id) };
  }

  @Post('items')
  async addItem(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return { cart: await this.cart.addItem(request.user!.id, body) };
  }

  @Patch('items/:productId')
  async updateItem(@Req() request: AuthenticatedRequest, @Param('productId') productId: string, @Body() body: unknown) {
    return { cart: await this.cart.updateItem(request.user!.id, productId, body) };
  }

  @Delete('items/:productId')
  async removeItem(@Req() request: AuthenticatedRequest, @Param('productId') productId: string) {
    return { cart: await this.cart.removeItem(request.user!.id, productId) };
  }
}
