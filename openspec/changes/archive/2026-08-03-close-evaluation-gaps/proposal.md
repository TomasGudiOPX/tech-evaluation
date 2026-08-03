# Close Evaluation Gaps

## Why

The technical evaluation (`evaluation.md`) lists optional and non-functional requirements that are still missing from the deliverable: no rate limiting or security headers, no product-list pagination, and no ESLint/Prettier configuration. Closing these strengthens the junior-advanced classification and removes the three most objective gaps against the rubric.

## What Changes

- **API security hardening**: register Helmet security headers and a global per-IP rate limit on the API. When the limit is exceeded, the API returns a structured `429` error instead of serving the request.
- **Product pagination**: `GET /api/products` accepts optional `page` and `pageSize` query parameters, validates them, uses Prisma `skip`/`take` + `count`, and returns pagination metadata alongside `products`. Omitting the parameters preserves today's behavior (full list). The catalog UI gains a pager over its client-filtered results.
- **ESLint + Prettier (tooling, no runtime behavior)**: add a repo-level ESLint flat config (TypeScript + React hooks rules) and Prettier config, wire `lint:eslint` and `format:check` scripts, and run them in CI. Existing `tsc --noEmit` type checks remain untouched.

## Capabilities

### New Capabilities
- `api-security`: Behavior of the API's transport-level hardening — security headers on every response and per-IP rate limiting with a structured `429` on exceed.
- `product-pagination`: Behavior of listing products in pages — optional `page`/`pageSize` parameters, validation, pagination metadata in the response, and unchanged default behavior.

### Modified Capabilities
- None.

## Impact

- `apps/api/package.json` — add `@fastify/helmet`, `@nestjs/throttler`.
- `apps/api/src/app.ts` — register Helmet and the global rate limiter on the Fastify adapter.
- `packages/contracts/src/products.ts` — add `productListResponseSchema` (or pagination metadata schema).
- `apps/api/src/modules/products/` — controller/service/repository support `page`/`pageSize` with `skip`/`take` + `count`; controller validates query params; tests updated.
- `apps/web/src/components/CatalogView.tsx` — client-side pager over the filtered results.
- Root `package.json` — ESLint/Prettier devDependencies and `lint:eslint` / `format:check` / `format:write` scripts; new `eslint.config.js` and `.prettierrc`.
- `.github/workflows/ci.yml` — run `lint:eslint` and `format:check`.
- No database schema or contract-breaking changes.
