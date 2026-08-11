# telegram-db-bridge Specification

## Purpose

Lets the user query the cart's commerce database read-only from Telegram, driven by an agent that invokes structured MCP tools, fully local-first with server deployment deferred.

## Requirements

### Requirement: Structured read-only database tools

The bridge SHALL expose structured MCP tools for read-only database access: `list_tables` (tables the role can access), `describe_table` (columns and types of a table), and `select` (bounded row queries with optional columns, filter, ordering, and limit). The bridge SHALL connect with a role whose privileges permit only SELECT; write operations MUST fail.

#### Scenario: List available tables
- **WHEN** a client calls `list_tables`
- **THEN** the bridge returns the names of the tables the read-only role can access

#### Scenario: Describe a table
- **WHEN** a client calls `describe_table` with an existing table name
- **THEN** the bridge returns its columns, types, and nullability

#### Scenario: Describe an unknown table
- **WHEN** a client calls `describe_table` with a non-existent table name
- **THEN** the bridge returns a tool error without exposing connection details

#### Scenario: Bounded row query
- **WHEN** a client calls `select` with a table and optional columns, filter, ordering, and limit
- **THEN** the bridge returns at most the requested number of rows and only the requested columns

#### Scenario: Write is impossible
- **WHEN** a client attempts a write operation (INSERT, UPDATE, DELETE, or DDL) through the bridge
- **THEN** the operation fails because the connection role has read-only privileges

### Requirement: Tool access requires a valid bearer token

The bridge SHALL require a valid bearer token on every request and SHALL reject requests without a valid token.

#### Scenario: Valid token
- **WHEN** a client sends a request with a valid bearer token
- **THEN** the bridge processes the request

#### Scenario: Missing or invalid token
- **WHEN** a client sends a request without a token or with an invalid one
- **THEN** the bridge rejects the request with an unauthorized error

### Requirement: Telegram access restricted to allowed chats

The bot SHALL answer only messages from chats listed in its configuration and SHALL ignore all others.

#### Scenario: Allowed chat
- **WHEN** a user in an allowed chat sends a message
- **THEN** the bot processes it and replies

#### Scenario: Unknown chat
- **WHEN** a user outside the allowlist sends a message
- **THEN** the bot ignores it without replying

### Requirement: Agent-driven natural language replies

The bot SHALL pass each allowed message to an agent loop that uses the bridge tools to gather data and SHALL reply to the same chat in natural language. Tool results SHALL be bounded before being handed to the model.

#### Scenario: Question answered via tools
- **WHEN** a user asks a question that requires database data
- **THEN** the agent calls the appropriate bridge tools and the bot replies with a natural-language answer in the same chat

#### Scenario: Bounded results to the model
- **WHEN** the agent queries the database
- **THEN** the results passed to the model are limited to a configured maximum size

### Requirement: Local-first operation

The system SHALL run entirely locally: the bridge on localhost and the bot using Telegram long-polling. No publicly reachable endpoint SHALL be required.

#### Scenario: Local bridge and polling bot
- **WHEN** the system is started with local settings and a reachable local database
- **THEN** the bot connects to Telegram via long-polling and the bridge serves tools on localhost

### Requirement: Safe failure behavior

On database or tool failure, the bridge SHALL return a bounded error that does not expose secrets, credentials, connection strings, or SQL internals.

#### Scenario: Database error is sanitized
- **WHEN** a tool call fails with a database error
- **THEN** the client receives a sanitized error without secrets or connection details
