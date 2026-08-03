# VPS Template Guide

## What This Template Is

This template is a small foundation for client applications that need a web frontend, an API, and a database without paying for separate managed frontend and backend platforms.

It runs four containers on one VPS:

| Container | Job                                                        | Publicly reachable? |
| --------- | ---------------------------------------------------------- | ------------------- |
| `proxy`   | Nginx receives browser requests and routes them internally | Yes, on `HTTP_PORT` |
| `web`     | Serves the built React application                         | No                  |
| `api`     | Runs the Fastify API                                       | No                  |
| `db`      | Stores PostgreSQL data in a named Docker volume            | No                  |

The browser requests the website from Nginx. Nginx sends normal website requests to the frontend and sends `/api/...` requests to the backend. The backend is the only service allowed to query PostgreSQL.

```text
browser -> Nginx -> React frontend
                -> Fastify API -> PostgreSQL data volume
```

This keeps the practical part of larger self-hosted applications: services are containerized, data persists in PostgreSQL, and the stack exposes a single entry point. It intentionally does not include Redis, workers, queues, GraphQL, or a large monorepo.

The code is a small modular monolith. `apps/api` keeps reusable platform code in `src/platform`, cross-cutting capabilities such as MCP in `src/engine`, and client business features in `src/modules`. `apps/web` contains the browser application. `packages/contracts` holds the small set of schemas and types shared with the frontend. These folders improve maintainability but do not create new services or consume extra VPS memory.

## Optional MCP Connection

The template can expose a Model Context Protocol (MCP) endpoint for tools such as Claude Desktop, Cursor, or other compatible clients. It uses the official TypeScript SDK with a stateless Streamable HTTP endpoint, a bearer token, and narrowly defined application tools. MCP runs inside the existing backend container; it does not create another service.

MCP is disabled by default. Enable it by setting a long, unique `MCP_API_TOKEN` in the project's `.env`:

```dotenv
MCP_API_TOKEN=replace-with-a-long-random-secret
```

After rebuilding the stack, copy `mcp-config.example.json` into your MCP client's configuration and replace both values:

```json
{
  "mcpServers": {
    "my-client-app": {
      "type": "streamable-http",
      "url": "https://app.example.com/mcp",
      "headers": {
        "Authorization": "Bearer replace-with-the-same-secret"
      }
    }
  }
}
```

The starter tools are `list_projects` and `create_project`. They demonstrate how MCP tools should be small, named for a client capability, and validated before they write data. Replace them with client-specific tools in `apps/api/src/engine/mcp`, and make every tool call the matching business service under `apps/api/src/modules`.

The MCP server sends instructions that limit reads and prohibit direct SQL, shell access, secrets, and arbitrary URLs. Keep those restrictions when adding tools. For destructive, bulk, or ambiguous changes, require confirmation in the client workflow before calling a write tool.

Treat the MCP token like a password. Do not place it in the frontend, source code, screenshots, or public documentation. Leaving `MCP_API_TOKEN` blank returns `404` for `/mcp`, keeping the feature off.

## Before You Start

You need:

- Docker Engine and Docker Compose plugin installed on the VPS or local machine.
- A domain name and a TLS solution such as Caddy, Traefik, or a managed reverse proxy for a public deployment.
- SSH access to the VPS.

For a small project, start with a VPS that has at least 1 GB of RAM. Use 2 GB or more when building images on the VPS, running additional services, or expecting steady traffic.

For source-code development outside Docker, use Node 22 with Corepack. The repository pins Yarn 4 and commits `yarn.lock`, so developers should run this from the project root:

```powershell
corepack enable
yarn install --immutable
yarn build
```

## Run the Base Template

Open a terminal in the template directory and create the deployment environment file:

```powershell
Set-Location vps1-test
Copy-Item .env.example .env
```

Edit `.env` before starting it:

```dotenv
COMPOSE_PROJECT_NAME=my-client-app
HTTP_BIND_ADDRESS=127.0.0.1
HTTP_PORT=8080

POSTGRES_DB=my_client_app
POSTGRES_USER=my_client_app
POSTGRES_PASSWORD=use-a-long-unique-password
```

Start the stack:

```powershell
docker compose up -d --build
```

Then test it:

```powershell
Invoke-WebRequest http://localhost:8080/health
```

Open `http://localhost:8080` in a browser. The example screen lets you add projects. That verifies the frontend, proxy, API, and database are connected.

Useful commands:

