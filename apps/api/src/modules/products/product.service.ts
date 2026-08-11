import { Injectable } from '@nestjs/common';
import type { Pagination, Product } from '@vps-template/contracts/products';
import { createProductSchema, updateProductSchema } from '@vps-template/contracts/products';
import { z } from 'zod';
import { AppError } from '../../platform/app-error.js';
import { ProductRepository } from './product.repository.js';
import { toProduct } from './product.types.js';

const productIdSchema = z.string().uuid();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export type ProductListResult = {
  products: Product[];
  pagination: Pagination;
};

@Injectable()
export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async listActive(query: unknown = {}): Promise<ProductListResult> {
    const { page, pageSize } = listQuerySchema.parse(query);
    const currentPage = page ?? 1;
    const { items, total } = await this.repository.listActive(currentPage, pageSize);
    const products = items.map(toProduct);
    const totalPages = pageSize ? Math.ceil(total / pageSize) : 1;

    return {
      products,
      pagination: { page: currentPage, pageSize: pageSize ?? total, total, totalPages },
    };
  }

  async getActive(id: string): Promise<Product> {
    const product = await this.repository.findActiveById(productIdSchema.parse(id));

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }

    return toProduct(product);
  }

  async create(input: unknown): Promise<Product> {
    return toProduct(await this.repository.create(createProductSchema.parse(input)));
  }

  async update(id: string, input: unknown): Promise<Product> {
    const productId = productIdSchema.parse(id);
    await this.ensureExists(productId);

    return toProduct(await this.repository.update(productId, updateProductSchema.parse(input)));
  }

  async retire(id: string): Promise<Product> {
    const productId = productIdSchema.parse(id);
    await this.ensureExists(productId);

    return toProduct(await this.repository.retire(productId));
  }

  async searchByName(query: string): Promise<Product[]> {
    return (await this.repository.searchByName(query, 50)).map(toProduct);
  }

  async listFiltered(filters: { category?: string; maxPriceCents?: number; activeOnly?: boolean }): Promise<Product[]> {
    return (await this.repository.listFiltered(filters, 100)).map(toProduct);
  }

  private async ensureExists(id: string) {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }
  }
}
