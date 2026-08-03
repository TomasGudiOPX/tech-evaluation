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
- Swagger/OpenAPI documentation at `/api/docs`.

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`.
- `GET /api/products`, `GET /api/products/:id`.
- `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:productId`, `DELETE /api/cart/items/:productId`.
- `POST /api/orders/checkout`, `GET /api/orders`.
- `POST /api/admin/products`, `PATCH /api/admin/products/:id`, `DELETE /api/admin/products/:id`.

## Structure

```text
browser -> nginx proxy -> Vite React static app
                     -> NestJS API -> PostgreSQL
```

| Path | Responsibility |
| --- | --- |
| `apps/web/` | Product-facing React storefront, cart, checkout, orders, and admin UI |
| `apps/api/src/platform/` | Configuration, Prisma, and shared app infrastructure |
| `apps/api/src/modules/` | Auth, products, cart, and orders modules |
| `packages/contracts/` | Shared schemas and API types |
| `apps/api/prisma/` | Prisma schema, migrations, and deterministic seed |
| `openspec/` | Accepted specs and proposed changes |
| `docs/obsidian-vault/` | Requirement traceability and AI evidence |
| `.github/workflows/ci.yml` | Source verification pipeline |

## Local Development

Use Node 22 with Corepack:

```powershell
corepack enable
yarn install --immutable
Copy-Item .env.example .env
yarn workspace @vps-template/api prisma:generate
yarn workspace @vps-template/api seed
yarn workspace @vps-template/api dev
yarn workspace @vps-template/web dev
```

The web app calls `/api` by default. For a split local run, set `VITE_API_BASE_URL=http://localhost:3000/api` for the web process.

## Docker Run

```powershell
Copy-Item .env.example .env
docker compose --env-file .env up -d --build
yarn workspace @vps-template/api seed
```

Open `http://localhost:8080`, verify `http://localhost:8080/health`, and inspect API docs at `http://localhost:8080/api/docs`.

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
