# Tasks

## 1. Specification and Evidence

- [x] Create the change directory and `proposal.md`.
- [x] Lock the note/task storage decision (minimal `CustomerNote` + `FollowupTask` tables, not ledger-only).

## 2. Data and Contracts

- [x] Add shared actions schemas in `packages/contracts/src/actions.ts`.
- [x] Export the actions contract from `packages/contracts/package.json`.
- [x] Add Prisma `ActionStatus` enum plus `PendingAction`, `CustomerNote`, and `FollowupTask` models.
- [x] Add the versioned migration `20260824160000_add_supervised_action_workflow`.
- [x] Regenerate the Prisma client.

## 3. Actions Module

- [x] Add the NestJS actions module (repository, service, executor, types).
- [x] Register `ActionsModule` in the API app module.
- [x] Implement `propose` plus the approve/reject/correct state transitions.
- [x] Implement `ActionExecutorService` for `note` and `followup_task` with read-back.

## 4. MCP Tools

- [x] Extend MCP with read-only `list_orders` / `get_order` / `get_cart` / `get_user_profile` / `list_reviews`.
- [x] Add `propose_action` (ledger-only).
- [x] Add `list_actions` / `get_action` / `approve_action` / `reject_action` / `correct_action`.
- [x] Add `get_action_metrics`.

## 5. Tests and Verification

- [x] Add action service, executor, contracts, and MCP tool tests (80 tests passing).
- [x] Run Prisma generate, contracts build, API build, and API tests.

## 6. Documentation and Handoff

- [x] Update README, DESIGN, VPS-DOC, AGENT, vault evidence, and `INFORME_IA.md`.
- [x] Add the OpenSpec design, tasks, and spec.
- [ ] Phase 2 (devops bot): deploy the monolith with `MCP_API_TOKEN` set and `HTTP_BIND_ADDRESS=0.0.0.0`.
- [ ] Phase 3: connect Hermes via `mcp_servers` and run one end-to-end chat-driven loop.
