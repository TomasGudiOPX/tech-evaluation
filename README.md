# Shopping Cart Technical Evaluation

This repository contains a full-stack shopping-cart application for the technical evaluation in `evaluation.md`.

## Stack

- Vite + React single-page storefront in `apps/web`.
- NestJS API on Fastify in `apps/api`.
- PostgreSQL persistence through Prisma migrations.
- Shared Zod schemas and TypeScript types in `packages/contracts`.
- Nginx proxy for one public HTTP entry point.
- GitHub Actions CI for reproducible checks on `develop` and `main`.

The app keeps the pragmatic VPS template shape but implements the evaluation domain directly. The Stitch minimalist retail showcase is used only as a UI/UX reference model; product content, API behavior, and scope remain specific to this shopping-cart project.

## Implemented Scope

- Public catalog and product detail.
- Email/password registration, login, JWT profile, and RBAC.
- Admin product create, update, and logical retire.
- Authenticated persistent cart with add, update, and remove.
- Simulated checkout with required `Idempotency-Key`.
- Atomic stock decrement, immutable order item snapshots, and order history.
- Product-detail reviews with public listing and authenticated customer create/update ownership.
- Supervised action workflow over the MCP endpoint: read-only context tools plus a propose/approve/execute loop with an append-only approval ledger.
- Swagger/OpenAPI documentation at `/api/docs`.

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`.
- `GET /api/products`, `GET /api/products/:id`.
- `GET /api/products/:productId/reviews`, `POST /api/products/:productId/reviews`, `PATCH /api/reviews/:reviewId`.
- `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:productId`, `DELETE /api/cart/items/:productId`.
- `POST /api/orders/checkout`, `GET /api/orders`.
- `POST /api/admin/products`, `PATCH /api/admin/products/:id`, `DELETE /api/admin/products/:id`.

## MCP / Supervised Workflow

The API exposes a Model Context Protocol endpoint at `/mcp` (mounted only when `MCP_API_TOKEN` is set). It provides read-only catalog/order/cart/user/review tools plus a supervised action loop: `propose_action`, `list_actions`, `get_action`, `approve_action`, `reject_action`, `correct_action`, and `get_action_metrics`. Business writes execute only through the executor on an explicit approval. See `docs/VPS-DOC.md` for the exposure and token requirements.

## Structure

```text
browser -> nginx proxy -> Vite React static app
                     -> NestJS API -> PostgreSQL
```

| Path | Responsibility |
| --- | --- |
| `apps/web/` | Product-facing React storefront, cart, checkout, orders, and admin UI |
| `apps/api/src/platform/` | Configuration, Prisma, and shared app infrastructure |
| `apps/api/src/modules/` | Auth, products, cart, orders, and reviews modules |
| `packages/contracts/` | Shared schemas and API types |
| `apps/api/prisma/` | Prisma schema, migrations, and deterministic seed |
| `openspec/` | Accepted specs and proposed changes |
| `docs/obsidian-vault/` | Requirement traceability and AI evidence |
| `.github/workflows/ci.yml` | Source verification pipeline |

## Local Development

Use Node 22 with Corepack. For a split local run, start only PostgreSQL with Compose, then run the API and web dev servers from the host:

```powershell
corepack enable
yarn install --immutable
Copy-Item .env.example .env
docker compose --env-file .env up -d db
$env:DATABASE_URL="postgresql://app:app@localhost:5432/app"
yarn workspace @vps-template/api prisma:generate
yarn workspace @vps-template/api prisma migrate deploy
yarn workspace @vps-template/api seed
yarn workspace @vps-template/api dev
```

In another terminal:

```powershell
$env:VITE_API_BASE_URL="http://localhost:3000/api"
yarn workspace @vps-template/web dev
```

Open the Vite app at `http://localhost:5173`. The Docker database is bound to `127.0.0.1` by default through `POSTGRES_BIND_ADDRESS` and `POSTGRES_PORT`.

## Docker Run

The Compose file does not define separate `dev`, `qa`, or `prod` profiles. Development, staging, and production are separate environment instances using the same Compose file with different `.env` values, branches, project names, ports, database names, credentials, and domains. The only Compose profile is `ops`, used for one-off migration and seed jobs.

```powershell
Copy-Item .env.example .env
docker compose --env-file .env --profile ops run --rm --build migrate
docker compose --env-file .env --profile ops run --rm seed
docker compose --env-file .env up -d --build
```

Open `http://localhost:8080`, verify `http://localhost:8080/health`, and inspect API docs at `http://localhost:8080/api/docs`. Stop the stack with `docker compose --env-file .env down`; add `--volumes` only when intentionally deleting local PostgreSQL data.

## Verification

```powershell
yarn lint
yarn workspace @vps-template/contracts build
yarn workspace @vps-template/api prisma:generate
yarn workspace @vps-template/api build
yarn workspace @vps-template/api test
yarn workspace @vps-template/web build
yarn build
```

Read [docs/VPS-DOC.md](docs/VPS-DOC.md) for deployment and operations, [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the development workflow, and [INFORME_IA.md](INFORME_IA.md) for AI-use evidence.
