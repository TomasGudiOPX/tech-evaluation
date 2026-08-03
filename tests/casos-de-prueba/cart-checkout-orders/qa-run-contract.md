# Frontend QA Run Contract

- RUN_ID: `run-20260803-qa-implementation`
- Branch: `QA-Implementation`
- Revision: `262a67b555510541c750d87b20375880d41f9527`
- App: Vite/React storefront served by the Compose web/proxy stack
- Target URL: `http://127.0.0.1:18080`
- Intended harness: Playwright
- Current harness state: BLOCKED; no `@playwright/test` dependency, Playwright config, or frontend test files exists in `apps/web`.

## Source of truth

- `docs/obsidian-vault/01 Requisitos/Requisitos de Calidad.md`
- `README.md`
- `docs/DEVELOPMENT.md`

## Required browser flows

- Public catalog and product detail.
- Register/login and authenticated navigation.
- Add, update, and remove cart items.
- Review and place a simulated order.
- Confirm order history and logout state.
- Admin create, edit, and retire product flow.

No browser pass is claimed until these flows have Playwright cases with rendered UI assertions.
