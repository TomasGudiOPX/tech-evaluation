import { z } from 'zod';
import { productSchema } from './products.js';

export const cartItemMutationSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  product: productSchema,
  lineTotalCents: z.number().int().min(0),
});

export const cartSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  items: z.array(cartItemSchema),
  totalCents: z.number().int().min(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CartItemMutationInput = z.infer<typeof cartItemMutationSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;
