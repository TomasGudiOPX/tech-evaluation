# Supervised Action Workflow Design

## Decision

The read-only MCP agent becomes a supervised action workflow: the agent drafts structured evidence, proposes bounded write actions into an append-only approval ledger, and the human approves explicitly in chat. Only the executor writes business data, and only through validated code paths. Slice 0 supports two write kinds (`note`, `followup_task`); `stock_adjust` and `retire_product` are defined in the ledger schema but deferred to a later slice.

The first-slice writes land in two minimal tables (`CustomerNote`, `FollowupTask`) rather than being folded into the ledger, so "note/task created + read-back + IDs" produces real, traceable entities.

## Domain Ownership

```text
auth       owns User identity and the authenticated request user
products   owns Product data and active/retired policy
orders     owns Order data and MCP read access (list/get)
cart       owns Cart data and MCP read access (get)
reviews    owns Review content
actions    owns the PendingAction ledger, the CustomerNote/FollowupTask writes, and the executor
```

The actions module may read existing entities (users, orders) through Prisma for validation, but it does not embed note/task content into any other domain.

## Data Model

`PendingAction` (approval ledger, append-only):

- `id`, `kind` (note | followup_task | stock_adjust | retire_product), `contextRef`, `payload Json`, `source` (agent | human), `proposedAt`, `proposedBy`, `status` (proposed → approved/rejected → executed/failed), `decidedBy`, `decidedAt`, `decision` (approve | reject | correct), `reason`, `resultRef`, `executedAt`, timestamps.
- Indexes on `status` and `contextRef`.

`CustomerNote`: `id`, `userId` (FK `User`, cascade), `orderId` (FK `Order`, set null), `content`, `createdAt`.

`FollowupTask`: `id`, `title`, `owner`, `dueAt`, `status` (default `open`), `contextRef`, timestamps.

## MCP Tool Contract

Read-only context tools (no write capability):

- `list_orders`, `get_order`, `get_cart`, `get_user_profile` (masked email), `list_reviews`.

Ledger tools:

- `propose_action` (ledger-only), `list_actions`, `get_action`, `approve_action`, `reject_action`, `correct_action`, `get_action_metrics`.

## Validation and Errors

- Payloads are a discriminated Zod union keyed on `kind`; unknown kinds are rejected.
- Decisions require `actionId` plus an explicit `decidedBy` (a human identity supplied from chat, never inferred).
- Stable error codes: `ACTION_NOT_FOUND`, `ACTION_NOT_PROPOSED`, `ACTION_KIND_NOT_SUPPORTED`, `ACTION_KIND_UNKNOWN`, `NOTE_USER_REQUIRED`, `NOTE_CONTENT_REQUIRED`, `NOTE_USER_NOT_FOUND`, `NOTE_ORDER_NOT_FOUND`, `TASK_FIELDS_REQUIRED`.

## Security Invariants

- MCP read tools are read-only on business data.
- `propose_action` writes only to the ledger.
- Business writes execute only through `ActionExecutorService`, only on an explicit approve.
- The ledger is append-only; `decidedBy` is an explicit human identity.
- The agent must call `approve_action` / `reject_action` only on the user's explicit instruction in chat.

## Contracts

`packages/contracts/src/actions.ts`, exported from `packages/contracts/package.json` as `@vps-template/contracts/actions`.

## Testing

- State machine (propose → approve/reject/correct → executed/failed).
- Executor (note/task writes + read-back, deferred kinds, unknown kinds).
- Contract schemas (InterventionBrief, InterventionRecord, payload union, decision schemas).
- MCP tool schemas (propose rejects invalid payloads; approval tools require decision + `decidedBy`).

## Traceability

Record this slice in the vault and update `INFORME_IA.md`.
