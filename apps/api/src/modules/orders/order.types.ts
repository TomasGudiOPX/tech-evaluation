import type { Order, OrderStatus } from '@vps-template/contracts/orders';

export type OrderItemRow = {
  id: string;
  productId: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type OrderRow = {
  id: string;
  userId: string;
  status: OrderStatus;
  totalCents: number;
  items: OrderItemRow[];
  createdAt: Date;
};

export function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.userId,
    status: row.status,
    totalCents: row.totalCents,
    items: row.items,
    createdAt: row.createdAt.toISOString(),
  };
}
