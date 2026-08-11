import { Injectable } from '@nestjs/common';
import type { CreateProductInput, UpdateProductInput } from '@vps-template/contracts/products';
import { PrismaService } from '../../platform/prisma.service.js';
import type { ProductRow } from './product.types.js';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listActive(page?: number, pageSize?: number): Promise<{ items: ProductRow[]; total: number }> {
    const where = { isActive: true };
    const total = await this.prisma.product.count({ where });
    const skip = page && pageSize ? (page - 1) * pageSize : undefined;
    const items = await this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...(skip !== undefined ? { skip, take: pageSize } : {}),
    });

    return { items, total };
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

  async searchByName(query: string, take: number): Promise<ProductRow[]> {
    return this.prisma.product.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take,
    });
  }

  async listFiltered(
    filters: { category?: string; maxPriceCents?: number; activeOnly?: boolean },
    take: number,
  ): Promise<ProductRow[]> {
    const where: Record<string, unknown> = {};
    if (filters.category) where.category = filters.category;
    if (filters.maxPriceCents !== undefined) where.priceCents = { lte: filters.maxPriceCents };
    if (filters.activeOnly !== false) where.isActive = true;
    return this.prisma.product.findMany({ where, take });
  }
}
