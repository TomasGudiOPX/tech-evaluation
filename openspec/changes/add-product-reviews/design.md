# Product Reviews Design

## Decision

Product reviews are implemented as a new NestJS domain module backed by Prisma. The module owns customer-authored review content and references `Product` and `User` by foreign key. Products remain the source of truth for catalog fields and active/retired policy; reviews are related feedback, not product-owned state.

For this first slice, a consumer means an authenticated customer account. Verified-purchase-only reviews are intentionally deferred because that would add order-history eligibility rules and a dependency on checkout data beyond the requested review shape.

## Domain Ownership

```text
auth
  owns User identity and authenticated request user

products
  owns Product data and active/retired policy

reviews
  owns Review rating/comment content and customer/product uniqueness
```

The reviews module may check product eligibility through the product-facing service or repository boundary, but it must not embed review content in product responses by default.

## Data Model

`Review`:

- `id`: UUID.
- `productId`: reference to `Product`.
- `userId`: reference to `User`.
- `rating`: integer from 1 through 10.
- `comment`: string with maximum length of 100 characters.
- `createdAt`, `updatedAt`: timestamps.
- Unique `(productId, userId)` to enforce one review per customer and product.
- Index `(productId, createdAt)` for product review listing.

Foreign-key deletion policy should preserve review/product traceability. Products are retired logically instead of hard-deleted, so review rows can use restrictive product references. User deletion can cascade or restrict according to the existing identity lifecycle; the current project has no user deletion workflow, so this change should not introduce one.

## API Contract

Public reads:

- `GET /api/products/:productId/reviews`: list reviews for one active product.

Authenticated customer writes:

- `POST /api/products/:productId/reviews`: create the current customer's review for an active product.
- `PATCH /api/reviews/:reviewId`: replace the current customer's review rating and comment.

Controllers return response envelopes matching existing module style, for example `{ reviews }` and `{ review }`.

## Validation and Errors

Shared contract schemas validate:

- `rating`: integer, minimum `1`, maximum `10`.
- `comment`: trimmed string, minimum `1`, maximum `100`.

Stable domain error codes:

- `REVIEW_PRODUCT_NOT_FOUND`: product is missing or retired for review reads or writes.
- `REVIEW_ALREADY_EXISTS`: authenticated customer already reviewed the product.
- `REVIEW_NOT_FOUND`: review does not exist for the authenticated customer.

Validation failures use `VALIDATION_ERROR` with `fieldErrors`. Authentication failures reuse the existing auth error codes.

## Contracts

Add `packages/contracts/src/reviews.ts` and export it from `packages/contracts/package.json`.

Recommended contract shapes:

- `reviewSchema`
- `reviewMutationSchema`
- `reviewListResponseSchema`
- `reviewResponseSchema`
- `Review`
- `ReviewMutationInput`
- `ReviewListResponse`
- `ReviewResponse`

Do not add review arrays to `productSchema` in this slice. Product review listing is a separate capability.

## Testing

Required coverage:

- Public listing returns reviews for only the requested active product.
- Public listing returns an empty list for an active product with no reviews.
- Missing or retired product returns `REVIEW_PRODUCT_NOT_FOUND`.
- Authenticated customer creates a valid review.
- Rating below 1, rating above 10, non-integer rating, and over-length comment return `VALIDATION_ERROR`.
- Duplicate customer/product review returns `409` `REVIEW_ALREADY_EXISTS`.
- Customer can update their own review.
- Customer cannot update another customer's review and receives `REVIEW_NOT_FOUND`.
- Product retirement preserves stored reviews but hides them from active-product review listing.

## Traceability

Record this slice in the vault as a product-review behavior and data change. Update `INFORME_IA.md` with the prompt, generated design, human review, implementation paths, verification results, and any rejected shortcuts.
