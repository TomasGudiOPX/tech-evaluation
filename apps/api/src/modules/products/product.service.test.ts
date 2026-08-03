import { describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import { AppError } from '../../platform/app-error.js';
import { ProductService } from './product.service.js';
import type { ProductRepository } from './product.repository.js';
import type { ProductRow } from './product.types.js';

const activeProduct: ProductRow = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Minimal Desk Lamp',
  description: 'Warm adjustable lamp for focused work sessions.',
  category: 'workspace',
  priceCents: 4599,
  imageUrl: 'https://example.com/lamp.jpg',
  stock: 18,
  isActive: true,
  createdAt: new Date('2026-08-03T10:00:00.000Z'),
  updatedAt: new Date('2026-08-03T10:00:00.000Z'),
};

const retiredProduct: ProductRow = {
  ...activeProduct,
  id: '00000000-0000-4000-8000-000000000002',
  name: 'Retired Product',
  isActive: false,
};

const thirdProduct: ProductRow = {
  ...activeProduct,
  id: '00000000-0000-4000-8000-000000000003',
  name: 'Third Product',
  isActive: true,
};

function createService(products: ProductRow[] = [activeProduct, retiredProduct, thirdProduct]) {
  const repository = {
    listActive: vi.fn(async (page?: number, pageSize?: number) => {
      const active = products.filter((product) => product.isActive);
      const total = active.length;
      const skip = page && pageSize ? (page - 1) * pageSize : undefined;
      const items = skip !== undefined && pageSize ? active.slice(skip, skip + pageSize) : active;
      return { items, total };
    }),
    findActiveById: vi.fn(
      async (id: string) => products.find((product) => product.id === id && product.isActive) ?? null,
    ),
    findById: vi.fn(async (id: string) => products.find((product) => product.id === id) ?? null),
    create: vi.fn(async (input) => ({ ...activeProduct, ...input })),
    update: vi.fn(async (id, input) => ({ ...activeProduct, id, ...input })),
    retire: vi.fn(async (id) => ({ ...activeProduct, id, isActive: false })),
  } satisfies Pick<ProductRepository, 'listActive' | 'findActiveById' | 'findById' | 'create' | 'update' | 'retire'>;

  return {
    repository,
    service: new ProductService(repository as unknown as ProductRepository),
  };
}

describe('ProductService', () => {
  it('lists only active products with full-list pagination metadata', async () => {
    const { service } = createService();

    const result = await service.listActive();

    expect(result.products).toHaveLength(2);
    expect(result.products).toEqual([
      expect.objectContaining({ id: activeProduct.id, isActive: true }),
      expect.objectContaining({ id: thirdProduct.id, isActive: true }),
    ]);
    expect(result.pagination).toEqual({ page: 1, pageSize: 2, total: 2, totalPages: 1 });
  });

  it('pages the product list and reports pagination metadata', async () => {
    const { repository, service } = createService();

    const result = await service.listActive({ page: 2, pageSize: 1 });

    expect(repository.listActive).toHaveBeenCalledWith(2, 1);
    expect(result.products).toHaveLength(1);
    expect(result.pagination).toEqual({ page: 2, pageSize: 1, total: 2, totalPages: 2 });
  });

  it('rejects invalid pagination query params', async () => {
    const { service } = createService();

    await expect(service.listActive({ page: 0 })).rejects.toBeInstanceOf(ZodError);
    await expect(service.listActive({ page: 'abc' })).rejects.toBeInstanceOf(ZodError);
    await expect(service.listActive({ pageSize: 0 })).rejects.toBeInstanceOf(ZodError);
    await expect(service.listActive({ pageSize: 101 })).rejects.toBeInstanceOf(ZodError);
  });

  it('hides retired products from public detail', async () => {
    const { service } = createService();

    await expect(service.getActive(retiredProduct.id)).rejects.toMatchObject({
      code: 'PRODUCT_NOT_FOUND',
    } satisfies Partial<AppError>);
  });

  it('creates valid products', async () => {
    const { repository, service } = createService();

    await service.create({
      name: 'Desk Mat',
      description: 'Felt mat for a compact desk.',
      category: 'workspace',
      priceCents: 1999,
      imageUrl: 'https://example.com/mat.jpg',
      stock: 10,
    });

    expect(repository.create).toHaveBeenCalledWith({
      name: 'Desk Mat',
      description: 'Felt mat for a compact desk.',
      category: 'workspace',
      priceCents: 1999,
      imageUrl: 'https://example.com/mat.jpg',
      stock: 10,
    });
  });

  it('rejects invalid price, stock, text, and image URL', async () => {
    const { service } = createService();

    await expect(
      service.create({
        name: '',
        description: '',
        category: 'invalid-category',
        priceCents: 0,
        imageUrl: 'not-a-url',
        stock: -1,
      }),
    ).rejects.toBeInstanceOf(ZodError);
  });

  it('soft retires products without deleting them', async () => {
    const { repository, service } = createService();

    await expect(service.retire(activeProduct.id)).resolves.toMatchObject({
      id: activeProduct.id,
      isActive: false,
    });
    expect(repository.retire).toHaveBeenCalledWith(activeProduct.id);
  });
});
