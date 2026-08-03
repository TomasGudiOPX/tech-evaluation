import type { AuthUser } from '@vps-template/contracts/auth';
import type { View } from '../types';

interface HeaderProps {
  view: View;
  setView: (view: View) => void;
  cartCount: number;
  user: AuthUser | null;
  logout: () => void;
}

export function Header({ view, setView, cartCount, user, logout }: HeaderProps) {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => setView('catalog')} type="button">
        <span className="brand-mark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </span>
        <span className="brand-title">LuxeCart</span>
      </button>

      <nav aria-label="Main navigation">
        <button className={view === 'catalog' || view === 'detail' ? 'active' : ''} onClick={() => setView('catalog')} type="button">
          Catalog
        </button>
        <button className={view === 'cart' ? 'active' : ''} onClick={() => setView('cart')} type="button">
          Cart
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
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
          <div className="user-profile">
            <span className="user-avatar" title={user.email}>
              {user.email.charAt(0).toUpperCase()}
            </span>
            <span className="user-email">{user.email}</span>
            <button className="ghost-btn" onClick={logout} type="button">
              Sign out
            </button>
          </div>
        ) : (
          <span className="guest-badge">Guest Session</span>
        )}
      </div>
    </header>
  );
}
