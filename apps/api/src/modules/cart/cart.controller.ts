import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CartService } from './cart.service.js';

const cartItemBodySchema = {
  type: 'object',
  required: ['productId', 'quantity'],
  properties: {
    productId: { type: 'string', format: 'uuid' },
    quantity: { type: 'integer', minimum: 1 },
  },
};

@ApiTags('cart')
@ApiBearerAuth()
@Controller('api/cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get the authenticated customer cart' })
  async get(@Req() request: AuthenticatedRequest) {
    return { cart: await this.cart.get(request.user!.id) };
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an item to the authenticated customer cart' })
  @ApiBody({ schema: cartItemBodySchema })
  async addItem(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return { cart: await this.cart.addItem(request.user!.id, body) };
  }

  @Patch('items/:productId')
  @ApiOperation({ summary: 'Replace a cart item quantity' })
  @ApiBody({
    schema: { type: 'object', required: ['quantity'], properties: { quantity: { type: 'integer', minimum: 1 } } },
  })
  async updateItem(@Req() request: AuthenticatedRequest, @Param('productId') productId: string, @Body() body: unknown) {
    return { cart: await this.cart.updateItem(request.user!.id, productId, body) };
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  async removeItem(@Req() request: AuthenticatedRequest, @Param('productId') productId: string) {
    return { cart: await this.cart.removeItem(request.user!.id, productId) };
  }
}
