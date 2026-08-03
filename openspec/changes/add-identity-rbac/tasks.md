# Tasks

## 1. Specification and Evidence

- [x] Link this OpenSpec change from `docs/obsidian-vault/03 Evidencia/Evidencia - Identidad y RBAC.md`.
- [x] Record the representative prompt/tool use for the identity slice.
- [x] Record human review notes for role escalation, JWT handling, guards, and error codes.

## 2. Tests First Where Valuable

- [x] Add auth service tests for registration, password hashing, login success, and invalid credentials.
- [x] Add tests proving public registration cannot create an admin.
- [x] Add RBAC route tests proving customer users cannot access admin-only product writes.
- [x] Add error-envelope tests for validation, unauthenticated, and forbidden responses.

## 3. Implementation Plan

- [x] Replace the starter Fastify API foundation with NestJS for the evaluation target stack.
- [x] Introduce Prisma and a versioned user migration before auth persistence.
- [x] Introduce the NestJS auth module and user persistence through Prisma migrations.
- [x] Add environment configuration for JWT and development admin seed variables.
- [x] Implement registration, login, profile, JWT guard, and role guard.
- [x] Export the JWT and role guard contract for admin product routes when the products module is created.

## 4. Documentation and Handoff

- [x] Update `.env.example` with auth and admin seed variables.
- [x] Document the auth/RBAC decision in the README.
- [x] Update `INFORME_IA.md` with the identity slice evidence and corrections.
- [x] Commit with a message that references the identity/RBAC requirement IDs.
