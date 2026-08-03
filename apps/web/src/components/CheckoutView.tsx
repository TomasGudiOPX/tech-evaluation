import type { Cart } from '@vps-template/contracts/cart';
import type { View } from '../types';
import { money } from '../utils/formatters';

interface CheckoutViewProps {
  cart: Cart | null;
  setView: (view: View) => void;
  onCheckout: () => Promise<void>;
  isBusy: boolean;
}

export function CheckoutView({ cart, setView, onCheckout, isBusy }: CheckoutViewProps) {
  const items = cart?.items ?? [];
  const totalCents = cart?.totalCents ?? 0;

  return (
    <section className="checkout-section">
      <div className="checkout-layout">
        <div className="checkout-main-panel">
          <div className="panel-header">
            <span className="eyebrow">Simulated Checkout</span>
            <h1 className="panel-title">Review and Place Order</h1>
            <p className="checkout-subtitle">
              Order processing guarantees atomic idempotency. No actual credit card charge will occur.
            </p>
          </div>

          <div className="checkout-details-card">
            <h3>Delivery & Payment Preview</h3>

            <div className="readonly-grid">
              <div className="readonly-field">
                <span className="field-label">Delivery Method</span>
                <span className="field-value">Standard Shipping (Complimentary)</span>
              </div>
              <div className="readonly-field">
                <span className="field-label">Estimated Delivery</span>
                <span className="field-value">2 - 4 Business Days</span>
              </div>
              <div className="readonly-field">
                <span className="field-label">Payment Authorization</span>
                <span className="field-value">Simulated Instant Approval</span>
              </div>
              <div className="readonly-field">
                <span className="field-label">Idempotency Status</span>
                <span className="field-value badge-key">Unique Key Generated</span>
              </div>
            </div>
          </div>

          <div className="checkout-items-preview">
            <h3>Items in Order ({items.length})</h3>
            <div className="checkout-items-list">
              {items.map((item) => (
                <div className="checkout-item-row" key={item.productId}>
                  <img className="checkout-item-thumb" alt={item.product.name} src={item.product.imageUrl} />
                  <div className="checkout-item-details">
                    <strong>{item.product.name}</strong>
                    <span>
                      {item.quantity} &times; {money(item.product.priceCents)}
                    </span>
                  </div>
                  <strong className="checkout-item-total">{money(item.lineTotalCents)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="summary-sidebar">
          <div className="summary-card">
            <h2>Order Total</h2>

            <div className="summary-row">
              <span>Items Total</span>
              <span>{money(totalCents)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-shipping-tag">FREE</span>
            </div>

            <hr className="summary-divider" />

            <div className="summary-row summary-total-row">
              <span>Total Due</span>
              <strong>{money(totalCents)}</strong>
            </div>

            <button
              className="primary-btn place-order-btn"
              disabled={items.length === 0 || isBusy}
              onClick={() => void onCheckout()}
              type="button"
            >
              {isBusy ? (
                <span className="btn-spinner"></span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Place Order</span>
                </>
              )}
            </button>

            <button className="secondary-btn back-to-cart-btn" onClick={() => setView('cart')} type="button">
              Return to Cart
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
