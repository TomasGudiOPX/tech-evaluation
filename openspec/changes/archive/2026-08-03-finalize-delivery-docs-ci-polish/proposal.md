# Finalize Delivery Docs, CI, and UI Polish

## Why

The core commerce backend is implemented and verified, but the final evaluation delivery still has three visible gaps: the browser UI is still the starter projects screen, several docs still describe the old template or Bitbucket/Fastify wording, and reproducible GitHub Actions CI is not present.

This change turns the repository from a feature-complete API into a coherent evaluation submission. It keeps the current Vite + React frontend as the pragmatic choice, documents that decision honestly, and uses the Stitch `Aura Commerce` reference at `../stitch_minimalist_retail_showcase` as a visual model for a polished minimalist retail UI, not as canonical product content.

## What Changes

- Replace the starter projects UI with a Vite/React retail experience for catalog, detail, cart, checkout, order history, login, and focused admin product management.
- Apply the Stitch minimalist retail visual system: editorial typography, midnight/slate palette, restrained spacing, product-first imagery, and quiet operational admin surfaces.
- Add Swagger/OpenAPI documentation to the NestJS API.
- Add GitHub Actions CI for install, contracts build, Prisma generate, API build/test, web build, and root build.
- Add or document lightweight lint/format checks where feasible for the timebox.
- Update README, agent guide, VPS/development/design docs, vault, and `INFORME_IA.md` so the stack and workflow match the implementation.
- Remove or quarantine stale starter `projects` UI/API/MCP references where safe.

## Non-Goals

- Converting the frontend to Next.js.
- Real payments, shipping/tax integrations, coupons, search, pagination, or recommendations.
- Public deployment automation beyond CI and documented Compose deployment.
- Expanding admin beyond product create/update/retire.
- Adding new backend commerce domain behavior beyond polish or docs needed by the UI.

## Impact

- Covers final evaluation requirements for a polished UI, documented REST contract, CI, reproducible checks, and AI/documentation evidence.
- Resolves the known docs mismatch: Vite + React frontend, NestJS API, PostgreSQL, Prisma.
- Makes the evaluator-facing demo align with implemented catalog, cart, checkout, order history, auth, and admin APIs.
