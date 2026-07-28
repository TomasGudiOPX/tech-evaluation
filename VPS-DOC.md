# VPS Template Guide

## What This Template Is

This template is a small foundation for client applications that need a web frontend, an API, and a database without paying for separate managed frontend and backend platforms.

It runs four containers on one VPS:

| Container | Job | Publicly reachable? |
| --- | --- | --- |
| `proxy` | Nginx receives browser requests and routes them internally | Yes, on `HTTP_PORT` |
| `frontend` | Serves the built React application | No |
| `backend` | Runs the Fastify API | No |
| `db` | Stores PostgreSQL data in a named Docker volume | No |

The browser requests the website from Nginx. Nginx sends normal website requests to the frontend and sends `/api/...` requests to the backend. The backend is the only service allowed to query PostgreSQL.

```text
browser -> Nginx -> React frontend
                -> Fastify API -> PostgreSQL data volume
```

This is inspired by the practical part of larger self-hosted projects such as Twenty: keep services containerized, persist data in PostgreSQL, and expose a single entry point. It intentionally does not include Redis, workers, queues, GraphQL, or a large monorepo.

## Before You Start

You need:

- Docker Engine and Docker Compose plugin installed on the VPS or local machine.
- A domain name and a TLS solution such as Caddy, Traefik, or a managed reverse proxy for a public deployment.
- SSH access to the VPS.

For a small project, start with a VPS that has at least 1 GB of RAM. Use 2 GB or more when building images on the VPS, running additional services, or expecting steady traffic.

## Run the Base Template

Open a terminal in the template directory and create the deployment environment file:

```powershell
Set-Location vps1-test
Copy-Item .env.example .env
```

Edit `.env` before starting it:

```dotenv
COMPOSE_PROJECT_NAME=my-client-app
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
docker compose logs -f backend
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

Next, replace the example project feature in `backend/src/server.ts` and `frontend/src/main.tsx` with the client’s actual domain. Add a migration tool before the database schema becomes more than a simple prototype.

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

This rebuilds changed images and recreates only the affected containers. Watch `docker compose logs -f backend` when an API or database change is involved.

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
