import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { OrderController } from './order.controller.js';
import { OrderRepository } from './order.repository.js';
import { OrderService } from './order.service.js';

@Module({
  imports: [AuthModule],
  controllers: [OrderController],
  providers: [OrderRepository, OrderService],
})
export class OrderModule {}
