import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { AuthTokenResponse, AuthUser } from '@vps-template/contracts/auth';
import type { Cart } from '@vps-template/contracts/cart';
import type { Order } from '@vps-template/contracts/orders';
import type { Product } from '@vps-template/contracts/products';
import { request, tokenStorageKey } from '../services/api';
import type { AuthMode, ProductForm, View } from '../types';
import { blankProductForm, errorMessage, newIdempotencyKey, parseProductForm, productForm } from '../utils/formatters';

export function useCartState() {
  const [view, setView] = useState<View>('catalog');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState(() => localStorage.getItem(tokenStorageKey) ?? '');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('customer@example.com');
  const [password, setPassword] = useState('correct-password');
  const [adminForm, setAdminForm] = useState<ProductForm>(blankProductForm());
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [notice, setNotice] = useState('Loading catalog...');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? products[0] ?? null,
    [products, selectedProductId],
  );

  const cartCount = cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    return request<T>(path, options, token);
  }

  async function withFeedback(action: () => Promise<void>, successMessage: string) {
    setIsBusy(true);
    setError('');

    try {
      await action();
      setNotice(successMessage);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setIsBusy(false);
    }
  }

  async function loadProducts() {
    const data = await apiRequest<{ products: Product[] }>('/products', {
      headers: { 'Content-Type': 'application/json' },
    });
    setProducts(data.products);
    setSelectedProductId((current) => current ?? data.products[0]?.id ?? null);
    setNotice(data.products.length > 0 ? 'Catalog ready' : 'Seed products to start');
  }

  async function loadCart() {
    if (!token) return;
    setCart((await apiRequest<{ cart: Cart }>('/cart')).cart);
  }

  async function loadOrders() {
    if (!token) return;
    setOrders((await apiRequest<{ orders: Order[] }>('/orders')).orders);
  }

  async function loadProfile() {
    if (!token) return;

    try {
      setUser((await apiRequest<{ user: AuthUser }>('/auth/profile')).user);
      await Promise.all([loadCart(), loadOrders()]);
    } catch {
      localStorage.removeItem(tokenStorageKey);
      setToken('');
      setUser(null);
      setCart(null);
      setOrders([]);
    }
  }

  useEffect(() => {
    void withFeedback(loadProducts, 'Catalog ready');
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [token]);

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await withFeedback(async () => {
      const data = await apiRequest<AuthTokenResponse>(`/auth/${authMode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem(tokenStorageKey, data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      setView('catalog');
    }, authMode === 'login' ? 'Signed in successfully' : 'Account created successfully');
  }

  function logout() {
    localStorage.removeItem(tokenStorageKey);
    setToken('');
    setUser(null);
    setCart(null);
    setOrders([]);
    setNotice('Signed out');
  }

  async function addToCart(productId: string, quantity = 1) {
    if (!user) {
      setView('catalog');
      setError('Please sign in to add products to your cart.');
      return;
    }

    await withFeedback(async () => {
      setCart((await apiRequest<{ cart: Cart }>('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) })).cart);
      setView('cart');
    }, 'Product added to cart');
  }

  async function updateCartItem(productId: string, quantity: number) {
    if (quantity <= 0) {
      await removeCartItem(productId);
      return;
    }

    await withFeedback(async () => {
      setCart(
        (
          await apiRequest<{ cart: Cart }>(`/cart/items/${productId}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity }),
          })
        ).cart,
      );
    }, 'Cart updated');
  }

  async function removeCartItem(productId: string) {
    await withFeedback(async () => {
      setCart((await apiRequest<{ cart: Cart }>(`/cart/items/${productId}`, { method: 'DELETE' })).cart);
    }, 'Item removed from cart');
  }

  async function checkout() {
    await withFeedback(async () => {
      const data = await apiRequest<{ order: Order }>('/orders/checkout', {
        method: 'POST',
        headers: { 'Idempotency-Key': newIdempotencyKey() },
      });
      setOrders([data.order, ...orders.filter((order) => order.id !== data.order.id)]);
      await Promise.all([loadCart(), loadProducts()]);
      setView('orders');
    }, 'Order placed successfully');
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await withFeedback(async () => {
      const path = editingProductId ? `/admin/products/${editingProductId}` : '/admin/products';
      const method = editingProductId ? 'PATCH' : 'POST';
      await apiRequest(path, { method, body: JSON.stringify(parseProductForm(adminForm)) });
      setAdminForm(blankProductForm());
      setEditingProductId(null);
      await loadProducts();
    }, editingProductId ? 'Product updated' : 'Product created');
  }

  async function retireProduct(productId: string) {
    await withFeedback(async () => {
      await apiRequest(`/admin/products/${productId}`, { method: 'DELETE' });
      await loadProducts();
    }, 'Product retired');
  }

  function startEditing(product: Product) {
    setEditingProductId(product.id);
    setAdminForm(productForm(product));
  }

  function cancelEditing() {
    setEditingProductId(null);
    setAdminForm(blankProductForm());
  }

  function clearNotice() {
    setNotice('');
    setError('');
  }

  return {
    view,
    setView,
    products,
    selectedProductId,
    setSelectedProductId,
    selectedProduct,
    cart,
    cartCount,
    orders,
    user,
    authMode,
    setAuthMode,
    email,
    setEmail,
    password,
    setPassword,
    adminForm,
    setAdminForm,
    editingProductId,
    notice,
    error,
    isBusy,
    authenticate,
    logout,
    addToCart,
    updateCartItem,
    removeCartItem,
    checkout,
    saveProduct,
    retireProduct,
    startEditing,
    cancelEditing,
    clearNotice,
  };
}

export type UseCartStateReturn = ReturnType<typeof useCartState>;
