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

function createService(products: ProductRow[] = [activeProduct, retiredProduct]) {
  const repository = {
    listActive: vi.fn(async () => products.filter((product) => product.isActive)),
    findActiveById: vi.fn(async (id: string) => products.find((product) => product.id === id && product.isActive) ?? null),
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
  it('lists only active products', async () => {
    const { service } = createService();

    await expect(service.listActive()).resolves.toEqual([
      expect.objectContaining({ id: activeProduct.id, isActive: true }),
    ]);
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
      priceCents: 1999,
      imageUrl: 'https://example.com/mat.jpg',
      stock: 10,
    });

    expect(repository.create).toHaveBeenCalledWith({
      name: 'Desk Mat',
      description: 'Felt mat for a compact desk.',
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
