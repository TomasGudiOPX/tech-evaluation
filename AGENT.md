# Agent Guide

## Purpose

`vps1-test` is a deliberately small, self-hosted application template for client work. It provides a React frontend, a Node API, PostgreSQL, and one public HTTP entry point. Optimize for a simple single-VPS deployment, understandable ownership, and a small operational footprint.

Do not turn this into a large platform clone. The template keeps the container topology small and leaves out product-specific modules, workers, and monorepo complexity until a client requirement justifies them.

## Architecture

```text
browser -> proxy (Nginx) -> frontend (static React files)
                         -> backend (Fastify API) -> db (PostgreSQL)
```

- `docker-compose.yml` is the deployment boundary. Only `proxy` publishes a host port.
- `frontend/` is a Vite React application. It calls the API through `/api`, not a hard-coded host or port.
- `backend/` is a TypeScript Fastify process. It reads `DATABASE_URL` and owns API routes and database access.
- `backend/src/mcp.ts` provides an optional, token-protected MCP endpoint at `POST /mcp`.
- `db/` is represented by the PostgreSQL service and the `postgres-data` named volume. Do not expose it to the host network.
- `nginx/default.conf` routes `/` to the frontend, `/api/` to the API, and `/health` to the API health check.

## Intentional Limits

- This template has no authentication, background worker, Redis, queues, object storage, email provider, or migration framework yet.
- The `projects` table and routes are a working full-stack example, not a domain model to preserve.
- `CREATE TABLE IF NOT EXISTS` is acceptable only for this starter example. Introduce migrations before changing production schema beyond a trivial prototype.
- TLS termination is intentionally external to this Compose stack. Use Caddy, Traefik, or a managed proxy when deploying a domain.

## Working Rules

- Preserve the single public entry point. Do not add `ports:` to `backend` or `db` for production use.
- Keep frontend API calls relative to `/api`. This avoids per-environment frontend builds and keeps the proxy responsible for routing.
- Keep MCP optional and bearer-token protected. Do not expose database queries, shell commands, arbitrary HTTP, or write operations without deliberate validation and authorization.
- Put configuration in `.env` through Compose variables. Keep `.env.example` complete, non-secret, and committed; never commit `.env`.
- Give each client copy a unique `COMPOSE_PROJECT_NAME`, `HTTP_PORT`, database name, database user, and password.
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
Set-Location frontend; npm install; npm run build
Set-Location ../backend; npm install; npm run build
```

Use the client copy's configured `HTTP_PORT` when testing a copied project. Before handing off a deployment, confirm that the UI can create a project and that `GET /health` reports a connected database.

When MCP is enabled, use `mcp-config.example.json` with the real HTTPS domain and `MCP_API_TOKEN`. Confirm that the client can run `tools/list` before adding client-specific tools.

## Documentation Ownership

- Update `VPS-DOC.md` when changing architecture, environment variables, deployment workflow, or operations.
- Update `README.md` when changing the short project overview or quick-start instructions.
- Update this guide when changing conventions that another coding agent needs to follow.
