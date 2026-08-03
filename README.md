# Shopping Cart Technical Evaluation

This repository contains a full-stack shopping-cart application for the technical evaluation in `evaluation.md`.

## Technical Decision

The implementation will use the suggested evaluation stack: Next.js for the web app, NestJS for the API, PostgreSQL for persistence, and Prisma for ORM/migrations.

This replaces the original Vite/Fastify template deliberately. The evaluation allows any Node.js/TypeScript stack if justified, but choosing the suggested stack reduces review friction and makes the learning goal explicit: show a small modular monolith with framework-level boundaries, documented REST contracts, versioned migrations, and traceable AI-assisted development.

Identity and RBAC use email/password authentication with JWT access tokens. Public registration creates only `customer` users; administrator access is created through environment-controlled seed credentials, not request input.

Products are exposed through a public active-only catalog and protected administrator writes. Product removal is logical retirement: retired products stay in PostgreSQL for auditability and future order-history integrity, but they disappear from public catalog/detail responses and cannot be checked out later.

## API Scope

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`.
- `GET /api/products`, `GET /api/products/:id`.
- `POST /api/admin/products`, `PATCH /api/admin/products/:id`, `DELETE /api/admin/products/:id`.

Read [docs/VPS-DOC.md](docs/VPS-DOC.md) for the human deployment and usage guide. [docs/README.md](docs/README.md) indexes the full documentation. Coding agents should follow [AGENT.md](AGENT.md).

An optional bearer-token-protected MCP endpoint is documented in [docs/VPS-DOC.md](docs/VPS-DOC.md#optional-mcp-connection). Its client configuration starter is [mcp-config.example.json](mcp-config.example.json).

It borrows Twenty's useful production pattern: containerize the application, keep state in PostgreSQL, and expose one public HTTP entry point. It keeps only a small Yarn workspace for shared contracts and leaves out the worker, Redis, GraphQL, and CRM-specific platform modules that a small project does not need on day one.

## Structure

```
browser -> nginx proxy -> React frontend
                     -> Fastify API -> PostgreSQL
```

| Path | Responsibility |
| --- | --- |
| `apps/web/` | Vite + React single-page app, served as static files |
| `apps/api/src/platform/` | Configuration and database connection setup |
| `apps/api/src/modules/` | Client business features, beginning with `projects` |
| `apps/api/src/engine/mcp/` | Optional MCP transport, authentication, instructions, and tools |
| `packages/contracts/` | Shared API schemas and types for the frontend and backend |
| `openspec/` | Accepted operational specifications and future change proposals |
| `nginx/` | Routes `/` to the frontend and `/api` plus `/health` to the API |
| `docker-compose.yml` | Starts the whole stack and persists PostgreSQL data |

## Development tooling

The repository uses Yarn 4 workspaces and commits `yarn.lock`. This gives every developer and Docker build the same dependency graph while keeping frontend, backend, and shared contracts separate.

For source-only work, use Node 22 with Corepack:

```powershell
corepack enable
yarn install --immutable
yarn workspace @vps-template/api prisma:generate
yarn workspace @vps-template/api seed
yarn build
```

## Run locally

1. Copy the environment defaults: `Copy-Item .env.example .env`
2. Change `POSTGRES_PASSWORD` in `.env`.
3. Start the stack: `docker compose up -d --build`
4. Run the deterministic product seed from the source checkout after dependencies are installed: `yarn workspace @vps-template/api seed`.
5. Open `http://localhost:8080` and check `http://localhost:8080/health`.

The UI creates projects through `POST /api/projects`, so it verifies the proxy, frontend, backend, and database together.

## Start a client project

1. Copy this directory and rename the copy for the client.
2. Change `COMPOSE_PROJECT_NAME`, `HTTP_PORT`, and the PostgreSQL credentials in the copied `.env`.
3. Replace the example `projects` feature under `apps/api/src/modules/projects` with the client domain model.
4. Add database migrations before the schema becomes more complex than this starter example.

## Environments on One VPS

Use one source tree per deployed environment, not separate frontend/backend codebases. A small client project normally needs production and staging; development runs locally.

- Give each environment its own checkout or Git worktree, `.env`, Compose project name, database credentials, and port.
- Keep `HTTP_BIND_ADDRESS=127.0.0.1` so only a host-level TLS proxy can reach each stack.
- Route `app.example.com` to production and `staging.example.com` to staging through Caddy or another proxy.
- Do not share a production database with staging or temporary previews.

The Bitbucket branch and VPS deployment workflow is in [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md). The accepted operational specification is in [openspec/specs/deployment-environments.md](openspec/specs/deployment-environments.md).

## VPS deployment notes

- Point a domain at the VPS and put TLS in front of this Compose stack with Caddy, Traefik, or a managed reverse proxy.
- Allow only SSH and HTTP/HTTPS through the VPS firewall. Do not expose PostgreSQL or the API ports directly.
- Back up the `postgres-data` volume or use a scheduled `pg_dump` to off-host storage.
- Set a unique database password for every deployment and keep `.env` out of Git.
- Add Redis or a worker only when the product genuinely needs queues, scheduled jobs, or long-running tasks.