```powershell
docker compose ps
docker compose logs -f
docker compose logs -f api
docker compose down
```

`docker compose down` stops the containers but preserves the PostgreSQL named volume. Do not use `docker compose down --volumes` for a real client project unless you intend to remove its database.

## Create a Client Project

Treat `vps1-test` as the source template. Each client gets a separate directory, Compose project, database credentials, and backup plan.

```powershell
Copy-Item -Recurse vps1-test acme-portal
Set-Location acme-portal
Copy-Item .env.example .env
```

In the copied `.env`, change at least:

- `COMPOSE_PROJECT_NAME` so its containers and volume names do not collide with another client.
- `HTTP_PORT` so the host port does not collide with another deployment.
- `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` so data and credentials remain isolated.

Next, replace the example project feature in `apps/api/src/modules/projects` and `apps/web/src/main.tsx` with the client’s actual domain. Keep shared request schemas and API types in `packages/contracts`. Add a migration tool before the database schema becomes more than a simple prototype.

## Development, Staging, and Production

One repository contains both the web and API applications. Do not create separate source-code pairs for each environment.

For a small client project, use this default arrangement:

| Environment | Location                     | Purpose                         |
| ----------- | ---------------------------- | ------------------------------- |
| Development | Each developer's machine     | Fast local work and experiments |
| Staging     | One VPS Compose project      | Shared testing before release   |
| Production  | A second VPS Compose project | Live client application         |

On the VPS, keep staging and production in separate directories or Git worktrees. Each gets its own `.env`, Compose project name, database credentials, database volume, and loopback port. For example:

```dotenv
# Production
COMPOSE_PROJECT_NAME=acme-production
HTTP_BIND_ADDRESS=127.0.0.1
HTTP_PORT=18080
POSTGRES_DB=acme_production

# Staging
COMPOSE_PROJECT_NAME=acme-staging
HTTP_BIND_ADDRESS=127.0.0.1
HTTP_PORT=18081
POSTGRES_DB=acme_staging
```

Use Caddy or another host-level TLS proxy to send `app.example.com` to `127.0.0.1:18080` and `staging.example.com` to `127.0.0.1:18081`. The loopback binding prevents a random application port from becoming public. Never connect staging to production data or credentials.

This is manageable and realistic for production plus staging on a modest VPS. Additional preview environments duplicate containers, databases, backups, and monitoring work. Create them only when needed, give them an expiry date, and clean them up deliberately. See [the deployment-environments specification](../openspec/specs/deployment-environments.md) for the durable operational rule.

For the Bitbucket branch model, separate VPS checkouts, protected branches, deployment commands, and rollback procedure, follow [ENVIRONMENTS.md](ENVIRONMENTS.md). The architectural reasoning behind this layout is recorded in [DESIGN.md](DESIGN.md).

## Deploy on a VPS

1. Copy or clone the client project onto the VPS.
2. Create and secure its `.env` file on the VPS.
3. Build and start it with `docker compose up -d --build`.
4. Configure your TLS reverse proxy to forward the client domain to `http://127.0.0.1:<HTTP_PORT>`.
5. Restrict the firewall to SSH plus HTTP/HTTPS. The application port should be reachable only by the local TLS proxy where possible.
6. Verify `/health` through the final domain.

The Compose file exposes only Nginx. PostgreSQL and the API remain on Docker's internal network and should never be opened directly to the internet.

## Updating a Deployment

After pulling or copying application changes:

```powershell
docker compose up -d --build
docker compose ps
```

This rebuilds changed images and recreates only the affected containers. Watch `docker compose logs -f api` when an API or database change is involved.

## Backups and Recovery

The database lives in the Compose named volume `postgres-data`. A named volume survives normal container restarts and `docker compose down`, but it is not a backup.

Create regular logical backups and copy them off the VPS. For example, run this from the project directory after loading the `.env` values into your shell or replacing the placeholders:

```powershell
docker compose exec -T db pg_dump -U <POSTGRES_USER> <POSTGRES_DB> > backup.sql
```

Restore into an empty or replacement database with:

```powershell
Get-Content backup.sql | docker compose exec -T db psql -U <POSTGRES_USER> -d <POSTGRES_DB>
```

Test a restore before relying on the backup process. Keep backups encrypted and separate from the VPS.

## When to Add More Infrastructure

Add Redis, a worker, object storage, or external email only when the client needs a concrete capability such as queued jobs, scheduled work, asynchronous media processing, file uploads, or transactional email. Each added service increases operating cost and recovery responsibility.
