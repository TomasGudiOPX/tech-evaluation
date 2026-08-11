## Context

The evaluated `cart/` deliverable ships MCP scaffolding (bearer-auth helper, agent instructions, `MCP_API_TOKEN` gate) but no working MCP server, and its docs forbid direct MCP SQL. As a bonus feature we add an agent-driven, read-only bridge from Telegram into the cart's `app` Postgres. Motivation and scope: see `proposal.md`. Behavioral contract: see `specs/telegram-db-bridge/spec.md`. Local-first: server deployment is deferred and out of scope.

Constraints that shape the design:

- The feature must not modify anything under `cart/` source code (the evaluated deliverable stays untouched); however it lives inside the `cart/` directory as `telegram-db-bridge/` for colocation with the database it queries.
- The database is the cart's `app` Postgres 16, reachable locally at `127.0.0.1:5432` via the cart compose `db` service.
- Node 22 and yarn are available on the machine; the repo already uses TypeScript.
- No agent host (OpenClaw/Claude Desktop) is installed, so the bot must be self-contained.
- Database access is restricted to the `products` table only (public information); the `mcp_ro` role has `SELECT` on no other tables.

## Goals / Non-Goals

**Goals:**

- A standalone read-only MCP bridge exposing structured tools (`list_tables`, `describe_table`, `select`).
- A Telegram bot that is itself an MCP client and runs an LLM tool-calling loop.
- Reads are enforced at the database role level, so writes are physically impossible.
- Everything runs locally: bridge on localhost, bot via long-polling, no public endpoint.

**Non-Goals:**

- Server deployment (webhook mode, TLS proxy, containerized deploy) — a later, separate exercise.
- Write/administrative access of any kind.
- Modifying `cart/`, including reusing or wiring its `engine/mcp` scaffolding.
- A generic ad-hoc SQL tool (`query(sql)`).

## Decisions

### 1. Structured read-only tools over ad-hoc SQL

Tools: `list_tables`, `describe_table`, `select(table, columns?, filter?, orderBy?, limit?)`. `select` always parameterizes values, validates identifiers against `information_schema`, and enforces a maximum row limit (default 100, configurable). This gives the agent a bounded, predictable surface and keeps result sizes small — matching the "filter results before returning them" philosophy in `cart/docs/DEVELOPMENT.md`.

- **Alternative considered:** a single `query(sql)` tool. Rejected: unbounded results, wide prompt-injection blast radius, and it is exactly what `cart/` rules forbid.

### 2. Dedicated read-only Postgres role as the enforcement boundary

A SQL script creates `mcp_ro`, a login role with `GRANT SELECT` on the app schema tables and nothing else. The bridge connects only with `DATABASE_URL_RO`. Even a fully prompt-injected LLM physically cannot write. If desired later, the grants can be narrowed to non-sensitive tables only.

- **Alternative considered:** enforcing read-only in tool code. Rejected: a bug or bypass in the bridge would allow writes; the role is stronger and verifiable (`try a DELETE, watch it fail`).

### 3. Separate process inside `cart/`

Colocated at `cart/telegram-db-bridge/` (own package, npm, TypeScript), split into a `bridge` (MCP server) and a `bot` (Telegram client) module behind one entry point. The bridge is a separate process the bot connects to over streamable-http — the same topology `mcp-config.example.json` assumes. It queries the cart's app database via read-only role but does not touch cart source code, modules, or build system.

- **Alternative considered:** mounting an MCP endpoint inside the cart API at `/mcp`. Rejected: violates `cart/`'s "no direct MCP SQL queries" rule and touches the evaluated deliverable.

### 4. streamable-http transport

The bridge listens on a localhost port and serves the MCP streamable-http protocol with bearer-token auth (same `timingSafeEqual` pattern as `cart/apps/api/src/engine/mcp/mcp-auth.ts`). Works from the bot locally and maps cleanly to a future server deploy behind the host TLS proxy.

- **Alternative considered:** stdio. Rejected for the bridge↔bot link (separate processes, server deploy later); a stdio mode may be added only as a dev convenience for direct agent testing.

### 5. Self-contained grammY bot with an LLM tool-calling loop

The bot long-polls Telegram (no public endpoint locally), enforces a chat allowlist, and runs a bounded agent loop: message → LLM tool-calling (tool schemas = bridge tools) → call bridge via MCP client → summarize → reply. Loop caps iterations and result size.

- **Alternative considered:** reusing an agent host with a built-in Telegram channel (e.g., OpenClaw). Rejected: not installed on this machine and adds an external dependency the standalone build avoids.

### 6. Defense in depth, secrets in `.env`

Three independent layers: read-only role (physical), bridge bearer token (transport), bot chat allowlist (channel). All credentials live in `.env` (gitignored); `.env.example` documents them.

## Risks / Trade-offs

- **Data exposure:** the app DB holds customer/order data; an allowed chat can read it via the LLM. → Mitigation: read-only role can be scoped to non-sensitive tables/columns; only trusted chats in the allowlist; results bounded.
- **Prompt injection via DB content:** stored data could instruct the model. → Mitigation: read-only role bounds damage to reads; structured tools; sanitized errors; no tool ever reflects raw SQL.
- **Telegram API blocked from the local network.** → Mitigation: layering — the bridge + agent loop are testable with zero Telegram involvement; the bot is the last layer.
- **LLM latency/cost on every message.** → Mitigation: bounded results, capped loop iterations, small model fits this workload.
- **Identifier/WHERE building bugs.** → Mitigation: values always parameterized, identifiers validated against `information_schema`, tests for both cases.

## Migration Plan

Local-first; no production migration.

1. Create the read-only role against the local cart `app` DB (`scripts/create_readonly_role.sql`).
2. Start the cart `db` service, run the bridge and bot from `telegram-db-bridge/` with a `.env`.
3. Verify read-only enforcement and the Telegram flow (see spec scenarios).
4. Rollback: drop the `mcp_ro` role and remove the sibling directory; `cart/` is untouched either way.

## Open Questions

- **LLM provider** (OpenAI vs Anthropic) and model — affects only the bot's tool-calling SDK, not the specs, approach, or task breakdown; resolved at implementation time.
- **Role table scoping** — grant on all app tables vs a narrower set — deferrable to the verification step.
