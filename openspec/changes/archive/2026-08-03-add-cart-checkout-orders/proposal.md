# Add Cart, Checkout, and Order History

## Why

The shopping-cart site now has identity/RBAC and a product catalog, but customers still cannot complete the core commerce workflow. This change adds the authenticated cart, simulated checkout, stock-safe order creation, and user-specific order history required for the evaluation.

Checkout is the highest-risk domain slice because it combines user ownership, product activity, stock mutation, idempotency, and immutable order records. It should be planned and tested explicitly before implementation so the evaluator can trace the requirement from OpenSpec to tests, code, evidence, and commit.

## What Changes

- Add persistent authenticated carts and cart items backed by PostgreSQL.
- Add cart endpoints to view, add, update, and remove items.
- Reject missing, retired, inactive, or unavailable products from cart and checkout flows.
- Add orders and immutable order item snapshots.
- Add transactional simulated checkout that decrements stock, creates an order, stores snapshots, clears the cart, and fails atomically.
- Require `Idempotency-Key` for checkout and enforce stable retry behavior.
- Add order history endpoint scoped to the authenticated user.
- Add checkout-focused tests for success, insufficient stock, idempotency, and concurrent final-unit checkout.
- Add vault and `INFORME_IA.md` evidence for `FR-02`, `FR-04`, `FR-05`, `FR-06`, `NFR-02`, `AI-02`, and `AI-03`.

## Non-Goals

- Guest carts or anonymous cart merge after login.
- Real payments, payment provider integrations, invoices, refunds, or fulfillment.
- Shipping addresses, tax calculation, discounts, coupons, and promotions.
- Product reservation before checkout.
- Admin order management.
- Search, filters, pagination, and product recommendations.

## Impact

- Completes the customer purchase workflow after catalog and authentication.
- Introduces the main transactional invariant for stock and order creation.
- Expands the Prisma schema with cart, order, order item, and checkout idempotency records.
- Establishes the TDD evidence anchor for the evaluation through checkout concurrency and idempotency tests.
