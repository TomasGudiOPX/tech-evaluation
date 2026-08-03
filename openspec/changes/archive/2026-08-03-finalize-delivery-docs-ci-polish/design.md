# Delivery Docs, CI, and UI Polish Design

## Decision

Keep the existing Vite + React frontend and document it as the selected frontend stack for final delivery. The original office-hours plan suggested Next.js, but the evaluation allows another Node.js/TypeScript frontend when justified. At this point, converting to Next.js would add framework churn while the higher-value work is replacing the starter UI with a polished commerce experience and making CI/docs reproducible.

Use the Stitch reference at `../stitch_minimalist_retail_showcase` as a UI/UX reference model, not a source of truth to copy literally. Borrow the useful principles from its `Aura Commerce` direction: trustworthy, tidy, minimalist retail with editorial product presentation, restrained slate/indigo surfaces, clear functional text, strong product headings, 4px spacing rhythm, 8-12px radii, soft shadows, product-first imagery, and dense but calm admin tables. Adapt those ideas to this project's real data, API, scope, and evaluation goals.

## Current Gaps

```text
implemented backend
  auth/RBAC
  products/admin
  cart/checkout/orders

remaining delivery surface
  web still starter projects UI
  docs still mention Fastify/projects/Bitbucket in places
  no GitHub Actions workflow
  no Swagger setup
  root scripts are build-only
```

## UI Approach

The Vite app should become a single polished retail experience with internal view state instead of routing complexity. The minimum evaluator walkthrough:

1. Visitor sees a responsive product catalog using real product API data.
2. Visitor can open product detail.
3. User can register/login or use a seeded/demo login path documented in README.
4. Authenticated user can add/update/remove cart items.
5. Authenticated user can run simulated checkout and see success or domain errors.
6. Authenticated user can view order history.
7. Admin can create/update/retire products from a restrained admin panel.

The UI should avoid feature-explainer copy. The first screen is the shop itself, not a landing page. Use visible status/errors only for real workflow state.

## Visual Translation From Stitch

- Brand shell: compact retail header with catalog/cart/history/admin/profile affordances.
- Catalog: editorial section header, product-first 4:5 cards, hover add affordance, price and stock metadata.
- Detail: large product image, product copy, stock state, quantity control, primary add-to-cart action.
- Cart: clean line-item list with image, quantity stepper, remove action, totals sidebar.
- Checkout: simple simulated checkout panel; no real card capture required, but retain secure/order-summary visual language.
- Order history: quiet list of orders with immutable item snapshots and totals.
- Admin: dense table-like product management surface with stock badges and icon actions.

Use remote seeded product image URLs from the API where available. If a visual placeholder is needed, keep it product-specific and inspectable, not decorative. Do not copy Aura-specific content, fake categories, exact screens, or workflows that do not fit this shopping-cart evaluation.

## API Documentation

Add Swagger through NestJS `DocumentBuilder` and `SwaggerModule` during app bootstrap. Publish the REST contract at `/api/docs` or `/docs` behind the same API service. The docs must describe auth, products, admin product writes, cart, checkout idempotency, and orders.

If decorators are too heavy for the timebox, start with controller-level tags and operation summaries, then improve DTO detail only where the generated contract would otherwise be misleading.

## CI Design

Add `.github/workflows/ci.yml` for pull requests and pushes to `develop`/`main`.

Pipeline:

```text
checkout
setup node 22 + yarn cache
corepack enable
yarn install --immutable
yarn workspace @vps-template/contracts build
yarn workspace @vps-template/api prisma:generate
yarn workspace @vps-template/api build
yarn workspace @vps-template/api test
yarn workspace @vps-template/web build
yarn build
```

If lint/format dependencies are added, include them before build. If not, document why the final gate is typecheck/build/test for this timebox.

## Docs Truth Pass

Update documents so they no longer contradict the implementation:

- `README.md`: Vite + React frontend, NestJS API, commerce walkthrough, Swagger, CI.
- `AGENT.md`: current module boundaries and no stale Fastify/projects claims.
- `docs/VPS-DOC.md`: current service names and commerce verification workflow.
- `docs/DESIGN.md`: NestJS API and current architecture.
- `docs/DEVELOPMENT.md`: GitHub/develop flow, final verification commands, Swagger and CI.
- `docs/ENVIRONMENTS.md`: GitHub wording or explicitly generic Git provider wording.
- `openspec/specs/deployment-environments.md`: remove stale Fastify wording.
- `INFORME_IA.md` and vault evidence: record UI/reference, CI, docs polish, and final verification.

## Stale Code Cleanup

The starter `projects` route/service/MCP tool should not remain as the primary visible workflow. Prefer deleting it if it is no longer wired. If MCP route setup still depends on it, either remove optional MCP project tools or replace them with read-only commerce tools. Avoid direct SQL shortcuts; MCP tools must call domain services.

## Testing and Verification

Required checks:

- Contracts build.
- Prisma generate.
- API build.
- API tests.
- Web build.
- Root build.
- GitHub Actions workflow syntax is committed.
- If Docker is available, run `docker compose --env-file .env.example config` or document why it was not run.

For UI polish, perform at least a local build. If a browser QA tool is available, inspect desktop and mobile screenshots for layout overflow, stale project copy, blank images, and inaccessible workflow state.
