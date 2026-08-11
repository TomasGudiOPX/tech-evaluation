import type { Cart } from '@vps-template/contracts/cart';
import { toProduct, type ProductRow } from '../products/product.types.js';

export type CartItemRow = {
  id: string;
  productId: string;
  quantity: number;
  product: ProductRow;
};

export type CartRow = {
  id: string;
  userId: string;
  items: CartItemRow[];
  createdAt: Date;
  updatedAt: Date;
};

export function toCart(row: CartRow): Cart {
  const items = row.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    product: toProduct(item.product),
    lineTotalCents: item.product.priceCents * item.quantity,
  }));

  return {
    id: row.id,
    userId: row.userId,
    items,
    totalCents: items.reduce((total, item) => total + item.lineTotalCents, 0),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
