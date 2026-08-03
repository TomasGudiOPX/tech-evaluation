import { z } from 'zod';

export const orderStatusSchema = z.enum(['placed']);

export const orderItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string(),
  unitPriceCents: z.number().int().positive(),
  quantity: z.number().int().positive(),
  lineTotalCents: z.number().int().positive(),
});

export const orderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  status: orderStatusSchema,
  totalCents: z.number().int().min(0),
  items: z.array(orderItemSchema),
  createdAt: z.string(),
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
