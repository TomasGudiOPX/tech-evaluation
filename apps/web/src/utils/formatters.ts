import type { Product } from '@vps-template/contracts/products';
import type { ProductForm } from '../types';

export function money(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export function blankProductForm(): ProductForm {
  return {
    name: '',
    description: '',
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
