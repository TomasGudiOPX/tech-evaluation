import type { Order } from '@vps-template/contracts/orders';
import { formatDate, money } from '../utils/formatters';

interface OrdersViewProps {
  orders: Order[];
}

export function OrdersView({ orders }: OrdersViewProps) {
  return (
    <section className="orders-section view-transition">
      <div className="orders-header">
        <h1 className="panel-title">Order History</h1>
        <p className="orders-subtitle">View past transactions, item breakdowns, and order summaries.</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders-state">
          <div className="empty-orders-icon">
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h2>No orders placed yet</h2>
          <p>Orders you submit during your session will appear here.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card-header">
                <div className="order-meta">
                  <span className="order-id">Order #{order.id.slice(0, 8)}</span>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <div className="order-status-group">
                  <span className="status-badge badge-success">{order.status.toUpperCase()}</span>
                  <strong className="order-total">{money(order.totalCents)}</strong>
                </div>
              </div>

              <div className="order-items-table">
                {order.items.map((item) => (
                  <div className="order-item-row" key={item.id}>
                    <span className="order-item-name">{item.productName}</span>
                    <span className="order-item-qty">
                      {item.quantity} &times; {money(item.unitPriceCents)}
                    </span>
                    <strong className="order-item-line-total">{money(item.lineTotalCents)}</strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
