# Add Product Reviews

## Why

The shopping-cart application has products, authentication, cart, checkout, and order history, but customers cannot leave product feedback. Reviews add a customer-facing signal for product quality without changing product ownership: product data remains owned by the products module, while review content is owned by a new reviews module.

This change adds a small, bounded review workflow: an authenticated customer can rate a product from 1 to 10 and add a short comment of at most 100 characters. The review model is intentionally separate from `Product` so feedback can evolve independently from catalog administration and product retirement.

## What Changes

- Add a standalone reviews domain module with controller, service, repository, and module wiring.
- Add a Prisma `Review` model linked to `User` and `Product`.
- Enforce one review per authenticated customer and product.
- Validate review rating as an integer from 1 through 10.
- Validate review comment as a trimmed string with a maximum length of 100 characters.
- Add public review reads for an active product.
- Add authenticated customer review creation and update.
- Reject reviews for missing or retired products.
- Add shared Zod schemas and API types in `packages/contracts`.
- Add tests for validation, ownership, product eligibility, uniqueness, and public listing.
- Update OpenSpec, docs, vault evidence, and `INFORME_IA.md` traceability.

## Non-Goals

- Embedding review content directly in the `Product` model or product contract.
- Verified-purchase-only reviews.
- Multiple reviews from the same customer for the same product.
- Admin moderation, hiding, reporting, or hard deletion of reviews.
- Review photos, likes, helpful votes, replies, or recommendation ranking.
- Product-rating aggregates stored on the product row.

## Impact

- Introduces a new behavior and data slice: product reviews.
- Extends the database schema with a review table and uniqueness constraints.
- Adds a new shared contract export for reviews.
- Preserves the existing product module boundary by making reviews reference products rather than become product-owned state.
- Adds customer-generated content with explicit length and ownership rules.
