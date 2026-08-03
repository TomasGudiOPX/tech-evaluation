import type { Cart } from '@vps-template/contracts/cart';
import type { View } from '../types';
import { money } from '../utils/formatters';

interface CartViewProps {
  cart: Cart | null;
  setView: (view: View) => void;
  onUpdateQuantity: (productId: string, quantity: number) => Promise<void>;
  onRemoveItem: (productId: string) => Promise<void>;
  isBusy: boolean;
}

export function CartView({ cart, setView, onUpdateQuantity, onRemoveItem, isBusy }: CartViewProps) {
  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;

  return (
    <section className="cart-section view-transition">
      <div className="cart-layout">
        <div className="cart-main-panel">
          <div className="panel-header">
            <h1 className="panel-title">Shopping Cart</h1>
            <span className="item-count-label">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {isEmpty ? (
            <div className="empty-cart-state">
              <div className="empty-cart-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <button className="primary-btn explore-btn" onClick={() => setView('catalog')} type="button">
                Explore Catalog
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <article className="cart-item-card" key={item.productId}>
                  <img className="cart-item-img" alt={item.product.name} src={item.product.imageUrl} />

                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.product.name}</h3>
                    <p className="cart-item-unit-price">{money(item.product.priceCents)} each</p>
                  </div>

                  <div className="cart-item-stepper">
                    <button
                      className="stepper-btn"
                      disabled={isBusy}
                      onClick={() => void onUpdateQuantity(item.productId, item.quantity - 1)}
                      type="button"
                      aria-label="Decrease quantity"
                    >
                      &minus;
                    </button>
                    <span className="stepper-val">{item.quantity}</span>
                    <button
                      className="stepper-btn"
                      disabled={item.quantity >= item.product.stock || isBusy}
                      onClick={() => void onUpdateQuantity(item.productId, item.quantity + 1)}
                      type="button"
                      aria-label="Increase quantity"
                    >
                      &#43;
                    </button>
                  </div>

                  <div className="cart-item-total">
                    <span>{money(item.lineTotalCents)}</span>
                  </div>

                  <button
                    className="remove-item-btn"
                    disabled={isBusy}
                    onClick={() => void onRemoveItem(item.productId)}
                    type="button"
                    title="Remove item"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="summary-sidebar">
          <div className="summary-card">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{money(cart?.totalCents ?? 0)}</strong>
            </div>

            <div className="summary-row">
              <span>Estimated Shipping</span>
              <span className="free-shipping-tag">FREE</span>
            </div>

            <div className="summary-row">
              <span>Taxes</span>
              <span>Calculated at checkout</span>
            </div>

            <hr className="summary-divider" />

            <div className="summary-row summary-total-row">
              <span>Total</span>
              <strong>{money(cart?.totalCents ?? 0)}</strong>
            </div>

            <button
              className="primary-btn checkout-btn"
              disabled={isEmpty || isBusy}
              onClick={() => setView('checkout')}
              type="button"
            >
              <span>Proceed to Checkout</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
