# Product Catalog and Admin Design

## Decision

Products are managed by a dedicated NestJS `products` module backed by Prisma. Public reads return only active products. Administrator writes require authenticated `admin` role through the guards exported by the identity/RBAC slice.

Product removal is soft retirement, not hard delete. A retired product remains in the database for order-history integrity and auditability, but it is excluded from the public catalog and cannot be used by checkout.

## Domain Ownership

```text
products
  owns Product model, validation, catalog reads, admin writes, retirement

auth
  owns User and role identity
  exports JWT + role guard contract

cart/orders
  later depend on active products and immutable product snapshots
```

The products module may depend on auth guards for route protection. Cart and orders must call product-facing services or transaction helpers instead of reaching around product rules.

## Data Model

`Product` fields:

- `id`: UUID.
- `name`: required, display name.
- `description`: required, detail copy.
- `priceCents`: integer minor-unit price, greater than zero.
- `imageUrl`: URL string for the catalog card/detail page.
- `stock`: integer stock count, zero or greater.
- `isActive`: boolean, defaults true.
- `createdAt`, `updatedAt`: timestamps.

The initial seed catalog should be deterministic, small, and visually usable for a demo. Use remote image URLs or stable placeholders; do not require uploads.

## API Contract

Public:

- `GET /api/products`: list active products.
- `GET /api/products/:id`: get one active product or return not found.

Admin:

- `POST /api/admin/products`: create product.
- `PATCH /api/admin/products/:id`: update product fields.
- `DELETE /api/admin/products/:id`: retire product by setting `isActive=false`.

Admin “delete” is intentionally logical retirement. The endpoint shape may use `DELETE`, but the behavior must not physically delete the row.

## Validation and Errors

Expected failures use:

```json
{ "code": "PRODUCT_NOT_FOUND", "message": "Product not found" }
```

Validation failures use `VALIDATION_ERROR` with `fieldErrors`. Negative stock, zero/negative price, invalid image URLs, and empty names/descriptions must be rejected. Unauthorized and forbidden responses keep the identity/RBAC stable codes.

## Testing

Required coverage:

- Product service lists only active products.
- Product detail hides retired products.
- Admin create/update validate price, stock, text, and image URL.
- Retire is soft and idempotent enough for repeated admin calls to remain safe.
- Customer token cannot access admin product writes.
- Admin token can access admin product writes.

## Traceability

Record this slice in the vault with requirement IDs `FR-01`, `FR-07`, `FR-06`, `NFR-02`, and `AI-03`. Update `INFORME_IA.md` with the prompt, generated design, human review, and any rejected implementation shortcuts.
