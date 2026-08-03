import { createRoot } from 'react-dom/client';
import { AdminView } from './components/AdminView';
import { AuthPanel } from './components/AuthPanel';
import { CartView } from './components/CartView';
import { CatalogView } from './components/CatalogView';
import { CheckoutView } from './components/CheckoutView';
import { Header } from './components/Header';
import { NoticeBanner } from './components/NoticeBanner';
import { OrdersView } from './components/OrdersView';
import { ProductDetailView } from './components/ProductDetailView';
import { useCartState } from './hooks/useCartState';
import './styles.css';

function App() {
  const {
    view,
    setView,
    products,
    selectedProductId,
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
    adminForm,
    setAdminForm,
    editingProductId,
    notice,
    error,
    isBusy,
    authenticate,
    logout,
    addToCart,
    updateCartItem,
    removeCartItem,
    checkout,
    saveProduct,
    retireProduct,
    startEditing,
    cancelEditing,
    clearNotice,
  } = useCartState();

  return (
    <main className="app-container">
      <Header
        view={view}
        setView={setView}
        cartCount={cartCount}
        user={user}
        logout={logout}
      />

      <NoticeBanner notice={notice} error={error} onClear={clearNotice} />

      {!user && (
        <AuthPanel
          authMode={authMode}
          setAuthMode={setAuthMode}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isBusy={isBusy}
          authenticate={authenticate}
        />
      )}

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

      {view === 'checkout' && (
        <CheckoutView
          cart={cart}
          setView={setView}
          onCheckout={checkout}
          isBusy={isBusy}
        />
      )}

      {view === 'orders' && <OrdersView orders={orders} />}

      {view === 'admin' && user?.role === 'admin' && (
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
      )}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
