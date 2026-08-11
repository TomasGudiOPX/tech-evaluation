# Design: Close Evaluation Gaps

## Context

The API is a NestJS app on the Fastify adapter (`createApp` in `apps/api/src/app.ts`) with CORS, a global `AppExceptionFilter`, and Swagger — but no security headers, no rate limiting, and no pagination. The products endpoint returns the full active list via `ProductRepository.listActive()` (`findMany` with no `skip`/`take`). The web catalog fetches the full catalog once and filters client-side. There is no ESLint or Prettier configuration; both workspaces use `tsc --noEmit` as "lint". See `proposal.md` for the motivation.

## Goals / Non-Goals

**Goals:**
- Add standard security headers and per-IP rate limiting with a structured `429` error.
- Add validated, optional `page`/`pageSize` pagination to `GET /api/products` with metadata, without breaking the current full-list behavior.
- Add a visible pager to the catalog UI over the client-filtered results.
- Add ESLint + Prettier configs and gate them in CI.
- Keep the existing `tsc --noEmit` type checks and the current response shape (`products` key) intact.

**Non-Goals:**
- Moving the catalog's search/filter logic to the server (that would be a larger refactor; the web keeps client-side filtering and pages the filtered subset).
- Stricter per-route rate limits on auth endpoints (a global per-IP limit meets the "básico" bar; per-route tuning is future work).
- Password lockout or captcha.

## Decisions

### 1. Helmet via `@fastify/helmet`

Register `helmet` on the Nest Fastify adapter inside `createApp` right after the app is created (`app.register(helmet, { contentSecurityPolicy: false })`). Helmet's response headers apply via `onSend` hooks that fire for every response regardless of route registration order. CSP is disabled so the Swagger UI's same-origin HTML and inline styles keep rendering.

- **Alternative considered:** `@fastify/sensible` (also adds error helpers).
- **Why not:** Helmet alone is the direct match for the evaluation item; keeping the dependency surface minimal.

### 2. Global rate limiting via `@nestjs/throttler`

Register `ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }])` in `AppModule.forConfig` and provide a global `APP_GUARD` (`AppThrottlerGuard` extends `ThrottlerGuard`). The guard's `getTracker` derives the client key from the first `X-Forwarded-For` value (set by nginx) with fallback to `req.ip`, so the limit is roughly per-client rather than a single proxy-wide bucket. `ThrottlerException` is mapped in `AppExceptionFilter` to the structured envelope `{ code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' }`.

- **Why a Nest guard instead of `@fastify/rate-limit`:** `@fastify/rate-limit` attaches its hooks via Fastify's `onRoute` hook, which only affects routes registered *after* the plugin loads. Nest registers all routes during `NestFactory.create`, so a plugin registered afterward is ineffective (verified empirically). `@nestjs/throttler` is a Nest guard that runs after routing, so it is independent of Fastify route-registration order — the idiomatic choice for a Nest app.

### 3. Pagination on `GET /api/products`

- **Contract** (`packages/contracts/src/products.ts`): add `paginationSchema` (`page`, `pageSize`, `total`, `totalPages`) and `productListResponseSchema` (`{ products, pagination }`).
- **Query validation** (controller/service): parse `page` and `pageSize` with Zod (`z.coerce.number().int().min(1)`; `pageSize` also `.max(100)`). Invalid values flow through the existing `AppExceptionFilter`'s `ZodError` branch → `400` with `fieldErrors`. When omitted, `page` defaults to `1` and `pageSize` to "all".
- **Repository**: when `pageSize` is provided, use `skip`/`take` and a `count` for the same `where` filter; otherwise return the full list as today.
- **Response**: `{ products, pagination: { page, pageSize, total, totalPages } }`. In "all" mode, `pageSize` equals `total` and `totalPages` is `1`. The web's existing `data.products` access keeps working unchanged.

### 4. Catalog UI pager (client-side)

`CatalogView` already computes `filteredProducts` (search/category/stock). Add `page` state and a pager (Prev / "Page X of Y" / Next) that slices `filteredProducts` at a fixed `pageSize` (e.g. 8). Reset `page` to `1` whenever filters or the product list change. This gives visible pagination while preserving the client-side filter UX.

### 5. ESLint + Prettier (tooling)

- Add root devDependencies: `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-config-prettier`, `prettier`, `globals`.
- Add a flat config `eslint.config.mjs` (TypeScript recommended + React hooks rules for `apps/web`, ignoring `dist`, `node_modules`, and generated code) and `.prettierrc` (`singleQuote`, `printWidth: 120`, `trailingComma: all`).
- Root scripts: `lint:eslint` (`eslint .`), `format:check` (`prettier --check .`), `format:write` (`prettier --write .`). The existing `lint` (tsc) scripts are untouched.
- Run `format:write` once during implementation to normalize the repo so `format:check` passes in CI; fix any ESLint errors so `lint:eslint` is clean. `.github/workflows/ci.yml` gains `lint:eslint` and `format:check` steps.

## Risks / Trade-offs

- **Rate limit keyed off `X-Forwarded-For`** → [Risk] header can be spoofed when not behind a trusted proxy → Mitigation: nginx always overwrites it, so the API only trusts the proxy hop; documented as dev/proxy assumption.
- **Prettier full-repo formatting churn** → [Risk] large diff → Mitigation: normalize in a single task; value (consistent formatting + CI gate) outweighs diff size for an evaluation.
- **`pageSize` default of "all"** → [Risk] looks unusual in an API → Mitigation: documented in the contract and README as backward-compatible default; explicit params enable paging.
- **Pagination duplicates client filtering** → [Risk] server pages but web filters client-side → Mitigation: explicit non-goal; API pagination is the evaluator-facing capability and is tested, the UI pager is the user-facing capability.

## Migration Plan

1. Add `@fastify/helmet` + `@nestjs/throttler` deps; register the throttler module/guard and helmet in the app.
2. Add pagination to contract, controller, service, repository; add/extend product API tests.
3. Add the catalog UI pager.
4. Add ESLint/Prettier configs + scripts; run `format:write` and fix lint errors; update CI.
5. Rebuild images, run `yarn lint:eslint`, `yarn format:check`, `yarn test`, and verify `/api/products` (default + paged + invalid), security headers, and a `429` when exceeding the limit.
6. Rollback: revert the web/API changes and rebuild; the `429`/headers/pagination simply disappear. No data migration.

## Open Questions

None — per-route auth rate limits and server-side filtering are explicit non-goals; everything else is decided above.
