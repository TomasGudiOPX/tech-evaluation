# Tasks

## 1. Specification and Evidence

- [x] Add a vault evidence note for catalog/admin product management.
- [x] Link `FR-01`, `FR-07`, `FR-06`, `NFR-02`, and `AI-03` to this OpenSpec change.
- [x] Record representative prompt/tool use and human review notes in `INFORME_IA.md`.

## 2. Data and Contracts

- [x] Add shared product schemas/types for create, update, and product responses.
- [x] Add Prisma `Product` model and versioned migration.
- [x] Add deterministic seed catalog data and document how to run it.

## 3. API Implementation

- [x] Add NestJS products module, repository, service, and controller.
- [x] Implement public `GET /api/products`.
- [x] Implement public `GET /api/products/:id`.
- [x] Implement admin `POST /api/admin/products`.
- [x] Implement admin `PATCH /api/admin/products/:id`.
- [x] Implement admin `DELETE /api/admin/products/:id` as soft retirement.
- [x] Attach JWT and admin role guards to all admin product writes.

## 4. Tests and Verification

- [x] Add product service tests for active-only catalog and retired-product detail behavior.
- [x] Add validation tests for price, stock, required text, and image URL.
- [x] Add RBAC route tests proving customers cannot write products and admins can.
- [x] Run Prisma generate, tests, and build after dependency install is unblocked.

## 5. Documentation and Handoff

- [x] Update README with catalog/admin endpoints and product retirement decision.
- [x] Update vault evidence with implementation paths.
- [x] Update vault evidence with test results and commit.
- [x] Commit with a message referencing `FR-01`, `FR-07`, and `FR-06`.
