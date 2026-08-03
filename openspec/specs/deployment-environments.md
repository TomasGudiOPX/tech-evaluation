# Deployment Environments

## Source Layout

```text
apps/
  api/                 Fastify modular monolith
  web/                 React application
packages/
  contracts/           Shared API schemas and types
openspec/
  specs/               Accepted behavior and operations
  changes/             Proposed work
```

One source repository produces both the web and API applications. Environments do not receive separate source-level frontend/backend copies.

## Default Environments

Use local development, one VPS staging environment, and one VPS production environment:

```text
developer machine -> local development
staging.example.com -> staging Compose project on the VPS
app.example.com -> production Compose project on the VPS
```

Do not run one VPS stack per developer. Developers use local tooling and share staging for integration testing. This keeps memory use, database administration, backups, and deployment work predictable.

## VPS Isolation

Each VPS environment uses its own checkout or Git worktree, `.env`, Compose project name, database credentials, and PostgreSQL volume.

```dotenv
# /srv/acme-portal/production/.env
COMPOSE_PROJECT_NAME=acme-production
HTTP_BIND_ADDRESS=127.0.0.1
HTTP_PORT=18080
POSTGRES_DB=acme_production

# /srv/acme-portal/staging/.env
COMPOSE_PROJECT_NAME=acme-staging
HTTP_BIND_ADDRESS=127.0.0.1
HTTP_PORT=18081
POSTGRES_DB=acme_staging
```

The host-level TLS proxy maps each domain to its loopback port. The `api`, `web`, and PostgreSQL containers remain internal to their own Compose network. Staging must never share the production database or credentials.

## Capacity Rule

Production plus staging is realistic for a low-traffic client application on a modest VPS. Every additional environment duplicates an API process, web server, proxy, database, data volume, backups, and monitoring responsibility.

Add temporary preview environments only when their value exceeds that cost. They need unique names, ports, databases, domains, and an explicit cleanup date. When builds or several client stacks begin to strain the VPS, build images in CI or move staging to another small VPS before considering orchestration platforms.
