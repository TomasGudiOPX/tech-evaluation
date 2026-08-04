## 1. Project Scaffolding

- [x] 1.1 Create `telegram-db-bridge/` package with `package.json`, `tsconfig.json`, `.gitignore`, and `.env.example`
- [x] 1.2 Add dependencies: `@modelcontextprotocol/sdk`, `pg`, `grammY`, LLM tool-calling SDK, `zod`, `typescript`, and test runner
- [x] 1.3 Add npm scripts for lint, build, and test; add a short local-run README

## 2. Read-Only Role and Database Setup

- [x] 2.1 Write `scripts/create_readonly_role.sql` creating `mcp_ro` with `GRANT SELECT` on the app schema tables
- [x] 2.2 Start the local cart `db` service (`docker compose up -d db`) and apply the role to the `app` database
- [x] 2.3 Verify enforcement: connect as `mcp_ro` and confirm an INSERT/UPDATE/DELETE fails

## 3. MCP Bridge

- [x] 3.1 Implement bridge config from env (`DATABASE_URL_RO`, `MCP_API_TOKEN`, max rows) with a friendly missing-config error
- [x] 3.2 Implement the `pg` connection pool using the read-only role URL
- [x] 3.3 Implement `list_tables` tool returning the tables the role can access
- [x] 3.4 Implement `describe_table` tool returning columns, types, and nullability; error on unknown tables
- [x] 3.5 Implement `select` tool with identifier validation against `information_schema`, parameterized values, and a hard row-limit cap
- [x] 3.6 Serve streamable-http with bearer-token auth (constant-time comparison); reject missing/invalid tokens
- [x] 3.7 Sanitize database errors before returning them (no secrets, credentials, connection strings, or raw SQL)

## 4. Bridge Verification

- [x] 4.1 Unit tests for identifier validation, filter/order-by handling, and the row-limit cap
- [x] 4.2 Verify `tools/list` and the happy path of each tool against the local `app` database
- [x] 4.3 Verify negative paths: unknown table, missing/invalid bearer token, and write attempts all fail safely

## 5. Agent Loop (no Telegram)

- [x] 5.1 Implement a provider-agnostic LLM tool-calling wrapper configured via env
- [x] 5.2 Implement an MCP client connecting to the bridge over streamable-http with the bearer token
- [x] 5.3 Implement the agent loop: message → LLM tool selection → bridge call → bounded result → reply, with a maximum iteration count
- [x] 5.4 Add a CLI test harness that drives a prompt through the agent loop without Telegram and prints the answer

## 6. Telegram Bot

- [x] 6.1 Implement a grammY bot in long-polling mode configured via env (`TELEGRAM_BOT_TOKEN`)
- [x] 6.2 Implement the chat allowlist (`TELEGRAM_ALLOWED_CHAT_IDS`); unknown chats are ignored without replying
- [x] 6.3 Wire bot messages into the agent loop and reply to the same chat in natural language

## 7. Local End-to-End and Hardening

- [x] 7.1 Run the full local flow in a test group: a natural-language question returns a data-backed answer
- [x] 7.2 Verify an unknown chat is ignored and errors are surfaced sanitized to an allowed chat
- [x] 7.3 Confirm a write attempt through the bot path fails at the role boundary
- [x] 7.4 Update the README with the local setup, env variables, and verification steps
