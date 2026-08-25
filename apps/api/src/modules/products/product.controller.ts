import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { ProductService } from './product.service.js';

const productBodySchema = {
  type: 'object',
  required: ['name', 'description', 'category', 'priceCents', 'imageUrl', 'stock'],
  properties: {
    name: { type: 'string', maxLength: 120 },
    sku: { type: 'string', maxLength: 64 },
    description: { type: 'string', maxLength: 1000 },
    category: { type: 'string', enum: ['workspace', 'bags', 'kitchen', 'decor', 'wellness', 'travel'] },
    priceCents: { type: 'integer', minimum: 1 },
    imageUrl: { type: 'string', format: 'uri' },
    stock: { type: 'integer', minimum: 0 },
  },
};

@ApiTags('products')
@Controller('api/products')
export class ProductController {
  constructor(private readonly products: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'List active catalog products' })
  async list(@Query() query: unknown) {
    return this.products.listActive(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one active catalog product' })
  async detail(@Param('id') id: string) {
    return { product: await this.products.getActive(id) };
  }
}

@ApiTags('admin products')
@ApiBearerAuth()
@Controller('api/admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminProductController {
  constructor(private readonly products: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a product as an administrator' })
  @ApiBody({ schema: productBodySchema })
  async create(@Body() body: unknown) {
    return { product: await this.products.create(body) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product as an administrator' })
  @ApiBody({ schema: { ...productBodySchema, required: [] } })
  async update(@Param('id') id: string, @Body() body: unknown) {
    return { product: await this.products.update(id, body) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Retire a product as an administrator' })
  async retire(@Param('id') id: string) {
    return { product: await this.products.retire(id) };
  }
}
