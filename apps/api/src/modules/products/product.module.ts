import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AdminProductController, ProductController } from './product.controller.js';
import { ProductRepository } from './product.repository.js';
import { ProductService } from './product.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ProductController, AdminProductController],
  providers: [ProductRepository, ProductService],
  exports: [ProductService],
})
export class ProductModule {}
