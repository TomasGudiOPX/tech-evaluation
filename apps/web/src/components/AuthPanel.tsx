import { FormEvent } from 'react';
import type { AuthMode } from '../types';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../utils/formatters';

interface AuthPanelProps {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isBusy: boolean;
  error?: string;
  authenticate: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function AuthPanel({
  authMode,
  setAuthMode,
  email,
  setEmail,
  password,
  setPassword,
  isBusy,
  error,
  authenticate,
}: AuthPanelProps) {
  const isError = Boolean(error);
  const isDemoEmail = email === DEMO_EMAIL;
  const isDemoPassword = password === DEMO_PASSWORD;

  return (
    <section className="auth-section view-transition" aria-label="Authentication">
      <div className="auth-hero">
        <span className="eyebrow">Secure Account Access</span>
        <h1>Experience seamless shopping & instant checkout</h1>
        <p>Sign in to unlock personalized carts, real-time stock sync, and full order history tracking.</p>
        <div className="auth-highlights">
          <div className="highlight-item">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Idempotency Protected Checkout</span>
          </div>
          <div className="highlight-item">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <span>Simulated Instant Payment</span>
          </div>
        </div>
      </div>

      <div className={`auth-card ${isError ? 'shake-error' : ''}`}>
        <div className="segmented-tabs">
          <button
            className={`tab-btn ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => setAuthMode('login')}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${authMode === 'register' ? 'active' : ''}`}
            onClick={() => setAuthMode('register')}
            type="button"
          >
            Create Account
          </button>
        </div>

        <form onSubmit={authenticate} className="auth-form">
          <label className="form-field">
            <span>Email Address</span>
            <input
              autoComplete="email"
              placeholder="customer@example.com"
              className={isDemoEmail ? 'demo-value' : ''}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
              required
            />
          </label>

          <label className="form-field">
            <span>Password</span>
            <input
              autoComplete="current-password"
              placeholder="••••••••"
              className={isDemoPassword ? 'demo-value' : ''}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
              minLength={authMode === 'register' ? 8 : 1}
              required
            />
            {authMode === 'register' && <span className="form-hint">Must be at least 8 characters long</span>}
          </label>

          <div className="demo-credentials">
            <span className="demo-credentials-label">Demo login</span>
            <code>{DEMO_EMAIL}</code>
            <code>{DEMO_PASSWORD}</code>
          </div>

          <button className="primary-btn submit-btn" disabled={isBusy} type="submit">
            {isBusy ? <span className="btn-spinner"></span> : authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </section>
  );
}
