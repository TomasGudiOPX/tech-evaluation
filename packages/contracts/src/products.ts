import { z } from 'zod';

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  priceCents: z.number().int().positive(),
  imageUrl: z.string().url(),
  stock: z.number().int().min(0),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(1000),
  priceCents: z.number().int().positive(),
  imageUrl: z.string().trim().url().max(2048),
  stock: z.number().int().min(0),
});

export const updateProductSchema = createProductSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one product field is required',
});

export type Product = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
