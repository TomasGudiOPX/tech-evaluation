import { FormEvent } from 'react';
import type { Product } from '@vps-template/contracts/products';
import type { ProductForm } from '../types';
import { categoryLabel, money, productCategoryOptions } from '../utils/formatters';

interface AdminViewProps {
  products: Product[];
  adminForm: ProductForm;
  setAdminForm: (form: ProductForm) => void;
  editingProductId: string | null;
  onSaveProduct: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onRetireProduct: (productId: string) => Promise<void>;
  onStartEditing: (product: Product) => void;
  onCancelEditing: () => void;
  isBusy: boolean;
}

export function AdminView({
  products,
  adminForm,
  setAdminForm,
  editingProductId,
  onSaveProduct,
  onRetireProduct,
  onStartEditing,
  onCancelEditing,
  isBusy,
}: AdminViewProps) {
  const isEditing = Boolean(editingProductId);

  return (
    <section className="admin-section view-transition">
      <div className="admin-header">
        <span className="eyebrow">Admin Console</span>
        <h1 className="panel-title">Product Catalog Management</h1>
      </div>

      <div className="admin-grid">
        <form className="admin-form-card" onSubmit={onSaveProduct}>
          <div className="form-card-header">
            <h2>{isEditing ? 'Edit Product' : 'Create New Product'}</h2>
            {isEditing && (
              <button className="ghost-btn cancel-btn" onClick={onCancelEditing} type="button">
                Cancel
              </button>
            )}
          </div>

          <label className="form-field">
            <span>Product Name</span>
            <input
              placeholder="e.g. Minimalist Ceramic Cup"
              value={adminForm.name}
              onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
              required
            />
          </label>

          <label className="form-field">
            <span>Description</span>
            <textarea
              placeholder="Provide product details..."
              rows={3}
              value={adminForm.description}
              onChange={(e) => setAdminForm({ ...adminForm, description: e.target.value })}
              required
            />
          </label>

          <label className="form-field">
            <span>Image URL</span>
            <input
              placeholder="https://images.unsplash.com/..."
              value={adminForm.imageUrl}
              onChange={(e) => setAdminForm({ ...adminForm, imageUrl: e.target.value })}
              required
            />
          </label>

          {adminForm.imageUrl && (
            <div className="image-preview-container">
              <span className="preview-label">Image Preview:</span>
              <img
                src={adminForm.imageUrl}
                alt="Product preview"
                className="image-preview"
                onError={(e) => (e.currentTarget.style.display = 'none')}
                onLoad={(e) => (e.currentTarget.style.display = 'block')}
              />
            </div>
          )}

          <div className="form-two-cols">
            <label className="form-field">
              <span>Category</span>
              <select
                value={adminForm.category}
                onChange={(e) => setAdminForm({ ...adminForm, category: e.target.value as ProductForm['category'] })}
                required
              >
                {productCategoryOptions.map(([category, label]) => (
                  <option key={category} value={category}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Price (in Cents)</span>
              <input
                type="number"
                min={1}
                placeholder="2450 ($24.50)"
                value={adminForm.priceCents}
                onChange={(e) => setAdminForm({ ...adminForm, priceCents: e.target.value })}
                required
              />
            </label>

            <label className="form-field">
              <span>Initial Stock</span>
              <input
                type="number"
                min={0}
                placeholder="15"
                value={adminForm.stock}
                onChange={(e) => setAdminForm({ ...adminForm, stock: e.target.value })}
                required
              />
            </label>
          </div>

          <button className="primary-btn form-submit-btn" disabled={isBusy} type="submit">
            {isBusy ? <span className="btn-spinner"></span> : isEditing ? 'Save Product Changes' : 'Create Product'}
          </button>
        </form>

        <div className="admin-table-card">
          <h2>Active Products ({products.length})</h2>

          <div className="admin-products-list">
            {products.length === 0 ? (
              <p className="empty-table-text">No products created yet.</p>
            ) : (
              products.map((product) => (
                <article className="admin-product-row" key={product.id}>
                  <img className="admin-product-thumb" alt={product.name} src={product.imageUrl} />

                  <div className="admin-product-info">
                    <strong>{product.name}</strong>
                    <span className="admin-product-category">{categoryLabel(product.category)}</span>
                    <span className="admin-product-price">{money(product.priceCents)}</span>
                  </div>

                  <span
                    className={`stock-badge ${product.stock <= 0 ? 'badge-danger' : product.stock < 6 ? 'badge-warning' : 'badge-success'}`}
                  >
                    {product.stock} in stock
                  </span>

                  <div className="admin-row-actions">
                    <button className="ghost-btn edit-action" onClick={() => onStartEditing(product)} type="button">
                      Edit
                    </button>
                    <button
                      className="ghost-btn retire-action"
                      disabled={isBusy}
                      onClick={() => void onRetireProduct(product.id)}
                      type="button"
                    >
                      Retire
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
