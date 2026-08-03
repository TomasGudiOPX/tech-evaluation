import { Injectable } from '@nestjs/common';
import type { CreateProductInput, UpdateProductInput } from '@vps-template/contracts/products';
import { PrismaService } from '../../platform/prisma.service.js';
import type { ProductRow } from './product.types.js';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listActive(): Promise<ProductRow[]> {
    return this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveById(id: string): Promise<ProductRow | null> {
    return this.prisma.product.findFirst({
      where: { id, isActive: true },
    });
  }

  async findById(id: string): Promise<ProductRow | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async create(input: CreateProductInput): Promise<ProductRow> {
    return this.prisma.product.create({
      data: input,
    });
  }

  async update(id: string, input: UpdateProductInput): Promise<ProductRow> {
    return this.prisma.product.update({
      where: { id },
      data: input,
    });
  }

  async retire(id: string): Promise<ProductRow> {
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
