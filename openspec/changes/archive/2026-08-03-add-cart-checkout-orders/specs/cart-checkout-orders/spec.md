# Cart, Checkout, and Orders Specification

## ADDED Requirements

### Requirement: Authenticated persistent cart

The system SHALL provide a PostgreSQL-backed cart for each authenticated user.

#### Scenario: User views an empty cart

- **GIVEN** an authenticated user has no cart items
- **WHEN** the user requests their cart
- **THEN** the response includes an empty cart
- **AND** the cart belongs only to that user

#### Scenario: Unauthenticated visitor requests cart

- **GIVEN** no valid authentication token is provided
- **WHEN** the visitor requests the cart
- **THEN** the response uses the stable unauthenticated error code

### Requirement: Cart item mutation

The system SHALL allow an authenticated user to add, update, and remove active products in their cart.

#### Scenario: User adds active product to cart

- **GIVEN** an active product with available stock exists
- **WHEN** an authenticated user adds the product with a positive quantity
- **THEN** the cart contains that product and quantity

#### Scenario: User updates item quantity

- **GIVEN** the user's cart contains a product
- **WHEN** the user replaces its quantity with a positive quantity
- **THEN** the cart line reflects the new quantity

#### Scenario: User removes item

- **GIVEN** the user's cart contains a product
- **WHEN** the user removes that product
- **THEN** the product no longer appears in the cart

#### Scenario: User adds retired or missing product

- **GIVEN** a product is missing or retired
- **WHEN** an authenticated user attempts to add it to the cart
- **THEN** the response uses the shared error envelope with code `CART_PRODUCT_NOT_FOUND`

### Requirement: Atomic simulated checkout

The system SHALL convert the authenticated user's cart into an order atomically without real payment processing.

#### Scenario: User checks out valid cart

- **GIVEN** an authenticated user has cart items for active products with enough stock
- **AND** the request includes an `Idempotency-Key`
- **WHEN** checkout is processed
- **THEN** product stock is decremented
- **AND** an order is created for that user
- **AND** immutable order item snapshots are stored
- **AND** the user's cart is cleared

#### Scenario: User checks out empty cart

- **GIVEN** an authenticated user has no cart items
- **AND** the request includes an `Idempotency-Key`
- **WHEN** checkout is processed
- **THEN** no order is created
- **AND** the response uses the shared error envelope with code `CART_EMPTY`

#### Scenario: Checkout finds insufficient stock

- **GIVEN** an authenticated user has a cart quantity greater than available stock
- **AND** the request includes an `Idempotency-Key`
- **WHEN** checkout is processed
- **THEN** no stock is decremented
- **AND** no order is created
- **AND** the cart remains unchanged
- **AND** the response is HTTP 409 with code `INSUFFICIENT_STOCK`

### Requirement: Checkout idempotency

The system SHALL require and enforce checkout idempotency per authenticated user.

#### Scenario: Checkout missing idempotency key

- **GIVEN** an authenticated user has a valid cart
- **WHEN** checkout is requested without an `Idempotency-Key`
- **THEN** no order is created
- **AND** the response uses code `CHECKOUT_IDEMPOTENCY_KEY_REQUIRED`

#### Scenario: Identical checkout retry

- **GIVEN** an authenticated user completed checkout with an idempotency key
- **WHEN** the user retries with the same key and same request fingerprint
- **THEN** the original order response is returned
- **AND** no additional stock is decremented
- **AND** no duplicate order is created

#### Scenario: Idempotency key reused for changed request

- **GIVEN** an authenticated user completed or attempted checkout with an idempotency key
- **WHEN** the user reuses the same key with a different request fingerprint
- **THEN** no new order is created
- **AND** the response is HTTP 409 with code `IDEMPOTENCY_KEY_REUSED`

### Requirement: Concurrent stock safety

The system SHALL prevent overselling when concurrent checkouts request the final available unit.

#### Scenario: Two users checkout final unit concurrently

- **GIVEN** one active product has stock of one
- **AND** two authenticated users each have that product in their cart
- **WHEN** both users check out concurrently with distinct idempotency keys
- **THEN** exactly one checkout succeeds
- **AND** exactly one checkout fails with HTTP 409 `INSUFFICIENT_STOCK`
- **AND** final product stock is zero
- **AND** only one order exists for that product unit

### Requirement: User-scoped order history

The system SHALL allow an authenticated user to view only their own orders and immutable item snapshots.

#### Scenario: User lists own orders

- **GIVEN** an authenticated user has completed orders
- **WHEN** the user requests order history
- **THEN** the response includes only that user's orders
- **AND** each order includes immutable product name, unit price, quantity, and line total snapshots

#### Scenario: User cannot see another user's orders

- **GIVEN** another user has completed orders
- **WHEN** the authenticated user requests order history
- **THEN** those other-user orders are not included
