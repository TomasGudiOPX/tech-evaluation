import type { ApiError } from '../types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';
export const tokenStorageKey = 'shopping-cart-token';

export async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });
  const data = (await response.json().catch(() => ({}))) as T | ApiError;

  if (!response.ok) {
    throw new Error((data as ApiError).message ?? (data as ApiError).code ?? 'Request failed');
  }

  return data as T;
}
