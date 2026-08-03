import { useEffect } from 'react';
import { useCartState } from '../hooks/useCartState';
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
