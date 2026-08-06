# Product Reviews Specification

## ADDED Requirements

### Requirement: Public product review listing

The system SHALL expose reviews for an active product without requiring authentication.

#### Scenario: Visitor lists reviews for an active product

- **GIVEN** an active product has customer reviews
- **WHEN** a visitor requests reviews for that product
- **THEN** the response includes the reviews for that product
- **AND** each review includes id, product id, customer id, rating, comment, created timestamp, and updated timestamp
- **AND** the response does not include reviews for other products

#### Scenario: Visitor lists reviews for a product without reviews

- **GIVEN** an active product has no reviews
- **WHEN** a visitor requests reviews for that product
- **THEN** the response includes an empty review list

#### Scenario: Visitor lists reviews for a missing or retired product

- **GIVEN** a product is missing or retired
- **WHEN** a visitor requests reviews for that product
- **THEN** the response uses the shared error envelope with code `REVIEW_PRODUCT_NOT_FOUND`

### Requirement: Customer product review creation

The system SHALL allow an authenticated customer to create one review for an active product.

#### Scenario: Customer creates a valid review

- **GIVEN** an authenticated customer
- **AND** an active product exists
- **WHEN** the customer submits an integer rating from 1 through 10 and a comment of at most 100 characters
- **THEN** a review is stored for that customer and product
- **AND** the response includes the created review

#### Scenario: Unauthenticated visitor creates a review

- **GIVEN** no valid authentication token is provided
- **WHEN** the visitor submits a product review
- **THEN** the response uses the stable unauthenticated error code

#### Scenario: Customer reviews a missing or retired product

- **GIVEN** a product is missing or retired
- **WHEN** an authenticated customer submits a review for that product
- **THEN** no review is stored
- **AND** the response uses the shared error envelope with code `REVIEW_PRODUCT_NOT_FOUND`

#### Scenario: Customer submits invalid review content

- **GIVEN** an authenticated customer
- **WHEN** the customer submits a rating outside 1 through 10, a non-integer rating, or a comment longer than 100 characters
- **THEN** no review is stored
- **AND** the response uses `VALIDATION_ERROR`
- **AND** includes `fieldErrors`

#### Scenario: Customer submits a duplicate review

- **GIVEN** an authenticated customer already reviewed a product
- **WHEN** the customer submits another create request for the same product
- **THEN** no second review is stored
- **AND** the response is HTTP 409 with code `REVIEW_ALREADY_EXISTS`

### Requirement: Customer review update

The system SHALL allow a customer to update only their own review.

#### Scenario: Customer updates own review

- **GIVEN** an authenticated customer has reviewed a product
- **WHEN** the customer submits a valid replacement rating and comment for that review
- **THEN** the review reflects the submitted rating and comment
- **AND** the updated timestamp changes

#### Scenario: Customer updates another customer's review

- **GIVEN** another customer created a review
- **WHEN** an authenticated customer attempts to update that review
- **THEN** the response uses the shared error envelope with code `REVIEW_NOT_FOUND`
- **AND** the review remains unchanged

#### Scenario: Customer updates missing review

- **GIVEN** no review exists for the requested id and authenticated customer
- **WHEN** the customer submits a review update
- **THEN** the response uses the shared error envelope with code `REVIEW_NOT_FOUND`

### Requirement: Review data ownership

The system SHALL store reviews as a standalone domain model linked to products and customers.

#### Scenario: Product is retired after reviews exist

- **GIVEN** a product has reviews
- **WHEN** an administrator retires the product
- **THEN** existing reviews remain stored
- **AND** public active-product review listing no longer exposes that product's reviews

#### Scenario: Product with reviews remains referenced

- **GIVEN** a product has reviews
- **WHEN** product catalog data is read or updated
- **THEN** review records are not embedded into the product row
- **AND** reviews are read through the reviews capability
