# Product Pagination

## Purpose

Lets clients page through the active product catalog: the products endpoint accepts optional pagination parameters, validates them, and returns a total count alongside the requested page so callers can build pagers.

## ADDED Requirements

### Requirement: Paginated product listing

The `GET /api/products` endpoint SHALL accept optional `page` and `pageSize` query parameters. `page` SHALL default to `1`, `pageSize` SHALL default to the full catalog size so that omitting both preserves today's single-request behavior. The response SHALL include the requested products plus pagination metadata (`page`, `pageSize`, `total`, `totalPages`).

#### Scenario: No pagination parameters supplied

- **WHEN** a client calls `GET /api/products` without `page` or `pageSize`
- **THEN** the response contains all active products
- **AND** the pagination metadata reflects page `1` with the full catalog as the total

#### Scenario: Paged request

- **WHEN** a client calls `GET /api/products?page=2&pageSize=4`
- **THEN** the response contains only the products for page 2 of size 4
- **AND** the pagination metadata contains the requested `page` and `pageSize` plus the overall `total` and computed `totalPages`

### Requirement: Pagination parameter validation

The `page` and `pageSize` query parameters SHALL be validated. Invalid values SHALL result in HTTP `400` with a structured error body containing `fieldErrors`.

#### Scenario: Invalid page value

- **WHEN** a client calls `GET /api/products?page=0` or `?page=abc`
- **THEN** the API responds with HTTP `400`
- **AND** the error body identifies the invalid `page` field

#### Scenario: Invalid page size value

- **WHEN** a client calls `GET /api/products?pageSize=0` or `?pageSize=10000`
- **THEN** the API responds with HTTP `400`
- **AND** the error body identifies the invalid `pageSize` field
