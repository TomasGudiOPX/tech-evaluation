# Cart, Checkout, and Orders Design

## Decision

Cart, checkout, and order history are implemented as NestJS domain modules backed by Prisma. The cart module owns mutable customer intent. The orders module owns checkout orchestration, immutable order snapshots, idempotency, and user-specific order reads.

Browsing remains public, but every cart, checkout, and order endpoint requires JWT authentication. Guest-cart merge is intentionally deferred to keep the workflow auditable and inside the evaluation timebox.

## Domain Ownership

```text
auth
  owns User identity and authenticated request user

products
  owns Product data, active/retired policy, stock fields

cart
  owns Cart and CartItem mutable state for one user

orders
  owns Order, OrderItem snapshots, checkout transaction, idempotency
```

Cart and orders may read product state through repository/service boundaries, but they must preserve product rules: retired products are not eligible for cart additions or checkout.

## Data Model

`Cart`:

- `id`: UUID.
- `userId`: unique reference to `User`.
- `createdAt`, `updatedAt`: timestamps.

`CartItem`:

- `id`: UUID.
- `cartId`: reference to `Cart`.
- `productId`: reference to `Product`.
- `quantity`: integer greater than zero.
- Unique `(cartId, productId)` to allow upsert-style add/update behavior.
- `createdAt`, `updatedAt`: timestamps.

`Order`:

- `id`: UUID.
- `userId`: reference to `User`.
- `status`: initial value `placed`.
- `totalCents`: integer greater than or equal to zero.
- `createdAt`: timestamp.

`OrderItem`:

- `id`: UUID.
- `orderId`: reference to `Order`.
- `productId`: nullable reference or stored UUID string for product traceability.
- `productName`: immutable snapshot.
- `unitPriceCents`: immutable snapshot.
- `quantity`: integer greater than zero.
- `lineTotalCents`: immutable snapshot.

`CheckoutIdempotencyKey`:

- `id`: UUID.
- `userId`: reference to `User`.
- `key`: request header value.
- `requestFingerprint`: deterministic hash of the checkout request/cart state.
- `orderId`: reference to created `Order` when checkout succeeds.
- `responseCode`: stable result code for replay.
- `expiresAt`: 24-hour retention boundary.
- `createdAt`: timestamp.
- Unique `(userId, key)`.

## API Contract

Authenticated cart:

- `GET /api/cart`: return the current user's cart and item totals.
- `POST /api/cart/items`: add a product with quantity, merging with existing line when present.
- `PATCH /api/cart/items/:productId`: replace quantity for an existing line.
- `DELETE /api/cart/items/:productId`: remove a line.

Authenticated orders:

- `POST /api/orders/checkout`: create an order from the current cart. Requires `Idempotency-Key`.
- `GET /api/orders`: list the current user's orders with immutable item snapshots.

Controllers return response envelopes matching existing module style, for example `{ cart }`, `{ order }`, and `{ orders }`.

## Validation and Errors

Expected domain errors use the shared envelope:

```json
{ "code": "INSUFFICIENT_STOCK", "message": "Insufficient stock for one or more products" }
```

Stable codes:

- `CART_PRODUCT_NOT_FOUND`: product is missing or retired for cart mutation.
- `CART_ITEM_NOT_FOUND`: cart line does not exist for update or removal.
- `CART_EMPTY`: checkout was requested with no cart items.
- `CHECKOUT_IDEMPOTENCY_KEY_REQUIRED`: checkout request omitted `Idempotency-Key`.
- `IDEMPOTENCY_KEY_REUSED`: same key reused with a different request fingerprint.
- `INSUFFICIENT_STOCK`: one or more active products cannot satisfy requested quantity.

Validation failures use `VALIDATION_ERROR` with `fieldErrors`. Authentication failures reuse the existing auth error codes.

## Checkout Transaction

Checkout runs inside one database transaction:

1. Resolve the authenticated user's cart and items.
2. Reject an empty cart.
3. Compute the request fingerprint from user id and normalized cart lines.
4. Insert or read the `(userId, Idempotency-Key)` record.
5. Return the original order when the same fingerprint already succeeded.
6. Return `IDEMPOTENCY_KEY_REUSED` when the same key has a different fingerprint.
7. Lock eligible active products in ascending product-id order.
8. Verify every cart line has an active product and enough stock.
9. Decrement stock.
10. Create the order and immutable item snapshots.
11. Store the successful idempotency result.
12. Clear cart items.

If any validation, eligibility, or stock check fails, no stock is decremented, no order is created, and the cart remains available for correction.

Because checkout has no request body, a completed checkout replay is treated as the same request when the current cart is empty. If the user later builds a different non-empty cart and reuses the same key, the stored fingerprint and current cart fingerprint differ and the API returns `IDEMPOTENCY_KEY_REUSED`.

## Testing

Required coverage:

- Cart service creates a cart on first read or mutation.
- Adding the same product merges or replaces quantity according to the endpoint contract.
- Cart rejects missing or retired products.
- Cart update and remove enforce current-user ownership.
- Checkout success decrements stock, creates snapshots, and clears the cart.
- Insufficient stock returns `409` and leaves stock, cart, and orders unchanged.
- Missing `Idempotency-Key` is rejected.
- Identical idempotent retry returns the original order.
- Reusing a key with a changed cart/request returns `409` `IDEMPOTENCY_KEY_REUSED`.
- Two simultaneous checkouts for the final unit result in exactly one success and one `409`.
- Order history returns only the authenticated user's orders.

The concurrent final-unit checkout test is the TDD anchor for `AI-02`.

## Traceability

Record this slice in the vault with requirement IDs `FR-02`, `FR-04`, `FR-05`, `FR-06`, `NFR-02`, `AI-02`, and `AI-03`. The checkout slice must include a complete chain from requirement to OpenSpec, decision, representative prompt/tool output, human review, failing or planned test, implementation paths, verification result, and commit.
