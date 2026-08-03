# Development Guide

## Purpose

Use this guide to turn an evaluation requirement into a safe OpenSpec change, a reviewed Git branch, a staging-ready build, and then a production-ready release. It applies to this shopping-cart modular monolith and keeps the delivery small: one web app, one API, one PostgreSQL database, and one public proxy entry point.

Read [DESIGN.md](DESIGN.md) for the architectural boundaries, [ENVIRONMENTS.md](ENVIRONMENTS.md) for the VPS deployment workflow, and [../INFORME_IA.md](../INFORME_IA.md) for the AI-use evidence required by the evaluation.

## Development Loop

```text
understand -> specify -> implement -> verify -> review -> staging -> production -> observe
```

1. Understand the client workflow and identify the affected API module, web screen, database data, and MCP capability.
2. Create an OpenSpec change when the work changes behavior, a public interface, security, data handling, deployment, or operations.
3. Create a `feature/<short-name>` branch from `develop`.
4. Implement the smallest complete vertical slice.
5. Run the available local checks and verify the behavior.
6. Push the branch to GitHub and review it before merging into `develop`.
7. Deploy the merged change to staging and test the real workflow.
8. Merge `develop` into `main` only after staging-style approval, then prepare the final delivery.
9. Record release, monitoring, and follow-up work.

## Local Setup

From the repository root:

```powershell
corepack enable
yarn install --immutable
Copy-Item .env.example .env
yarn workspace @vps-template/api prisma:generate
yarn workspace @vps-template/api seed
docker compose --env-file .env up -d --build
Invoke-WebRequest http://localhost:8080/health
```

The stack binds to `127.0.0.1` by default. Open `http://localhost:8080` locally. Stop it with `docker compose down`; do not use `--volumes` unless intentionally removing local data.

The source checks for the evaluation project are:

```powershell
yarn workspace @vps-template/contracts build
yarn lint
yarn workspace @vps-template/api build
yarn workspace @vps-template/api test
yarn workspace @vps-template/web build
yarn build
```

## Where Changes Belong

| Need | Location | Rule |
| --- | --- | --- |
| Browser screen or interaction | `apps/web/` | Keep API calls relative to `/api` |
| Client business behavior | `apps/api/src/modules/<feature>/` | Keep route, service, and repository together |
| Configuration or database setup | `apps/api/src/platform/` | Do not put client business rules here |
| Shared API schema or type | `packages/contracts/` | Add only when both web and API need it |
| Cross-cutting capability | `apps/api/src/engine/` | It must call module services, not bypass them |
| MCP transport, policy, or tools | `apps/api/src/engine/mcp/` | Tools call module services and use narrow schemas |
| Design or operational decision | `docs/` and `openspec/` | Record the decision before it becomes tribal knowledge |

Build features as vertical slices:

```text
web screen or MCP tool
        -> API route
        -> module service
        -> module repository
        -> PostgreSQL
```

The MCP tool may enter through a different transport, but it must reach the same service as the HTTP route. Do not add direct MCP SQL queries.

## Data Changes

Prisma is the migration boundary for this project. Before a feature introduces real data changes, update `apps/api/prisma/schema.prisma`, add a versioned migration under `apps/api/prisma/migrations/`, and follow these rules:

1. Version every schema change in a migration.
2. Test the migration against a disposable database before staging.
3. Back up production before running a production migration.
4. Prefer backward-compatible changes: add new fields first, deploy compatible code, migrate data, then remove old fields in a later release.
5. Never use staging or production data as a developer's local test database.

Current migration-backed modules:

- `auth`: owns `User` and `UserRole`.
- `products`: owns `Product`; product removal is logical retirement through `isActive=false`, not hard deletion.
- `cart`: owns `Cart` and `CartItem` for authenticated customers.
- `orders`: owns `Order`, `OrderItem`, and checkout idempotency records.

Seed data lives in `apps/api/prisma/seed.ts`. The product seed is deterministic and inserts only when the product table is empty.

