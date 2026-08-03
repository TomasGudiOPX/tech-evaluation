# Product Catalog and Admin Specification

## ADDED Requirements

### Requirement: Public active product catalog

The system SHALL expose a public catalog containing active products with name, price, image, and stock.

#### Scenario: Visitor lists active products

- **GIVEN** active and retired products exist
- **WHEN** a visitor requests the product catalog
- **THEN** the response includes active products
- **AND** each product includes id, name, description, price, image URL, and stock
- **AND** retired products are excluded

### Requirement: Public active product detail

The system SHALL expose a public product detail endpoint for active products.

#### Scenario: Visitor views active product

- **GIVEN** an active product exists
- **WHEN** a visitor requests that product by id
- **THEN** the response includes the product details

#### Scenario: Visitor requests retired or missing product

- **GIVEN** the product does not exist or is retired
- **WHEN** a visitor requests that product by id
- **THEN** the response uses the shared error envelope with code `PRODUCT_NOT_FOUND`

### Requirement: Administrator product creation

The system SHALL allow only administrators to create products.

#### Scenario: Admin creates product

- **GIVEN** an authenticated admin submits valid product data
- **WHEN** the create request is processed
- **THEN** an active product is stored
- **AND** the response includes the created product

#### Scenario: Customer attempts product creation

- **GIVEN** an authenticated customer submits product data
- **WHEN** the create request is processed
- **THEN** the response is forbidden with the stable RBAC error code

### Requirement: Administrator product update

The system SHALL allow only administrators to update product fields.

#### Scenario: Admin updates product

- **GIVEN** an active product exists
- **AND** an authenticated admin submits valid updates
- **WHEN** the update request is processed
- **THEN** the product reflects the submitted changes

#### Scenario: Invalid product update

- **GIVEN** an authenticated admin submits invalid product data
- **WHEN** the update request is processed
- **THEN** the response uses `VALIDATION_ERROR`
- **AND** includes `fieldErrors`

### Requirement: Administrator product retirement

The system SHALL allow only administrators to retire products without hard deletion.

#### Scenario: Admin retires product

- **GIVEN** an active product exists
- **WHEN** an authenticated admin retires the product
- **THEN** the product remains stored
- **AND** `isActive` is false
- **AND** the product no longer appears in public catalog results

### Requirement: Deterministic seed catalog

The system SHALL provide a small deterministic seed catalog for local demo and evaluation.

#### Scenario: Seed runs in an empty database

- **GIVEN** no products exist
- **WHEN** the seed runs
- **THEN** at least four active products exist
- **AND** their names, prices, image URLs, and stock values are deterministic
