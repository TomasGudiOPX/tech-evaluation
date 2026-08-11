import { createRoot } from 'react-dom/client';
import { AdminApp } from './components/AdminApp';
import { AuthModal } from './components/AuthModal';
import { CartView } from './components/CartView';
import { CatalogView } from './components/CatalogView';
import { CheckoutView } from './components/CheckoutView';
import { Header } from './components/Header';
import { OrdersView } from './components/OrdersView';
import { ProductDetailView } from './components/ProductDetailView';
import { ToastManager } from './components/ToastManager';
import { useCartState } from './hooks/useCartState';
import './styles.css';

function App() {
  const {
    view,
    setView,
    products,
    setSelectedProductId,
    selectedProduct,
    cart,
    cartCount,
    orders,
    user,
    authMode,
    setAuthMode,
    email,
    setEmail,
    password,
    setPassword,
    isAuthOpen,
    setIsAuthOpen,
    toasts,
    removeToast,
    error,
    isBusy,
    authenticate,
    logout,
    addToCart,
    updateCartItem,
    removeCartItem,
    checkout,
  } = useCartState();

  return (
    <main className="app-container">
      <Header
        view={view}
        setView={setView}
        cartCount={cartCount}
        user={user}
        logout={logout}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <ToastManager toasts={toasts} onDismiss={removeToast} />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        authMode={authMode}
        setAuthMode={setAuthMode}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isBusy={isBusy}
        error={error}
        authenticate={authenticate}
      />

      {view === 'catalog' && (
        <CatalogView
          products={products}
          onSelectProduct={(id) => {
            setSelectedProductId(id);
            setView('detail');
          }}
          onAddToCart={addToCart}
          isBusy={isBusy}
        />
      )}

      {view === 'detail' && (
        <ProductDetailView
          product={selectedProduct}
          onBack={() => setView('catalog')}
          onAddToCart={addToCart}
          isBusy={isBusy}
        />
      )}

      {view === 'cart' && (
        <CartView
          cart={cart}
          setView={setView}
          onUpdateQuantity={updateCartItem}
          onRemoveItem={removeCartItem}
          isBusy={isBusy}
        />
      )}

      {view === 'checkout' && <CheckoutView cart={cart} setView={setView} onCheckout={checkout} isBusy={isBusy} />}

      {view === 'orders' && <OrdersView orders={orders} />}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  window.location.pathname.startsWith('/admin') ? <AdminApp /> : <App />,
);
