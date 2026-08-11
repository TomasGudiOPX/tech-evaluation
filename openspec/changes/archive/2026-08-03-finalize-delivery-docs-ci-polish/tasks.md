# Tasks

## 1. Specification and Evidence

- [x] Add a vault evidence note for final docs, CI, and UI polish.
- [x] Link `FR-01` through `FR-07`, `NFR-01`, `NFR-02`, `NFR-03`, `AI-01`, `AI-02`, and `AI-03` where relevant.
- [x] Record the Stitch reference path and representative prompt/tool use in `INFORME_IA.md`.
- [x] Record the human decision to keep Vite + React instead of converting to Next.js.

## 2. UI Polish

- [x] Replace `apps/web/src/main.tsx` starter projects UI with a product-facing retail shell.
- [x] Adapt the Stitch minimalist retail visual direction in `apps/web/src/styles.css`.
- [x] Implement catalog and product detail views backed by `GET /api/products`.
- [x] Implement register/login/profile state using existing auth endpoints.
- [x] Implement authenticated cart add/update/remove against cart endpoints.
- [x] Implement simulated checkout with generated `Idempotency-Key` and order success/error states.
- [x] Implement order history view backed by `GET /api/orders`.
- [x] Implement focused admin product management for create/update/retire.
- [x] Remove visible starter `projects` copy and workflow.

## 3. API Documentation and Code Cleanup

- [x] Add Swagger/OpenAPI setup to the NestJS app.
- [x] Add useful tags/summaries for auth, products, admin products, cart, checkout, and orders.
- [x] Decide whether to remove or replace stale `projects` API/MCP code.
- [x] Ensure optional MCP behavior does not expose stale starter project tools as the main product capability.
- [x] Keep cleanup scoped so existing commerce tests remain stable.

## 4. CI and Quality Scripts

- [x] Add `.github/workflows/ci.yml` for pushes and pull requests to `develop` and `main`.
- [x] Run install with lockfile immutability in CI.
- [x] Run contracts build, Prisma generate, API build, API tests, web build, and root build in CI.
- [x] Add lightweight lint/format scripts if feasible without destabilizing the timebox.
- [x] Document any deferred lint/format work if scripts are not added.

## 5. Documentation Truth Pass

- [x] Update `README.md` with Vite + React, NestJS, Swagger, CI, and commerce walkthrough.
- [x] Update `AGENT.md` with current architecture and conventions.
- [x] Update `docs/VPS-DOC.md` to remove Fastify/projects template language from current workflow.
- [x] Update `docs/DESIGN.md` to match NestJS, Vite, Prisma, and commerce modules.
- [x] Update `docs/DEVELOPMENT.md` with final verification and CI workflow.
- [x] Update `docs/ENVIRONMENTS.md` to use GitHub or provider-neutral wording consistently.
- [x] Update `openspec/specs/deployment-environments.md` to remove stale Fastify wording.
- [x] Update vault evidence and `INFORME_IA.md` with final verification and commit.

## 6. Verification and Handoff

- [x] Run `yarn workspace @vps-template/contracts build`.
- [x] Run `yarn workspace @vps-template/api prisma:generate`.
- [x] Run `yarn workspace @vps-template/api build`.
- [x] Run `yarn workspace @vps-template/api test`.
- [x] Run `yarn workspace @vps-template/web build`.
- [x] Run `yarn build`.
- [x] Run Docker Compose config validation if available.
- [x] Commit with a message referencing final delivery polish and CI.
