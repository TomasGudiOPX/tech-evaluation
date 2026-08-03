# Backend QA Run Contract

## Run

- RUN_ID: `run-20260803-qa-implementation`
- Branch: `QA-Implementation`
- Revision: `262a67b555510541c750d87b20375880d41f9527`
- Scope: auth, catalog, RBAC, cart, checkout, orders, and admin product lifecycle
- Environment: isolated Docker Compose project `shopping-cart-qa`
- Base URL: `http://127.0.0.1:18080`

## Source of truth

- `docs/obsidian-vault/01 Requisitos/Requisitos de Calidad.md`
- `openspec/changes/add-cart-checkout-orders/`
- `openspec/changes/finalize-delivery-docs-ci-polish/`
- `docs/DEVELOPMENT.md`

## Layers

- In scope: existing API unit/service/repository tests, live API smoke, real PostgreSQL migrations, auth/RBAC, checkout idempotency.
- Out of scope: Playwright browser automation, worker/queue processing, external integrations, load testing, and production deployment.
- Boundary: the live smoke uses the isolated local database and no third-party write endpoints.

## Exit criteria

- Existing API suite is green.
- Live smoke proves health, auth, catalog, customer RBAC, cart, checkout retry safety, cart clearing, and order history.
- Any missing test layer is reported as a gap, not treated as covered.
