import { useEffect, useMemo, useState } from 'react';
import type { Product, ProductCategory } from '@vps-template/contracts/products';
import { categoryLabel, money, productCategoryOptions } from '../utils/formatters';

type CategoryFilter = ProductCategory | 'all';

const PAGE_SIZE = 8;

interface CatalogViewProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
  onAddToCart: (productId: string) => Promise<void>;
  isBusy: boolean;
}

export function CatalogView({ products, onSelectProduct, onAddToCart, isBusy }: CatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, onlyInStock, products]);

  const availableCategories = useMemo(() => {
    const categories = new Set(products.map((product) => product.category));
    return productCategoryOptions.filter(([category]) => categories.has(category));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        categoryLabel(product.category).toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'all' ? true : product.category === selectedCategory;
      const matchesStock = onlyInStock ? product.stock > 0 : true;
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, onlyInStock]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function goToPage(next: number) {
    setPage(Math.min(Math.max(1, next), totalPages));
  }

  return (
    <section className="catalog-section view-transition">
      <div className="hero-banner">
        <div className="hero-content">
          <span className="eyebrow">Curated Collection</span>
          <h1 className="hero-title">Quiet objects for focused everyday living.</h1>
          <p className="hero-subtitle">
            Explore our thoughtfully designed catalog, add items to your authenticated cart, and experience seamless
            simulated checkout.
          </p>
        </div>
      </div>

      <div className="catalog-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search catalog by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')} type="button" aria-label="Clear search">
              &times;
            </button>
          )}
        </div>

        <div className="filter-group">
          <label className="category-filter">
            <span>Category</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value as CategoryFilter)}
            >
              <option value="all">All categories</option>
              {availableCategories.map(([category, label]) => (
                <option key={category} value={category}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="stock-filter-toggle">
            <input type="checkbox" checked={onlyInStock} onChange={(e) => setOnlyInStock(e.target.checked)} />
            <span>In Stock Only</span>
          </label>
        </div>
      </div>

      {isBusy && products.length === 0 ? (
        <div className="product-grid">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div className="skeleton-card" key={idx}>
              <div className="skeleton-image"></div>
              <div className="skeleton-text" style={{ width: '60%' }}></div>
              <div className="skeleton-text" style={{ width: '85%' }}></div>
              <div className="skeleton-text" style={{ width: '40%' }}></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-catalog">
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h3>No products match your search</h3>
          <p>Try resetting filters or adjusting your query string.</p>
          <button
            className="secondary-btn"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyInStock(false);
            }}
            type="button"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {pagedProducts.map((product, index) => {
            const isOutOfStock = product.stock <= 0;
            return (
              <article className="product-card" key={product.id} style={{ '--index': index } as React.CSSProperties}>
                <div className="card-image-wrapper">
                  <button
                    className="image-btn"
                    onClick={() => onSelectProduct(product.id)}
                    type="button"
                    title={`View ${product.name} details`}
                  >
                    <img alt={product.name} src={product.imageUrl} loading="lazy" />
                  </button>
                  <span
                    className={`stock-badge ${isOutOfStock ? 'badge-danger' : product.stock < 5 ? 'badge-warning' : 'badge-success'}`}
                  >
                    {isOutOfStock ? 'Out of Stock' : `${product.stock} available`}
                  </span>
                </div>

                <div className="card-body">
                  <span className="category-pill">{categoryLabel(product.category)}</span>
                  <div className="product-meta">
                    <button className="product-title-link" onClick={() => onSelectProduct(product.id)} type="button">
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
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
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

      {filteredProducts.length > 0 && totalPages > 1 && (
        <nav className="pager" aria-label="Catalog pagination">
          <button
            className="secondary-btn"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage <= 1}
            type="button"
          >
            Prev
          </button>
          <span className="pager-info">
            Page {safePage} of {totalPages}
          </span>
          <button
            className="secondary-btn"
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage >= totalPages}
            type="button"
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}
