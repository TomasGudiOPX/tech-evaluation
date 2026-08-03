# Tasks: Close Evaluation Gaps

## 1. API security hardening

- [x] 1.1 Add `@fastify/helmet` and `@nestjs/throttler` to `apps/api/package.json` dependencies
- [x] 1.2 Register Helmet in `apps/api/src/app.ts` so all responses carry standard security headers
- [x] 1.3 Add `ThrottlerModule.forRoot([{ ttl, limit }])` + a global `AppThrottlerGuard` (extends `ThrottlerGuard`, `X-Forwarded-For` tracker) and map `ThrottlerException` → `{ code: 'RATE_LIMITED', message }` in `AppExceptionFilter`
- [x] 1.4 Add an API test asserting security headers are present and the rate-limit `429` shape

## 2. Product pagination (API)

- [x] 2.1 Add `paginationSchema` and `productListResponseSchema` to `packages/contracts/src/products.ts`
- [x] 2.2 Add a validated `listQuerySchema` (`page`/`pageSize` via `z.coerce.number().int()`, `pageSize` max 100) and update `ProductController.list` to accept and forward query params
- [x] 2.3 Update `ProductService.listActive` to parse the query, delegate to the repository, and return `{ products, pagination }`
- [x] 2.4 Update `ProductRepository` to accept `page`/`pageSize`, using `skip`/`take` + `count` when `pageSize` is provided and the current full `findMany` otherwise
- [x] 2.5 Extend `product.service.test.ts` / controller tests for: default (all), paged request with correct metadata, and invalid `page`/`pageSize` → `400` with `fieldErrors`

## 3. Catalog UI pager

- [x] 3.1 In `apps/web/src/components/CatalogView.tsx`, add `page` state and a client-side pager (Prev / "Page X of Y" / Next) over `filteredProducts` with a fixed page size
- [x] 3.2 Reset the page to `1` when filters or the product list change

## 4. ESLint + Prettier tooling

- [x] 4.1 Add root devDependencies (`eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-config-prettier`, `prettier`, `globals`) and scripts `lint:eslint`, `format:check`, `format:write` in the root `package.json`
- [x] 4.2 Add `eslint.config.mjs` (flat config: TS recommended, React hooks rules for `apps/web`, ignores for `dist`/`node_modules`/generated) and `.prettierrc`
- [x] 4.3 Run `prettier --write .` to normalize formatting and fix any `lint:eslint` errors so both pass
- [x] 4.4 Add `yarn lint:eslint` and `yarn format:check` steps to `.github/workflows/ci.yml`

## 5. Verification

- [x] 5.1 Run `yarn lint:eslint`, `yarn format:check`, and `yarn workspace @vps-template/api test` and fix any failures
- [x] 5.2 Rebuild and restart the API and web images with `docker compose up -d --build api web` and confirm `/`, `/admin`, and `/api/products` still return `200`
- [x] 5.3 Manually verify: `GET /api/products` (default full list), `?page=2&pageSize=4` (paged + metadata), `?page=0` (`400` with `fieldErrors`), security headers on a response, and a `429` structured error after exceeding the rate limit; confirm the catalog pager works and filters still apply
