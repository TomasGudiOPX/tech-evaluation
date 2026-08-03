# Tasks

## 1. Specification and Evidence

- [x] Add planned vault evidence in `docs/obsidian-vault/03 Evidencia/Evidencia - Checkout y Ordenes.md`.
- [x] Link `FR-02`, `FR-04`, `FR-05`, `FR-06`, `NFR-02`, `AI-02`, and `AI-03` to this OpenSpec change.
- [x] Record representative prompt/tool use and human review notes in `INFORME_IA.md`.

## 2. Data and Contracts

- [x] Add shared cart, checkout, and order schemas/types in `packages/contracts`.
- [x] Add Prisma `Cart`, `CartItem`, `Order`, `OrderItem`, and `CheckoutIdempotencyKey` models.
- [x] Add a versioned migration with ownership, uniqueness, quantity, stock, and idempotency constraints.
- [x] Regenerate Prisma client after schema changes.

## 3. Cart API

- [x] Add NestJS cart module, repository, service, and controller.
- [x] Implement authenticated `GET /api/cart`.
- [x] Implement authenticated `POST /api/cart/items`.
- [x] Implement authenticated `PATCH /api/cart/items/:productId`.
- [x] Implement authenticated `DELETE /api/cart/items/:productId`.
- [x] Reject missing or retired products with `CART_PRODUCT_NOT_FOUND`.
- [x] Preserve user ownership for all cart reads and writes.

## 4. Checkout and Orders API

- [x] Add NestJS orders module, repository, service, and controller.
- [x] Implement authenticated `POST /api/orders/checkout`.
- [x] Require `Idempotency-Key` and return `CHECKOUT_IDEMPOTENCY_KEY_REQUIRED` when missing.
- [x] Enforce per-user idempotency and return `IDEMPOTENCY_KEY_REUSED` for changed request reuse.
- [x] Implement transaction-safe stock verification, stock decrement, order creation, snapshot creation, and cart clearing.
- [x] Implement authenticated `GET /api/orders` scoped to the current user.

## 5. Tests and Verification

- [x] Add cart service tests for first cart creation, add/update/remove, retired product rejection, and ownership.
- [x] Add checkout integration tests for success, empty cart, insufficient stock, and unchanged state on failure.
- [x] Add idempotency tests for missing key, identical retry, and reused key with changed request.
- [x] Add concurrent final-unit checkout test proving exactly one success and one `409`.
- [x] Add order history tests proving user isolation and immutable snapshots.
- [x] Run Prisma generate, contracts build, API build, API tests, web build, and root build.

## 6. Documentation and Handoff

- [x] Update README with cart, checkout, order endpoints, idempotency behavior, and simulated-payment decision.
- [x] Update development docs if the migration or verification workflow changes.
- [x] Update vault evidence with implementation paths, test results, and commit.
- [x] Update `INFORME_IA.md` with checkout TDD evidence and corrections/rejections.
- [x] Commit with a message referencing `FR-02`, `FR-04`, `FR-05`, and `AI-02`.
