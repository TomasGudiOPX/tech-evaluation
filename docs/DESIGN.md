# Design Decisions

## Purpose

This template is for small client applications that need a predictable, low-cost starting point. It favors a modular monolith on one VPS over early microservices or several managed platforms.

## System Shape

```text
internet -> host TLS proxy -> environment proxy -> web or API -> PostgreSQL
```

Each deployed environment is one Docker Compose project with four containers:

| Service | Responsibility                                | Host exposure     |
| ------- | --------------------------------------------- | ----------------- |
| `proxy` | Routes browser, API, health, and MCP requests | One loopback port |
| `web`   | Serves the built React application            | Internal only     |
| `api`   | Runs the Fastify application                  | Internal only     |
| `db`    | Stores PostgreSQL data in a named volume      | Internal only     |

The host TLS proxy, normally Caddy, is the only public entry point. It maps a domain to each environment proxy's loopback port.

## Source Boundaries

```text
apps/
  api/                 Application server
    src/platform/      Configuration and database setup
    src/engine/        Cross-cutting capabilities such as MCP
    src/modules/       Client business features
  web/                 Browser application
packages/
  contracts/           Shared request schemas and API types
docs/                  Human-facing operating and design documentation
openspec/              Accepted specifications and planned changes
```

`apps/api` is a modular monolith. A business feature belongs in `src/modules/<feature>` and owns its route, service, repository, and feature-specific behavior. Cross-cutting capabilities belong in `src/engine`; they must call module services rather than bypass them with separate database logic.

`packages/contracts` is deliberately small. Add only schemas and types used by both applications. Do not create packages merely to imitate a larger monorepo.

## Infrastructure Decisions

| Decision                                          | Reason                                                 | Consequence                                                   |
| ------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| Docker Compose on one VPS                         | Predictable cost and simple handover                   | Capacity is finite; monitor disk, memory, and backups         |
| PostgreSQL only                                   | One durable datastore for normal client workflows      | Add Redis, queues, or object storage only for a concrete need |
| One public entry point                            | Smaller attack surface and simpler routing             | API and database ports stay internal                          |
| Loopback-bound environment port                   | The TLS proxy controls public access                   | Every environment needs a unique `HTTP_PORT`                  |
| Local development plus VPS staging and production | Avoids one remote stack per developer                  | Staging is a shared integration environment                   |
| Yarn 4 workspace                                  | One lockfile and a small shared-contract boundary      | Developers use Corepack and `yarn install --immutable`        |
| Optional MCP in the API                           | AI tools remain close to validated business operations | MCP stays disabled without `MCP_API_TOKEN`                    |

## Environment Decisions

Development runs on developer machines. Staging and production run as separate Compose projects, each with its own checkout, `.env`, Compose name, database credentials, volume, backup routine, port, and domain.

Staging must never reuse production credentials or connect to the production database. If it needs representative data, use a sanitized copy.

The default Bitbucket branch model is documented in [ENVIRONMENTS.md](ENVIRONMENTS.md). It is intentionally limited to `develop` for staging and `main` for production. More environments require a clear business reason and a cleanup plan.

## Change Control

Use `openspec/changes/` for planned behavior or operational changes. After implementation, update the relevant OpenSpec specification and this document when a decision changes. Update the human operating guide when commands, variables, ports, backups, or deployment steps change.
