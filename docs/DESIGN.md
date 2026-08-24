# Design Decisions

## Purpose

This shopping-cart evaluation favors a small modular monolith on one VPS over early microservices or several managed platforms. The design goal is traceable commerce behavior with a small operating footprint.

## System Shape

```text
internet -> host TLS proxy -> environment proxy -> web or API -> PostgreSQL
```

Each deployed environment is one Docker Compose project with four containers:

| Service | Responsibility | Host exposure |
| --- | --- | --- |
| `proxy` | Routes browser, API, API docs, and health requests | One loopback port |
| `web` | Serves the built Vite React application | Internal only |
| `api` | Runs the NestJS application | Internal only |
| `db` | Stores PostgreSQL data in a named volume | Internal only |

## Source Boundaries

```text
apps/
  api/                 NestJS modular monolith
    prisma/            Schema, migrations, and seed
    src/platform/      Configuration, Prisma, and shared app infrastructure
    src/modules/       Auth, products, cart, orders, reviews, and actions
    src/engine/mcp/    Model Context Protocol endpoint (read + supervised-action tools)
  web/                 Vite React storefront
packages/
  contracts/           Shared Zod schemas and API types
docs/                  Operating, design, and evidence documentation
openspec/              Accepted specifications and planned changes
```

Business behavior belongs in `src/modules/<feature>`. A feature owns its controller, service, repository, and feature-specific validation through shared contracts where useful. Cross-cutting infrastructure stays in `src/platform`.

## Commerce Decisions

| Decision | Reason | Consequence |
| --- | --- | --- |
| Public catalog, admin writes | Keeps shopping flow open while protecting inventory changes | Admin routes require JWT and `admin` role |
| Logical product retirement | Preserves history and avoids broken order snapshots | Retired products are hidden from public catalog and rejected at checkout |
| Authenticated cart only | Avoids guest-cart merge complexity | Cart and checkout require login |
| Simulated checkout | Meets evaluation scope without payment-provider risk | No external payment call is made |
| Idempotent checkout key | Supports retry-safe order creation | Reusing a key for a changed cart returns a domain error |
| Reviews as standalone module | Keeps customer feedback separate from catalog ownership | Products stay review-free by default; reviews reference active products and users |
| Supervised action workflow | The agent proposes and the human approves; only the executor writes | Writes are ledger-audited and read back; deferred kinds are rejected until a later slice |
| Prisma migrations | Makes data changes reviewable and repeatable | Schema changes require versioned migration files |

## UI Direction

The Stitch minimalist retail showcase is a reference model, not canonical content. The UI adapts its calm retail hierarchy, product-first imagery, restrained spacing, and minimal controls to this project while keeping this app's actual products, endpoints, and evaluation scope.

## Infrastructure Decisions

| Decision | Reason | Consequence |
| --- | --- | --- |
| Docker Compose on one VPS | Predictable cost and simple handover | Capacity is finite; monitor disk, memory, and backups |
| PostgreSQL only | One durable datastore for normal commerce workflows | Add Redis, queues, or object storage only for a concrete need |
| One public entry point | Smaller attack surface and simpler routing | API and database ports stay internal |
| Loopback-bound environment port | The TLS proxy controls public access | Every environment needs a unique `HTTP_PORT` |
| GitHub `develop`/`main` flow | Simple review path for staging and production | CI must pass before merge |
| Yarn 4 workspace | One lockfile and a shared contract boundary | Developers use Corepack and `yarn install --immutable` |

## Change Control

Use `openspec/changes/` for planned behavior or operational changes. After implementation, update the relevant spec, docs, vault evidence, and `INFORME_IA.md`.
