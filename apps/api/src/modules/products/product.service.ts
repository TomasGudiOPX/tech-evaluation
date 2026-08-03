import { Injectable } from '@nestjs/common';
import type { Product } from '@vps-template/contracts/products';
import { createProductSchema, updateProductSchema } from '@vps-template/contracts/products';
import { z } from 'zod';
import { AppError } from '../../platform/app-error.js';
import { ProductRepository } from './product.repository.js';
import { toProduct } from './product.types.js';

const productIdSchema = z.string().uuid();

@Injectable()
export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async listActive(): Promise<Product[]> {
    return (await this.repository.listActive()).map(toProduct);
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

  private async ensureExists(id: string) {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }
  }
}
