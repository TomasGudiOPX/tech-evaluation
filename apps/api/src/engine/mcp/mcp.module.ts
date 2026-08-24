import { Module } from '@nestjs/common';
import { ActionsModule } from '../../modules/actions/action.module.js';
import { AuthModule } from '../../modules/auth/auth.module.js';
import { CartModule } from '../../modules/cart/cart.module.js';
import { OrderModule } from '../../modules/orders/order.module.js';
import { ProductModule } from '../../modules/products/product.module.js';
import { ReviewsModule } from '../../modules/reviews/review.module.js';
import { McpController } from './mcp.controller.js';

@Module({
  imports: [ProductModule, OrderModule, CartModule, ReviewsModule, AuthModule, ActionsModule],
  controllers: [McpController],
})
export class McpModule {}
