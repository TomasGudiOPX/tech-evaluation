# Tasks

## 1. Specification and Evidence

- [x] Review this proposal and confirm whether consumer means authenticated customer or verified purchaser.
- [x] Link the product reviews slice to the relevant functional and quality requirements in the vault.
- [x] Record representative prompt/tool use and human review notes in `INFORME_IA.md`.

## 2. Data and Contracts

- [x] Add shared review schemas/types in `packages/contracts/src/reviews.ts`.
- [x] Export the reviews contract from `packages/contracts/package.json`.
- [x] Add Prisma `Review` model linked to `User` and `Product`.
- [x] Add a versioned migration with rating, comment length, ownership, uniqueness, and product-listing indexes.
- [x] Regenerate Prisma client after schema changes.

## 3. Reviews API

- [x] Add NestJS reviews module, repository, service, and controller.
- [x] Register `ReviewsModule` in the API app module.
- [x] Implement public `GET /api/products/:productId/reviews`.
- [x] Implement authenticated `POST /api/products/:productId/reviews`.
- [x] Implement authenticated `PATCH /api/reviews/:reviewId`.
- [x] Reject missing or retired products with `REVIEW_PRODUCT_NOT_FOUND`.
- [x] Enforce one review per authenticated customer and product with `REVIEW_ALREADY_EXISTS`.
- [x] Preserve user ownership for review updates with `REVIEW_NOT_FOUND`.

## 4. Tests and Verification

- [x] Add review service tests for listing, creation, update ownership, duplicate prevention, and retired-product behavior.
- [x] Add validation tests for rating range, integer-only rating, and 100-character comment limit.
- [x] Add route-level auth coverage for create and update endpoints.
- [x] Run Prisma generate.
- [x] Run contracts build.
- [x] Run API build and API tests.
- [x] Run root build.

## 5. Documentation and Handoff

- [x] Update README with review endpoints and customer ownership behavior.
- [x] Update `docs/DESIGN.md` and domain module documentation with the new reviews module.
- [x] Update vault evidence with implementation paths, test results, and commit.
- [x] Update `INFORME_IA.md` with review-slice evidence and corrections/rejections.
- [x] Commit with a message referencing the product reviews OpenSpec change.
- [x] Add product detail UI for listing, creating, and updating reviews.
