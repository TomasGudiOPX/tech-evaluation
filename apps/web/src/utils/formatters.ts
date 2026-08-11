import type { Product, ProductCategory } from '@vps-template/contracts/products';
import type { ProductForm } from '../types';

export const productCategoryLabels: Record<ProductCategory, string> = {
  workspace: 'Workspace',
  bags: 'Bags',
  kitchen: 'Kitchen',
  decor: 'Decor',
  wellness: 'Wellness',
  travel: 'Travel',
};

export const productCategoryOptions = Object.entries(productCategoryLabels) as Array<[ProductCategory, string]>;

export const DEMO_EMAIL = 'customer@example.com';
export const DEMO_PASSWORD = 'correct-password';

export function money(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export function categoryLabel(category: ProductCategory): string {
  return productCategoryLabels[category];
}

export function blankProductForm(): ProductForm {
  return {
    name: '',
    description: '',
    category: 'workspace',
    priceCents: '',
    imageUrl: '',
    stock: '',
  };
}

export function productForm(product?: Product): ProductForm {
  return product
    ? {
        name: product.name,
        description: product.description,
        category: product.category,
        priceCents: String(product.priceCents),
        imageUrl: product.imageUrl,
        stock: String(product.stock),
      }
    : blankProductForm();
}

export function parseProductForm(form: ProductForm) {
  return {
    name: form.name,
    description: form.description,
    category: form.category,
    priceCents: Number(form.priceCents),
    imageUrl: form.imageUrl,
    stock: Number(form.stock),
  };
}

export function newIdempotencyKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Unexpected error occurred';
}

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
