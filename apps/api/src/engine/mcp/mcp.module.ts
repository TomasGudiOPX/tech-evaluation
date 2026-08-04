import { Module } from '@nestjs/common';
import { ProductModule } from '../../modules/products/product.module.js';
import { McpController } from './mcp.controller.js';

@Module({
  imports: [ProductModule],
  controllers: [McpController],
})
export class McpModule {}
