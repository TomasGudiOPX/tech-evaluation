# Agent Guide

## Purpose

`vps1-test` is a deliberately small, self-hosted application template for client work. It provides a React frontend, a Node API, PostgreSQL, and one public HTTP entry point. Optimize for a simple single-VPS deployment, understandable ownership, and a small operational footprint.

Do not turn this into a large platform clone. The template keeps the container topology small and leaves out product-specific platform modules, workers, and distributed infrastructure until a client requirement justifies them.

## Architecture

```text
browser -> proxy (Nginx) -> frontend (static React files)
                         -> backend (Fastify API) -> db (PostgreSQL)
```

- `docker-compose.yml` is the deployment boundary. Only `proxy` publishes a host port.
- `apps/web/` is a Vite React application. It calls the API through `/api`, not a hard-coded host or port.
- `apps/api/src/platform/` owns configuration and database connection setup.
- `apps/api/src/modules/` owns client business features. A module contains its routes, service, repository, and validation through shared contracts.
- `apps/api/src/engine/` owns cross-cutting capabilities. `engine/mcp/` provides the optional, bearer-token-protected Streamable HTTP MCP endpoint.
- `packages/contracts/` is the only shared workspace package. Add to it only types and schemas genuinely used by both frontend and backend.
- `openspec/specs/` records accepted operational behavior; `openspec/changes/` holds planned changes before implementation.
- `db/` is represented by the PostgreSQL service and the `postgres-data` named volume. Do not expose it to the host network.
- `nginx/default.conf` routes `/` to the frontend, `/api/` to the API, and `/health` to the API health check.

## Intentional Limits

- This template has no authentication, background worker, Redis, queues, object storage, email provider, or migration framework yet.
- The `projects` table and routes are a working full-stack example, not a domain model to preserve.
- `CREATE TABLE IF NOT EXISTS` is acceptable only for this starter example. Introduce migrations before changing production schema beyond a trivial prototype.
- TLS termination is intentionally external to this Compose stack. Use Caddy, Traefik, or a managed proxy when deploying a domain.

## Working Rules

- Preserve the single public entry point. Do not add `ports:` to `backend` or `db` for production use.
- Keep `HTTP_BIND_ADDRESS=127.0.0.1` for VPS deployments. A host-level TLS proxy should route domains to each environment's unique `HTTP_PORT`.
- Keep frontend API calls relative to `/api`. This avoids per-environment frontend builds and keeps the proxy responsible for routing.
- Keep MCP optional and bearer-token protected. Do not expose database queries, shell commands, arbitrary HTTP, or write operations without deliberate validation and authorization.
- MCP tools must call feature services, not query the database directly. Keep instructions concise, limit read results, and require confirmation for destructive, bulk, or ambiguous writes.
- Use Yarn 4 from the repository root. Commit `yarn.lock`; do not commit `.yarn/cache` or `node_modules`.
- Put configuration in `.env` through Compose variables. Keep `.env.example` complete, non-secret, and committed; never commit `.env`.
- Give each client copy a unique `COMPOSE_PROJECT_NAME`, `HTTP_PORT`, database name, database user, and password.
- Treat production and staging as separate Compose projects with separate checkouts or Git worktrees, `.env` files, databases, volumes, backups, and domains. Do not run a VPS stack for every developer.
- Prefer adding a focused service or dependency only after a concrete product requirement exists.
- Keep `restart: unless-stopped` on long-running services unless a deployment need requires a different policy.

## Validation

From the relevant directory:

```powershell
Copy-Item .env.example .env
docker compose --env-file .env config
docker compose up -d --build
Invoke-WebRequest http://localhost:8080/health
```

For source-only checks:

```powershell
corepack enable
yarn install --immutable
yarn build
```

Use the client copy's configured `HTTP_PORT` when testing a copied project. Before handing off a deployment, confirm that the UI can create a project and that `GET /health` reports a connected database.

When MCP is enabled, use `mcp-config.example.json` with the real HTTPS domain and `MCP_API_TOKEN`. Confirm that the client can run `tools/list` before adding client-specific tools.

## Documentation Ownership

- Update `docs/VPS-DOC.md` when changing environment variables, deployment workflow, or operations.
- Update `docs/DESIGN.md` when changing an architectural decision or boundary.
- Update `docs/DEVELOPMENT.md` when changing the development, quality, MCP, or release workflow.
- Update `docs/ENVIRONMENTS.md` when changing Bitbucket branch flow, environment isolation, or rollback procedure.
- Update `README.md` when changing the short project overview or quick-start instructions.
- Update `openspec/specs/` when changing accepted deployment, security, or public-interface behavior.
- Update this guide when changing conventions that another coding agent needs to follow.
