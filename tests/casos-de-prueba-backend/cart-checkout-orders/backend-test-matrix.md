# Backend QA Test Matrix

| Requirement / behavior | Harness | Existing coverage | QA implementation | Status |
|---|---|---|---|---|
| Register and login customer | Jest service | `apps/api/src/modules/auth/auth.service.test.ts` | Live smoke registration | Covered by unit + live smoke |
| Reject unauthenticated access | HTTP contract | Filter and guard tests exist | Live `/api/auth/profile` probe | Covered by contract smoke |
| Customer cannot use admin product writes | HTTP/RBAC | `product.controller.test.ts`, `roles.guard.test.ts` | Live customer `POST /api/admin/products` | Covered by RBAC smoke |
| Public active catalog | HTTP + DB read | Product service tests exist | Live `GET /api/products` | Covered by live smoke |
| Add cart item | Service + DB | `cart.service.test.ts` | Live cart mutation | Covered by unit + live smoke |
| Atomic checkout | DB integration | `order.repository.test.ts` | Live PostgreSQL checkout | Covered by repository test + smoke |
| Checkout idempotency | DB integration | Repository idempotency cases | Same-key live retry | Covered by DB-style test + smoke |
| Cart cleared after checkout | Service + DB | Repository/service coverage exists | Live cart assertion | Covered by live smoke |
| User-scoped order history | Service + DB | `order.service.test.ts` | Live order list assertion | Covered by unit + live smoke |
| Admin product create/update/retire | HTTP + DB | Service and RBAC tests exist | Live admin lifecycle probe | Covered by live QA pass |
| Migration application | DB migration | No committed migration runner test | `docker compose ... migrate` | Covered by environment run only |
| Real HTTP controller contract suite | Supertest | No Supertest dependency or suite | Not added | GAP |
| Concurrency/stock contention | DB stress | No dedicated stress harness | Not run | GAP |
