import type { Product, ProductCategory } from '@vps-template/contracts/products';

export type ProductRow = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  priceCents: number;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function toProduct(row: ProductRow): Product {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
