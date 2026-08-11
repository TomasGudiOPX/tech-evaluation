# telegram-db-bridge

Read-only access to the cart's PostgreSQL database from Telegram, driven by an
agent that uses MCP tools. Bonus feature; runs fully locally.

```
Telegram chat ──▶ grammY bot (Node) ──▶ agent loop (LLM tool-calling)
                                          │ MCP client (streamable-http + bearer token)
                                          ▼
                                   MCP DB bridge ──▶ Postgres (mcp_ro role, SELECT only)
```

Components:

- `bridge` — standalone MCP server (`list_tables`, `describe_table`, `select`)
  served over streamable-http on `127.0.0.1:3210/mcp` with bearer-token auth.
- `agent` — LLM tool-calling loop (OpenAI-compatible chat completions) that
  drives the bridge tools.
- `bot` — grammY bot (long polling) that routes allowed chats into the agent
  loop.
- `cli` — run the agent loop without Telegram.

## Security model

Defense in depth, three independent layers:

1. **Database role** — the bridge only ever connects as `mcp_ro`, a role with
   `SELECT`-only grants. Writes are physically impossible regardless of tool
   code or model behavior.
2. **Bearer token** — every `/mcp` request requires `Authorization: Bearer
   <MCP_API_TOKEN>` (constant-time comparison).
3. **Chat allowlist** — the bot answers only chats in `TELEGRAM_ALLOWED_CHAT_IDS`.

Tool results are bounded (`MAX_ROWS`, `MAX_RESULTS_CHARS`) and database errors
are sanitized before they reach the client (no secrets, credentials, or SQL).

## Local setup

```powershell
docker compose --env-file ../.env up -d db   # cart's local Postgres
# create the read-only role (one time)
Get-Content scripts/create_readonly_role.sql | docker compose --env-file ../.env exec -T db psql -U app -d app
Copy-Item .env.example .env
```

Fill in `.env`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL_RO` | Read-only role connection string |
| `MCP_API_TOKEN` | Bearer token the bot uses to talk to the bridge |
| `LLM_API_KEY` | API key for the tool-calling model |
| `LLM_API_BASE` / `LLM_MODEL` | OpenAI-compatible endpoint and model |
| `TELEGRAM_BOT_TOKEN` | Token from BotFather |
| `TELEGRAM_ALLOWED_CHAT_IDS` | Comma-separated chat IDs the bot will answer |

## Run

```powershell
npm install
npm run dev:bridge      # terminal 1: MCP bridge
npm run cli -- "How many products are in stock?"   # terminal 2: agent without Telegram
npm run dev:bot         # terminal 2: Telegram bot (long polling)
```

## Checks

```powershell
npm run typecheck
npm run lint
npm test
npm run verify:local    # starts its own bridge and exercises the tools against the local database
```

## Verification steps

1. `npm run verify:local` — confirm `tools/list` returns the three tools, the
   happy path works against the local `app` DB, unknown tables error, and
   requests without a token return `401`.
2. As `mcp_ro`, confirm an `INSERT`/`UPDATE`/`DELETE` fails with `permission
   denied` (see `scripts/create_readonly_role.sql`).
3. `npm run cli -- "list the 3 cheapest products"` — the agent answers from
   real data through the bridge.
4. In an allowed Telegram group: ask a data question, verify the natural-
   language answer; message the bot from a non-allowed chat and confirm it is
   ignored.
