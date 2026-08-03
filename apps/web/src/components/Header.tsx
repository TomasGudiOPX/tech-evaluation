import { useEffect, useState } from 'react';
import type { AuthUser } from '@vps-template/contracts/auth';
import type { View } from '../types';

interface HeaderProps {
  view: View;
  setView: (view: View) => void;
  cartCount: number;
  user: AuthUser | null;
  logout: () => void;
  onOpenAuth: () => void;
}

export function Header({ view, setView, cartCount, user, logout, onOpenAuth }: HeaderProps) {
  const [animateBadge, setAnimateBadge] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  return (
    <header className="site-header">
      <button className="brand" onClick={() => setView('catalog')} type="button" aria-label="Go to catalog">
        <span className="brand-mark">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </span>
        <span className="brand-title">LuxeCart</span>
      </button>

      <nav aria-label="Main navigation">
        <button
          className={view === 'catalog' || view === 'detail' ? 'active' : ''}
          onClick={() => setView('catalog')}
          type="button"
        >
          Catalog
        </button>
        <button className={view === 'cart' ? 'active' : ''} onClick={() => setView('cart')} type="button">
          Cart
          {cartCount > 0 && <span className={`cart-badge ${animateBadge ? 'badge-pop' : ''}`}>{cartCount}</span>}
        </button>
        <button className={view === 'orders' ? 'active' : ''} onClick={() => setView('orders')} type="button">
          Orders
        </button>
        {user?.role === 'admin' && (
          <a className="nav-link" href="/admin" target="_blank" rel="noopener noreferrer">
            Admin
          </a>
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
          <button className="primary-btn auth-trigger-btn" onClick={onOpenAuth} type="button">
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
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
