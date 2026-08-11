import { useEffect } from 'react';
import { useCartState } from '../hooks/useCartState';
import { useTheme } from '../hooks/useTheme';
import { AdminView } from './AdminView';
import { ToastManager } from './ToastManager';

export function AdminApp() {
  const {
    products,
    adminForm,
    setAdminForm,
    editingProductId,
    user,
    isAuthReady,
    toasts,
    removeToast,
    isBusy,
    saveProduct,
    retireProduct,
    startEditing,
    cancelEditing,
    logout,
  } = useCartState();

  const { theme, toggle } = useTheme();

  useEffect(() => {
    if (isAuthReady && (user === null || user.role !== 'admin')) {
      window.location.assign('/');
    }
  }, [isAuthReady, user]);

  if (!isAuthReady || user?.role !== 'admin') {
    return (
      <div className="admin-root admin-loading">
        <span className="btn-spinner" aria-label="Loading admin console"></span>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <header className="admin-topbar">
        <span className="brand-title">LuxeCart Admin</span>
        <a className="ghost-btn" href="/" rel="noopener">
          Back to store
        </a>
        <div className="admin-topbar-right">
          <button
            className="theme-toggle"
            onClick={toggle}
            type="button"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? (
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
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
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
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <span className="user-email">{user.email}</span>
          <button className="ghost-btn" onClick={logout} type="button">
            Sign out
          </button>
        </div>
      </header>

      <ToastManager toasts={toasts} onDismiss={removeToast} />

      <AdminView
        products={products}
        adminForm={adminForm}
        setAdminForm={setAdminForm}
        editingProductId={editingProductId}
        onSaveProduct={saveProduct}
        onRetireProduct={retireProduct}
        onStartEditing={startEditing}
        onCancelEditing={cancelEditing}
        isBusy={isBusy}
      />
    </div>
  );
}
