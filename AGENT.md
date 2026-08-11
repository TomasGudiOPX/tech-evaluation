# Agent Guide

## Purpose

This repository is a shopping-cart technical evaluation delivered as a small modular monolith. Optimize for clear requirement traceability, conservative scope, and a reproducible local/VPS handoff.

## Architecture

```text
browser -> proxy (Nginx) -> frontend (Vite React static files)
                         -> backend (NestJS API) -> db (PostgreSQL)
```

- `docker-compose.yml` is the deployment boundary. Only `proxy` publishes a host port.
- `apps/web/` owns the catalog, product detail, auth, cart, checkout, orders, and admin UI.
- `apps/api/src/platform/` owns configuration, Prisma setup, global errors, and shared infrastructure.
- `apps/api/src/modules/` owns business modules: `auth`, `products`, `cart`, and `orders`.
- `packages/contracts/` contains only schemas and types shared by API and web.
- `apps/api/prisma/` contains the schema, versioned migrations, and deterministic seed.
- `openspec/` records accepted behavior and planned changes.
- `docs/obsidian-vault/` records requirement traceability and AI evidence.
- `nginx/default.conf` routes `/` to the frontend, `/api/` to the API, and `/health` to the API health check.

## Working Rules

- Keep frontend API calls relative to `/api` unless running split local dev with `VITE_API_BASE_URL`.
- Keep feature logic inside the owning Nest module service and repository.
- Use shared contract schemas when both frontend and backend need the same type or validation shape.
- Keep product retirement logical; do not hard-delete products that can appear in historical orders.
- Keep checkout simulated and idempotent. `POST /api/orders/checkout` requires `Idempotency-Key`.
- Public registration creates only `customer`; admin access comes from environment-controlled seed credentials.
- Preserve one public entry point. Do not expose API or PostgreSQL ports directly for production.
- Use Yarn 4 from the repository root and commit `yarn.lock`.
- Update docs, OpenSpec, and vault evidence when behavior, architecture, CI, deployment, or AI-use traceability changes.

## Validation

```powershell
corepack enable
yarn install --immutable
yarn lint
yarn workspace @vps-template/contracts build
yarn workspace @vps-template/api prisma:generate
yarn workspace @vps-template/api build
yarn workspace @vps-template/api test
yarn workspace @vps-template/web build
yarn build
docker compose --env-file .env.example config
```

In restricted Windows agent sandboxes, Yarn, Vite, Vitest, or Prisma may fail with helper-process `spawn EPERM`. Treat that as an execution permission issue and rerun the same command in an approved context before recording verification.

## Documentation Ownership

- Update `README.md` for the project overview and quick start.
- Update `docs/VPS-DOC.md` when commands, ports, environment variables, backups, or deployment steps change.
- Update `docs/DESIGN.md` when architecture or module boundaries change.
- Update `docs/DEVELOPMENT.md` when development, CI, quality, or release workflow changes.
- Update `docs/ENVIRONMENTS.md` when branch flow, environment isolation, or rollback procedure changes.
- Update `openspec/specs/` when accepted behavior changes.
- Update `INFORME_IA.md` and `docs/obsidian-vault/` for AI-use evidence required by the evaluation.
