# VPS Deployment Guide

## What Runs

This project runs four containers on one VPS:

| Container | Job | Publicly reachable? |
| --- | --- | --- |
| `proxy` | Nginx receives browser requests and routes internally | Yes, on `HTTP_PORT` |
| `web` | Serves the built Vite React application | No |
| `api` | Runs the NestJS API | No |
| `db` | Stores PostgreSQL data in a named Docker volume | No |

```text
browser -> Nginx -> React storefront
                -> NestJS API -> PostgreSQL data volume
```

The API is the only service that queries PostgreSQL. The proxy routes `/api/...`, `/api/docs`, and `/health` to the API and all normal browser requests to the web container.

## Before You Start

You need Docker Engine, the Docker Compose plugin, Node 22 with Corepack for source checks, SSH access to the VPS, and a TLS proxy such as Caddy, Traefik, or a managed reverse proxy for public domains.

## MCP Endpoint (supervised action workflow)

`nginx/default.conf` exposes `location = /mcp` to the API, so the public MCP URL is `https://<vps-domain>/mcp`. The MCP module is mounted only when `MCP_API_TOKEN` is set, so set a non-empty token in the environment `.env` (Compose maps `${MCP_API_TOKEN:-}` into the API container) or the endpoint will not exist.

For a deployment that fronts the endpoint with a host TLS proxy, keep `HTTP_BIND_ADDRESS=127.0.0.1` and route `/mcp` to the loopback port. The API binds to `127.0.0.1` by default; set `HTTP_BIND_ADDRESS=0.0.0.0` only when the API itself must accept direct connections.

Verify the endpoint is mounted: a request without the token returns `401`, and with the token it returns `200` (not `404`):

```powershell
curl -i -H "Authorization: Bearer <MCP_API_TOKEN>" https://<vps-domain>/mcp
```

Keep `MCP_API_TOKEN` out of the repository and store it only in the deployment `.env`.

## Local Docker Run

```powershell
Copy-Item .env.example .env
docker compose --env-file .env --profile ops run --rm --build migrate
docker compose --env-file .env --profile ops run --rm seed
docker compose --env-file .env up -d --build
```

Verify:

```powershell
Invoke-WebRequest http://localhost:8080/health
```

Open:

- Storefront: `http://localhost:8080`
- Swagger/OpenAPI: `http://localhost:8080/api/docs`

The deterministic seed creates the admin user from `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` when both are present, and inserts sample products only when the product table is empty. Run `migrate` before `seed` on every fresh database.

## Source Checks

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
```

GitHub Actions runs these checks on pushes and pull requests to `develop` and `main`.

## Deployment Model

Use one source tree per deployed environment. A normal small deployment has:

| Environment | Branch | Purpose |
| --- | --- | --- |
| Development | `feature/*` or local `develop` | Local work and tests |
| Staging | `develop` | Shared integration and review |
| Production | `main` | Live application |

These are not Docker Compose `dev`, `qa`, or `prod` profiles. The same Compose file is reused with environment-specific configuration. The only Compose profile is `ops`, which exposes the one-off `migrate` and `seed` jobs.

Each VPS environment needs its own checkout or worktree, `.env`, Compose project name, PostgreSQL credentials, volume, loopback port, domain, and backup routine.

```dotenv
# production/.env
COMPOSE_PROJECT_NAME=shopping-cart-production
HTTP_BIND_ADDRESS=127.0.0.1
HTTP_PORT=18080
POSTGRES_DB=shopping_cart_production
POSTGRES_USER=shopping_cart_production
POSTGRES_PASSWORD=<unique-secret>
POSTGRES_BIND_ADDRESS=127.0.0.1
POSTGRES_PORT=15432

# staging/.env
COMPOSE_PROJECT_NAME=shopping-cart-staging
HTTP_BIND_ADDRESS=127.0.0.1
HTTP_PORT=18081
POSTGRES_DB=shopping_cart_staging
POSTGRES_USER=shopping_cart_staging
POSTGRES_PASSWORD=<different-unique-secret>
POSTGRES_BIND_ADDRESS=127.0.0.1
POSTGRES_PORT=15433
```

Use the host TLS proxy to route `app.example.com` to `127.0.0.1:18080` and `staging.example.com` to `127.0.0.1:18081`. Never share production credentials or databases with staging.

## Deploy

Run inside the target checkout:

```powershell
git fetch origin
git pull --ff-only origin <branch>
docker compose --env-file .env --profile ops run --rm --build migrate
docker compose --env-file .env --profile ops run --rm seed
docker compose --env-file .env up -d --build
docker compose ps
docker compose logs --tail 100 api
```

Verify the final domain, `/health`, `/api/docs`, catalog browsing, login/register, add to cart, checkout, orders, and admin product management.

## Backups and Recovery

The database lives in the Compose named volume `postgres-data`. A named volume survives normal restarts and `docker compose down`, but it is not a backup.

Create logical backups and copy them off the VPS:

```powershell
docker compose exec -T db pg_dump -U <POSTGRES_USER> <POSTGRES_DB> > backup.sql
```

Restore into an empty replacement database:

```powershell
Get-Content backup.sql | docker compose exec -T db psql -U <POSTGRES_USER> -d <POSTGRES_DB>
```

Test restore before relying on the backup plan.
