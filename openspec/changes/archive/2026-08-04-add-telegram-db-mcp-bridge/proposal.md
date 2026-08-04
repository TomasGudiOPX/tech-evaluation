## Why

The evaluated `cart/` application has MCP scaffolding (bearer-auth helper, agent instructions, `MCP_API_TOKEN` gate) but no working MCP server. As a bonus feature, we want to chat with the commerce database from Telegram through an agent that drives MCP tools — a concrete demonstration of the MCP pipeline end to end. The feature must work fully locally first; any server deployment is explicitly deferred.

## What Changes

- Add a standalone, read-only MCP DB bridge server exposing **structured** tools (`list_tables`, `describe_table`, `select`) instead of ad-hoc SQL. Access is restricted to the `products` table only (public information); orders, users, and other private data are blocked at the database role level.
- Connect the bridge to the cart's own `app` PostgreSQL using a dedicated read-only database role; the role is the enforcement boundary — writes are physically impossible.
- Add a Telegram bot that acts as an MCP client: messages go to an LLM tool-calling loop that invokes bridge tools and replies in chat.
- Add local security in depth: bearer token between bot and bridge, and a Telegram chat allowlist.
- Run everything locally (Postgres via the cart compose `db` service, bridge on localhost, bot in long-polling mode). No public endpoint is needed locally.
- Keep the feature additive: nothing under `cart/` (the evaluated deliverable) is modified.

## Capabilities

### New Capabilities

- `telegram-db-bridge`: read-only access to the cart app database through structured MCP tools, reachable from Telegram via an agent-driven bot; runs locally with server deployment deferred.

### Modified Capabilities

- None. The change does not alter any existing capability requirements.

## Impact

- New app `telegram-db-bridge/` colocated inside `cart/` (the evaluated deliverable), next to `apps/api` and `apps/web`.
- `cart/` source code is untouched: the bridge is a separate process that connects to the shared Postgres with a read-only role; no changes to the API, web app, Prisma schema, or modules.
- Runtime dependencies: `@modelcontextprotocol/sdk`, `pg`, a Telegram bot library (grammY), and an LLM tool-calling SDK. All standard Node packages.
- External setup required to run locally: a read-only Postgres role on the cart `app` DB, a BotFather bot token, and an LLM API key.
- The cart's existing `apps/api/src/engine/mcp/` scaffolding is not reused; the bridge is a separate process. (Its design rules — tools call services, no raw SQL — still guide the structured tool surface, applied generically.)
