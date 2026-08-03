import { useMemo, useState } from 'react';
import type { Product } from '@vps-template/contracts/products';
import { money } from '../utils/formatters';

interface CatalogViewProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
  onAddToCart: (productId: string) => Promise<void>;
  isBusy: boolean;
}

export function CatalogView({ products, onSelectProduct, onAddToCart, isBusy }: CatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStock = onlyInStock ? product.stock > 0 : true;
      return matchesSearch && matchesStock;
    });
  }, [products, searchQuery, onlyInStock]);

  return (
    <section className="catalog-section">
      <div className="hero-banner">
        <div className="hero-content">
          <span className="eyebrow">Curated Collection</span>
          <h1 className="hero-title">Quiet objects for focused everyday living.</h1>
          <p className="hero-subtitle">
            Explore our thoughtfully designed catalog, add items to your authenticated cart, and experience seamless simulated checkout.
          </p>
        </div>
      </div>

      <div className="catalog-controls">
        <div className="search-box">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search catalog by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')} type="button">
              &times;
            </button>
          )}
        </div>

        <label className="stock-filter-toggle">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-catalog">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h3>No products match your search</h3>
          <p>Try resetting filters or adjusting your query string.</p>
          <button
            className="secondary-btn"
            onClick={() => {
              setSearchQuery('');
              setOnlyInStock(false);
            }}
            type="button"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            return (
              <article className="product-card" key={product.id}>
                <div className="card-image-wrapper">
                  <button
                    className="image-btn"
                    onClick={() => onSelectProduct(product.id)}
                    type="button"
                    title={`View ${product.name} details`}
                  >
                    <img alt={product.name} src={product.imageUrl} loading="lazy" />
                  </button>
                  <span className={`stock-badge ${isOutOfStock ? 'badge-danger' : product.stock < 5 ? 'badge-warning' : 'badge-success'}`}>
                    {isOutOfStock ? 'Out of Stock' : `${product.stock} available`}
                  </span>
                </div>

                <div className="card-body">
                  <div className="product-meta">
                    <button
                      className="product-title-link"
                      onClick={() => onSelectProduct(product.id)}
                      type="button"
                    >
                      {product.name}
                    </button>
                    <span className="product-price">{money(product.priceCents)}</span>
                  </div>

                  <p className="product-desc">{product.description}</p>
                </div>

                <div className="card-footer">
                  <button
                    className="primary-btn card-action-btn"
                    disabled={isOutOfStock || isBusy}
                    onClick={() => void onAddToCart(product.id)}
                    type="button"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Add to Cart</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
