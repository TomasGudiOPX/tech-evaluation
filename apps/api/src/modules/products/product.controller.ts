import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { ProductService } from './product.service.js';

@Controller('api/products')
export class ProductController {
  constructor(private readonly products: ProductService) {}

  @Get()
  async list() {
    return { products: await this.products.listActive() };
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return { product: await this.products.getActive(id) };
  }
}

@Controller('api/admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminProductController {
  constructor(private readonly products: ProductService) {}

  @Post()
  async create(@Body() body: unknown) {
    return { product: await this.products.create(body) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: unknown) {
    return { product: await this.products.update(id, body) };
  }

  @Delete(':id')
  async retire(@Param('id') id: string) {
    return { product: await this.products.retire(id) };
  }
}
