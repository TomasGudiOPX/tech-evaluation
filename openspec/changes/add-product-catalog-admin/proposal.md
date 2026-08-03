# Add Product Catalog and Admin Product Management

## Why

The shopping-cart site needs a visible commerce surface before cart and checkout can be meaningful. A visitor must be able to browse products, inspect details, and see stock. An administrator must be able to create, update, and retire products through protected endpoints so the evaluator can verify RBAC beyond login.

This change follows `evaluation.md` by keeping the implementation in Node.js/TypeScript with the selected Next.js + NestJS + PostgreSQL + Prisma stack, and by documenting the work through OpenSpec and the Obsidian vault before application code.

## What Changes

- Add a Prisma `Product` model with deterministic seed data.
- Add public product catalog and product-detail API endpoints.
- Add administrator product create/update/retire endpoints.
- Attach the existing JWT and role guard contract to administrator product writes.
- Exclude retired products from public catalog/detail and future checkout eligibility.
- Add product validation and stable error envelopes.
- Add product service tests and RBAC route coverage.
- Add catalog/admin evidence records in the vault and `INFORME_IA.md`.

## Non-Goals

- Search, filters, pagination, and categories.
- Product image uploads or object storage.
- Hard deletion of products.
- Checkout, cart, and order creation.
- Full admin web panel polish; this change exposes the admin capability at the API level and prepares the UI contract.

## Impact

- Covers `FR-01`, `FR-06`, `FR-07`, `NFR-01`, `NFR-02`, and `AI-03`.
- Provides the product data source required by the next cart and checkout slice.
- Exercises the identity/RBAC baseline in a concrete administrator boundary.
