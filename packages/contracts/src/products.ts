import { z } from 'zod';

export const productCategorySchema = z.enum(['workspace', 'bags', 'kitchen', 'decor', 'wellness', 'travel']);

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  sku: z.string().nullable(),
  description: z.string(),
  category: productCategorySchema,
  priceCents: z.number().int().positive(),
  imageUrl: z.string().url(),
  stock: z.number().int().min(0),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(120),
  sku: z.string().trim().min(1).max(64).optional(),
  description: z.string().trim().min(1).max(1000),
  category: productCategorySchema,
  priceCents: z.number().int().positive(),
  imageUrl: z.string().trim().url().max(2048),
  stock: z.number().int().min(0),
});

export const updateProductSchema = createProductSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one product field is required',
});

export const paginationSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export const productListResponseSchema = z.object({
  products: z.array(productSchema),
  pagination: paginationSchema,
});

export type ProductCategory = z.infer<typeof productCategorySchema>;
export type Product = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type ProductListResponse = z.infer<typeof productListResponseSchema>;
