import type { AuthUser } from '@vps-template/contracts/auth';
import type { Cart } from '@vps-template/contracts/cart';
import type { Order } from '@vps-template/contracts/orders';
import type { Product } from '@vps-template/contracts/products';

export type View = 'catalog' | 'detail' | 'cart' | 'checkout' | 'orders' | 'admin';

export type ApiError = {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export type ProductForm = {
  name: string;
  description: string;
  priceCents: string;
  imageUrl: string;
  stock: string;
};

export type AuthMode = 'login' | 'register';

export type AppState = {
  view: View;
  products: Product[];
  selectedProductId: string | null;
  selectedProduct: Product | null;
  cart: Cart | null;
  cartCount: number;
  orders: Order[];
  user: AuthUser | null;
  token: string;
  authMode: AuthMode;
  email: string;
  password: string;
  adminForm: ProductForm;
  editingProductId: string | null;
  notice: string;
  error: string;
  isBusy: boolean;
};
