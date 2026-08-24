# Approved Action Loop Specification

## ADDED Requirements

### Requirement: Proposal recording (ledger-only)

The system SHALL record proposed write actions in an append-only approval ledger without modifying business data.

#### Scenario: Agent proposes a note action

- **GIVEN** a supervised agent with a valid note payload
- **WHEN** the agent calls `propose_action`
- **THEN** a `PendingAction` row is stored with status `proposed`
- **AND** no business data (notes, tasks, orders) is modified

#### Scenario: Proposal with an unknown kind

- **GIVEN** a payload whose `kind` is outside the allowed set
- **WHEN** the agent calls `propose_action`
- **THEN** no ledger row is stored
- **AND** the tool returns a validation error

### Requirement: Read-only context tools

The system SHALL expose read-only MCP tools for order, cart, user, and review context.

#### Scenario: Agent lists orders

- **GIVEN** stored orders
- **WHEN** the agent calls `list_orders`
- **THEN** the response includes recent orders with their items
- **AND** no order is created or modified

#### Scenario: Agent reads a user profile

- **GIVEN** a user id
- **WHEN** the agent calls `get_user_profile`
- **THEN** the response includes the user id, role, and a masked email
- **AND** the unmasked email is never returned

### Requirement: Human approval gate

The system SHALL require an explicit human decision before any business write executes.

#### Scenario: Approve executes and records read-back

- **GIVEN** a proposed action
- **WHEN** the human approves with an explicit decider identity
- **THEN** the action status becomes `executed`
- **AND** the ledger records the created entity id in `resultRef`

#### Scenario: Reject records a decision

- **GIVEN** a proposed action
- **WHEN** the human rejects with a reason
- **THEN** the action status becomes `rejected`
- **AND** no business write occurs

#### Scenario: Decision without a decider

- **GIVEN** a decision request missing `decidedBy`
- **WHEN** the approval tool is called
- **THEN** no decision is recorded
- **AND** the tool returns a validation error

### Requirement: Execution through validated paths

The system SHALL execute approved actions only through the executor and only for supported kinds.

#### Scenario: Note write reads back the created note

- **GIVEN** an approved note action
- **WHEN** the executor runs
- **THEN** a `CustomerNote` is created
- **AND** the read-back note id is recorded in `resultRef`

#### Scenario: Deferred kinds are rejected

- **GIVEN** an approved `stock_adjust` or `retire_product` action
- **WHEN** the executor runs
- **THEN** the action status becomes `failed`
- **AND** the reason states the kind is deferred
