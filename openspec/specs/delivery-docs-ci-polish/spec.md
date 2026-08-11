# Delivery Docs, CI, and UI Polish Specification

## Purpose

TBD — Update Purpose after archive.

## Requirements

### Requirement: Product-facing Vite retail UI

The system SHALL provide a Vite + React retail UI for the implemented commerce workflow.

#### Scenario: Visitor views catalog

- **GIVEN** active products exist
- **WHEN** a visitor opens the web app
- **THEN** the first screen presents a polished product catalog
- **AND** no starter projects UI is visible
- **AND** the visual design adapts the Stitch `Aura Commerce` reference direction to this project

#### Scenario: User completes commerce walkthrough

- **GIVEN** a user can authenticate
- **WHEN** the user browses products, adds an item to cart, checks out, and opens order history
- **THEN** the UI exposes each workflow step against the implemented API
- **AND** expected domain errors are shown in the shared error-envelope style

### Requirement: Focused admin product UI

The system SHALL provide a focused administrator product management UI.

#### Scenario: Admin manages products

- **GIVEN** an authenticated admin is using the web app
- **WHEN** the admin opens product management
- **THEN** the UI allows create, update, and retire actions
- **AND** customer users cannot access admin write behavior
- **AND** product retirement is presented as deactivation, not hard deletion

### Requirement: Swagger REST documentation

The system SHALL publish generated Swagger/OpenAPI documentation for the NestJS API.

#### Scenario: Evaluator opens API docs

- **GIVEN** the API is running
- **WHEN** the evaluator opens the documented Swagger path
- **THEN** auth, products, admin products, cart, checkout, and orders endpoints are discoverable
- **AND** checkout idempotency requirements are visible

### Requirement: GitHub Actions CI

The repository SHALL include a GitHub Actions workflow that runs reproducible verification checks.

#### Scenario: CI runs on push or pull request

- **GIVEN** code is pushed to `develop` or `main`, or a pull request is opened
- **WHEN** GitHub Actions runs
- **THEN** dependencies install with the committed lockfile
- **AND** contracts build
- **AND** Prisma client generation runs
- **AND** API build and API tests run
- **AND** web build runs
- **AND** root build runs

### Requirement: Honest delivery documentation

The repository SHALL document the actual final stack, workflow, and verification path.

#### Scenario: Evaluator reads docs

- **GIVEN** the repository is ready for handoff
- **WHEN** the evaluator reads README, development docs, VPS docs, design docs, vault evidence, and `INFORME_IA.md`
- **THEN** they describe Vite + React frontend, NestJS API, PostgreSQL, Prisma, Docker Compose, GitHub workflow, Swagger, CI, and commerce modules consistently
- **AND** stale Fastify/projects/Bitbucket claims are removed or clearly identified as historical context only

### Requirement: Delivery evidence chain

The system SHALL preserve final traceability for docs, CI, and UI polish.

#### Scenario: Final polish is reviewed

- **GIVEN** final delivery polish is complete
- **WHEN** the evidence notes are inspected
- **THEN** they link requirement IDs, OpenSpec change, design reference, representative prompt/tool use, human review, tests/builds, implementation paths, and commit
