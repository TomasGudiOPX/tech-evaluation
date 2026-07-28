# VPS Project Template

This is a small starting point for client projects that need a React frontend, a Node API, and PostgreSQL on one VPS.

Read [VPS-DOC.md](VPS-DOC.md) for the human deployment and usage guide. Coding agents should follow [AGENT.md](AGENT.md).

It borrows Twenty's useful production pattern: containerize the application, keep state in PostgreSQL, and expose one public HTTP entry point. It leaves out the monorepo, worker, Redis, GraphQL, and CRM-specific modules that a small project does not need on day one.

## Structure

```
browser -> nginx proxy -> React frontend
                     -> Fastify API -> PostgreSQL
```

| Path | Responsibility |
| --- | --- |
| `frontend/` | Vite + React single-page app, served as static files |
| `backend/` | Fastify API with a database-backed example endpoint |
| `nginx/` | Routes `/` to the frontend and `/api` plus `/health` to the API |
| `docker-compose.yml` | Starts the whole stack and persists PostgreSQL data |

## Run locally

1. Copy the environment defaults: `Copy-Item .env.example .env`
2. Change `POSTGRES_PASSWORD` in `.env`.
3. Start the stack: `docker compose up -d --build`
4. Open `http://localhost:8080` and check `http://localhost:8080/health`.

The UI creates projects through `POST /api/projects`, so it verifies the proxy, frontend, backend, and database together.

## Start a client project

1. Copy this directory and rename the copy for the client.
2. Change `COMPOSE_PROJECT_NAME`, `HTTP_PORT`, and the PostgreSQL credentials in the copied `.env`.
3. Replace the example `projects` feature with the client domain model.
4. Add database migrations before the schema becomes more complex than this starter example.

## VPS deployment notes

- Point a domain at the VPS and put TLS in front of this Compose stack with Caddy, Traefik, or a managed reverse proxy.
- Allow only SSH and HTTP/HTTPS through the VPS firewall. Do not expose PostgreSQL or the API ports directly.
- Back up the `postgres-data` volume or use a scheduled `pg_dump` to off-host storage.
- Set a unique database password for every deployment and keep `.env` out of Git.
- Add Redis or a worker only when the product genuinely needs queues, scheduled jobs, or long-running tasks.
