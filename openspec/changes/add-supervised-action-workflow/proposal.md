# Add Supervised Action Workflow

## Why

The shopping-cart application has a read-only MCP agent (product tools plus a Telegram bot loop) that can *answer* but never *act*, and has no evidence structuring, no approval gate, and no decision traceability. This change turns that read-only agent into a *supervised action workflow* — the agent proposes, the human approves explicitly in chat, and only approved actions take external effect with full read-back and an append-only ledger.

The first slice maps the canonical pattern to the cart domain: an order exception plus a short customer note is drafted into a structured brief (`InterventionBrief`) and record (`InterventionRecord`), the agent proposes a bounded write action (`note` or `followup_task`), the human approves explicitly in chat, and the executor performs the write through validated code paths and reads the result back.

## What Changes

- Add a shared `actions` contract: `InterventionBrief`, `InterventionRecord`, the `PendingActionPayload` discriminated union, and the propose/approve/reject/correct request schemas.
- Add a Prisma `PendingAction` approval ledger (append-only) plus minimal `CustomerNote` and `FollowupTask` tables for the first-slice writes.
- Add a NestJS `actions` module (repository, service, executor) implementing a `proposed → approved/rejected → executed/failed` state machine.
- Extend the project MCP endpoint with read-only context tools (`list_orders`, `get_order`, `get_cart`, `get_user_profile`, `list_reviews`) and ledger tools (`propose_action`, `list_actions`, `get_action`, `approve_action`, `reject_action`, `correct_action`, `get_action_metrics`).
- Enforce the security invariants: read tools are read-only on business data; `propose_action` writes only to the ledger; business writes happen only through the executor on an explicit approve.
- Add tests for the state machine, the executor, payload validation, and the MCP tool schemas.
- Update OpenSpec, docs, vault evidence, and `INFORME_IA.md` traceability.

## Non-Goals

- No `apps/web` UI changes; the workflow is driven entirely from the Hermes/Telegram session via the project MCP endpoint.
- No financial mutation in slice 0: `stock_adjust` and `retire_product` are defined in the ledger schema but deferred to a later slice.
- No dedicated metrics store (counters are derived from the ledger).
- No arbitrary SQL: writes go through Prisma models and, where a module exists, through existing services.
- No change to how API/Postgres ports are exposed (deployment stays with the separate devops bot).

## Impact

- Introduces a new behavior and data slice: a supervised action workflow with an approval ledger.
- Extends the database schema with `pending_actions`, `customer_notes`, and `followup_tasks` tables.
- Adds a new shared contract export for actions.
- Extends the MCP tool surface (new read + ledger tools) behind the existing bearer-token gate.
- Preserves the read-only nature of the agent for business data; only the executor writes, and only on explicit approval.