## MCP and Agent Changes

MCP is optional. Leaving `MCP_API_TOKEN` blank keeps it unavailable.

For every MCP tool:

1. Start with a specific client action, not a generic database operation.
2. Define a small input schema and a bounded output.
3. Reuse the feature service that the API route uses.
4. Mark whether the tool reads or writes data.
5. Limit reads and filter results before returning them to a model.
6. Require an explicit product decision before exposing destructive, bulk, or sensitive operations.
7. Test `tools/list` and the tool's happy path against staging before production use.

Instructions help an agent use tools correctly, but they are not a security boundary. Before a client relies on MCP writes, add server-enforced tool scopes, audit records, and an approval policy appropriate to that client's risk.

## Quality Gates

The project currently enforces dependency reproducibility, type checks, compilation, Prisma generation, API tests, and frontend build output through local commands and GitHub Actions:

```powershell
yarn install --immutable
yarn lint
yarn workspace @vps-template/contracts build
yarn workspace @vps-template/api prisma:generate
yarn workspace @vps-template/api build
yarn workspace @vps-template/api test
yarn workspace @vps-template/web build
yarn build
```

In restricted Windows/sandboxed environments, Vitest, Vite, and Yarn workspace orchestration may fail with `spawn EPERM` when helper processes are blocked. Treat that as an environment permission failure, then rerun the same commands in a normal terminal or approved execution context before recording the result.

Add these gates as the project grows beyond the evaluation scope:

| Trigger | Required addition |
| --- | --- |
| First non-trivial feature | Module tests for the service and route behavior |
| First schema change | Migration runner and migration test |
| More than one developer | ESLint, Prettier, and stricter formatting checks |
| First external integration | Contract test, timeout, retry policy, and failure-path test |
| First MCP write tool | Scoped credentials, audit log, and policy test |
| First sensitive client data | Authentication, authorization, backups, and restore test |

Keep checks as root Yarn scripts so developers, GitHub Actions, and future deployment automation run the same commands. Current CI lives in `.github/workflows/ci.yml` and runs on pushes and pull requests to `develop` and `main`.

## GitHub Branches and Pull Requests

Use the branch flow from [ENVIRONMENTS.md](ENVIRONMENTS.md):

```text
feature/* -> develop -> staging
develop -> main -> production
```

A pull request should include:

- A concise description of the client behavior changed.
- Any OpenSpec change or specification update.
- Database migration and rollback notes when data changes.
- MCP tool and permission notes when agent access changes.
- The checks run locally.
- A staging verification plan.

Protect `main` with pull requests and successful checks. Do not deploy unreviewed feature branches to production.

## Staging and Production

Staging and production are separate Compose projects on the VPS. They have separate checkouts, `.env` files, Compose names, loopback ports, databases, volumes, domains, and backups.

Deploy only the target branch in its matching directory:

```powershell
git fetch origin
git pull --ff-only origin <branch>
docker compose --env-file .env up -d --build
docker compose ps
docker compose logs --tail 100 api
```

Verify the final domain, `/health`, `/api/docs`, catalog browsing, login/register, cart mutation, checkout, order history, and admin product management. Record the deployed commit with `git rev-parse HEAD`.

## Definition of Done

Before considering a change complete:

- The behavior works locally and has passed the available checks.
- The code follows the module and contract boundaries.
- Data changes have migrations and a rollback plan.
- MCP tools are narrow, validated, and subject to the intended policy.
- Documentation and OpenSpec records reflect the change.
- The GitHub pull request is reviewed and merged into the correct branch.
- Staging has been verified before production deployment.
- Production deployment and the deployed commit are recorded.

## UI/UX Reference

The Stitch minimalist retail showcase is a design reference, not a source of truth. Use it to model the tone of the storefront: product-first imagery, quiet typography, restrained controls, and clear shopping tasks. Do not copy Aura-specific copy, products, routes, or assumptions when they conflict with this project's contracts or evaluation scope.
