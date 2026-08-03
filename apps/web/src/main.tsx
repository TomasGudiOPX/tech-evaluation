import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { AuthTokenResponse, AuthUser } from '@vps-template/contracts/auth';
import type { Cart } from '@vps-template/contracts/cart';
import type { Order } from '@vps-template/contracts/orders';
import type { Product } from '@vps-template/contracts/products';
import './styles.css';

type View = 'catalog' | 'detail' | 'cart' | 'checkout' | 'orders' | 'admin';
type ApiError = { code: string; message: string; fieldErrors?: Record<string, string[]> };
type ProductForm = {
  name: string;
  description: string;
  priceCents: string;
  imageUrl: string;
  stock: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';
const tokenStorageKey = 'shopping-cart-token';

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function blankProductForm(): ProductForm {
  return {
    name: '',
    description: '',
    priceCents: '',
    imageUrl: '',
    stock: '',
  };
}

function productForm(product?: Product): ProductForm {
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

function parseProductForm(form: ProductForm) {
  return {
    name: form.name,
    description: form.description,
    priceCents: Number(form.priceCents),
    imageUrl: form.imageUrl,
    stock: Number(form.stock),
  };
}

function newIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function errorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return 'Unexpected error';
}

function App() {
  const [view, setView] = useState<View>('catalog');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState(() => localStorage.getItem(tokenStorageKey) ?? '');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
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

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
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

  async function loadProducts() {
    const data = await request<{ products: Product[] }>('/products', { headers: { 'Content-Type': 'application/json' } });
    setProducts(data.products);
    setSelectedProductId((current) => current ?? data.products[0]?.id ?? null);
    setNotice(data.products.length > 0 ? 'Catalog ready' : 'Seed products to start the demo');
  }

  async function loadCart() {
    if (!token) return;
    setCart((await request<{ cart: Cart }>('/cart')).cart);
  }

  async function loadOrders() {
    if (!token) return;
    setOrders((await request<{ orders: Order[] }>('/orders')).orders);
  }

  async function loadProfile() {
    if (!token) return;

    try {
      setUser((await request<{ user: AuthUser }>('/auth/profile')).user);
      await Promise.all([loadCart(), loadOrders()]);
    } catch {
      localStorage.removeItem(tokenStorageKey);
      setToken('');
      setUser(null);
      setCart(null);
      setOrders([]);
    }
  }

  async function withFeedback(action: () => Promise<void>, success: string) {
    setIsBusy(true);
    setError('');

    try {
      await action();
      setNotice(success);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setIsBusy(false);
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
      const data = await request<AuthTokenResponse>(`/auth/${authMode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem(tokenStorageKey, data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      setView('catalog');
    }, authMode === 'login' ? 'Signed in' : 'Account created');
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
      setError('Sign in to add products to your cart.');
      return;
    }

    await withFeedback(async () => {
      setCart((await request<{ cart: Cart }>('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) })).cart);
      setView('cart');
    }, 'Added to cart');
  }

  async function updateCartItem(productId: string, quantity: number) {
    await withFeedback(async () => {
      setCart(
        (
          await request<{ cart: Cart }>(`/cart/items/${productId}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity }),
          })
        ).cart,
      );
    }, 'Cart updated');
  }

  async function removeCartItem(productId: string) {
    await withFeedback(async () => {
      setCart((await request<{ cart: Cart }>(`/cart/items/${productId}`, { method: 'DELETE' })).cart);
    }, 'Cart updated');
  }

  async function checkout() {
    await withFeedback(async () => {
      const data = await request<{ order: Order }>('/orders/checkout', {
        method: 'POST',
        headers: { 'Idempotency-Key': newIdempotencyKey() },
      });
      setOrders([data.order, ...orders.filter((order) => order.id !== data.order.id)]);
      await Promise.all([loadCart(), loadProducts()]);
      setView('orders');
    }, 'Order placed');
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await withFeedback(async () => {
      const path = editingProductId ? `/admin/products/${editingProductId}` : '/admin/products';
      const method = editingProductId ? 'PATCH' : 'POST';
      await request(path, { method, body: JSON.stringify(parseProductForm(adminForm)) });
      setAdminForm(blankProductForm());
      setEditingProductId(null);
      await loadProducts();
    }, editingProductId ? 'Product updated' : 'Product created');
  }

  async function retireProduct(productId: string) {
    await withFeedback(async () => {
      await request(`/admin/products/${productId}`, { method: 'DELETE' });
      await loadProducts();
    }, 'Product retired');
  }

  function startEditing(product: Product) {
    setEditingProductId(product.id);
    setAdminForm(productForm(product));
  }

  return (
    <main>
      <header className="site-header">
        <button className="brand" onClick={() => setView('catalog')} type="button">
          <span className="brand-mark">SC</span>
          <span>Shopping Cart</span>
        </button>
        <nav aria-label="Main navigation">
          <button className={view === 'catalog' || view === 'detail' ? 'active' : ''} onClick={() => setView('catalog')} type="button">
            Catalog
          </button>
          <button className={view === 'cart' ? 'active' : ''} onClick={() => setView('cart')} type="button">
            Cart <span>{cartCount}</span>
          </button>
          <button className={view === 'orders' ? 'active' : ''} onClick={() => setView('orders')} type="button">
            Orders
          </button>
          {user?.role === 'admin' && (
            <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')} type="button">
              Admin
            </button>
          )}
        </nav>
        <div className="account">
          {user ? (
            <>
              <span>{user.email}</span>
              <button className="ghost" onClick={logout} type="button">
                Sign out
              </button>
            </>
          ) : (
            <span>Guest</span>
          )}
        </div>
      </header>

      {(notice || error) && (
        <section className={`banner ${error ? 'banner-error' : ''}`} aria-live="polite">
          {error || notice}
        </section>
      )}

      {!user && (
        <section className="auth-panel" aria-label="Authentication">
          <div>
            <p className="eyebrow">Secure account</p>
            <h1>Sign in to use cart and checkout</h1>
          </div>
          <form onSubmit={authenticate}>
            <div className="segmented">
              <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')} type="button">
                Login
              </button>
              <button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')} type="button">
                Register
              </button>
            </div>
            <label>
              Email
              <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
            </label>
            <label>
              Password
              <input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
            </label>
            <button disabled={isBusy} type="submit">
              {authMode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </section>
      )}

      {view === 'catalog' && (
        <section className="catalog">
          <div className="hero">
            <p className="eyebrow">Curated essentials</p>
            <h1>Quiet objects for focused everyday living.</h1>
            <p>Browse the seeded catalog, add products to an authenticated cart, and complete a simulated checkout.</p>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <button
                  className="image-button"
                  onClick={() => {
                    setSelectedProductId(product.id);
                    setView('detail');
                  }}
                  type="button"
                >
                  <img alt={product.name} src={product.imageUrl} />
                </button>
                <div className="product-meta">
                  <button
                    className="link-button"
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setView('detail');
                    }}
                    type="button"
                  >
                    {product.name}
                  </button>
                  <strong>{money(product.priceCents)}</strong>
                </div>
                <p>{product.description}</p>
                <footer>
                  <span className={product.stock > 0 ? 'pill' : 'pill danger'}>{product.stock} in stock</span>
                  <button disabled={product.stock <= 0 || isBusy} onClick={() => void addToCart(product.id)} type="button">
                    Add
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </section>
      )}

      {view === 'detail' && selectedProduct && (
        <section className="detail">
          <img alt={selectedProduct.name} src={selectedProduct.imageUrl} />
          <div>
            <p className="eyebrow">Product detail</p>
            <h1>{selectedProduct.name}</h1>
            <p>{selectedProduct.description}</p>
            <div className="detail-row">
              <strong>{money(selectedProduct.priceCents)}</strong>
              <span className="pill">{selectedProduct.stock} available</span>
            </div>
            <button disabled={selectedProduct.stock <= 0 || isBusy} onClick={() => void addToCart(selectedProduct.id)} type="button">
              Add to cart
            </button>
          </div>
        </section>
      )}

      {view === 'cart' && (
        <section className="split">
          <div className="panel">
            <h1>Your cart</h1>
            {!cart?.items.length && <p className="muted">Your cart is empty.</p>}
            {cart?.items.map((item) => (
              <article className="line-item" key={item.productId}>
                <img alt={item.product.name} src={item.product.imageUrl} />
                <div>
                  <strong>{item.product.name}</strong>
                  <p>{money(item.product.priceCents)} each</p>
                </div>
                <input
                  aria-label={`Quantity for ${item.product.name}`}
                  min={1}
                  onChange={(event) => void updateCartItem(item.productId, Number(event.target.value))}
                  type="number"
                  value={item.quantity}
                />
                <strong>{money(item.lineTotalCents)}</strong>
                <button className="ghost danger-text" onClick={() => void removeCartItem(item.productId)} type="button">
                  Remove
                </button>
              </article>
            ))}
          </div>
          <aside className="summary">
            <h2>Order summary</h2>
            <div>
              <span>Subtotal</span>
              <strong>{money(cart?.totalCents ?? 0)}</strong>
            </div>
            <div>
              <span>Shipping</span>
              <strong>Free</strong>
            </div>
            <button disabled={!cart?.items.length} onClick={() => setView('checkout')} type="button">
              Continue to checkout
            </button>
          </aside>
        </section>
      )}

      {view === 'checkout' && (
        <section className="split">
          <div className="panel">
            <p className="eyebrow">Simulated checkout</p>
            <h1>Review and place order</h1>
            <p className="muted">No payment provider is called. Checkout uses an idempotency key and the API transaction creates the order.</p>
            <div className="readonly-form">
              <span>Delivery</span>
              <strong>Standard shipping</strong>
              <span>Payment</span>
              <strong>Simulated payment approval</strong>
            </div>
            <button disabled={!cart?.items.length || isBusy} onClick={() => void checkout()} type="button">
              Place order
            </button>
          </div>
          <aside className="summary">
            <h2>Cart total</h2>
            <div>
              <span>Total</span>
              <strong>{money(cart?.totalCents ?? 0)}</strong>
            </div>
          </aside>
        </section>
      )}

      {view === 'orders' && (
        <section className="panel">
          <h1>Order history</h1>
          {orders.length === 0 && <p className="muted">No orders yet.</p>}
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <header>
                <strong>Order {order.id.slice(0, 8)}</strong>
                <span>{money(order.totalCents)}</span>
              </header>
              {order.items.map((item) => (
                <div className="order-line" key={item.id}>
                  <span>{item.productName}</span>
                  <span>
                    {item.quantity} x {money(item.unitPriceCents)}
                  </span>
                </div>
              ))}
            </article>
          ))}
        </section>
      )}

      {view === 'admin' && user?.role === 'admin' && (
        <section className="admin-layout">
          <form className="admin-form" onSubmit={saveProduct}>
            <p className="eyebrow">Admin</p>
            <h1>{editingProductId ? 'Edit product' : 'Create product'}</h1>
            <label>
              Name
              <input onChange={(event) => setAdminForm({ ...adminForm, name: event.target.value })} value={adminForm.name} />
            </label>
            <label>
              Description
              <textarea onChange={(event) => setAdminForm({ ...adminForm, description: event.target.value })} value={adminForm.description} />
            </label>
            <label>
              Image URL
              <input onChange={(event) => setAdminForm({ ...adminForm, imageUrl: event.target.value })} value={adminForm.imageUrl} />
            </label>
            <div className="form-grid">
              <label>
                Price cents
                <input onChange={(event) => setAdminForm({ ...adminForm, priceCents: event.target.value })} type="number" value={adminForm.priceCents} />
              </label>
              <label>
                Stock
                <input onChange={(event) => setAdminForm({ ...adminForm, stock: event.target.value })} type="number" value={adminForm.stock} />
              </label>
            </div>
            <button disabled={isBusy} type="submit">
              {editingProductId ? 'Save product' : 'Create product'}
            </button>
          </form>
          <div className="admin-table">
            <h1>Products</h1>
            {products.map((product) => (
              <article className="admin-row" key={product.id}>
                <img alt={product.name} src={product.imageUrl} />
                <div>
                  <strong>{product.name}</strong>
                  <span>{money(product.priceCents)}</span>
                </div>
                <span className={product.stock < 6 ? 'pill danger' : 'pill'}>{product.stock}</span>
                <button className="ghost" onClick={() => startEditing(product)} type="button">
                  Edit
                </button>
                <button className="ghost danger-text" onClick={() => void retireProduct(product.id)} type="button">
                  Retire
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
