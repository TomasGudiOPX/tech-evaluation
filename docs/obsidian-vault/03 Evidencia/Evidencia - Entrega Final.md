---
tags: [evidencia, entrega, ci, docs, ui]
requirement_ids: [FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07, FR-08, NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, UX-01, AI-01, AI-02, AI-03]
status: accepted
---

# Evidencia - Entrega Final

## Alcance

- **Requisitos:** FR-01..FR-08, NFR-01..NFR-05, UX-01, AI-01, AI-02, AI-03.
- **Cambios OpenSpec:** `add-identity-rbac`, `add-product-catalog-admin`, `add-cart-checkout-orders`, `finalize-delivery-docs-ci-polish`, `close-evaluation-gaps`, `add-admin-route`, `add-dark-mode`.
- **Decision humana:** mantener Vite + React y usar `stitch_minimalist_retail_showcase` como referencia UI/UX adaptativa, no como fuente canonica.

## Evidencia tecnica

- Storefront reemplaza la pantalla starter por catalogo (con pager cliente), detalle, login/register (con pistas de credenciales demo), carrito, checkout, ordenes y admin.
- Admin vive en ruta SPA `/admin` propia (pestaña nueva, deep-link, refresh), con formulario sticky en pantallas anchas y fallback SPA via `apps/web/nginx.conf`.
- Modo claro/oscuro con toggle y persistencia (default a `prefers-color-scheme`), sin flash, aplicado en storefront y admin.
- API con Helmet + rate limit por IP -> 429 `{ code: 'RATE_LIMITED' }` y `GET /api/products?page&pageSize` opt-in con `pagination`.
- Swagger queda expuesto en `/api/docs`.
- CI de GitHub ejecuta instalacion inmutable, `lint:eslint`, `format:check`, lint TS, build de contratos, Prisma generate, build API, tests API, build web y build raiz.
- Codigo starter de `projects` y herramientas MCP asociadas queda retirado.
- Documentacion actualizada en `README.md`, `AGENT.md`, `docs/VPS-DOC.md`, `docs/DESIGN.md`, `docs/DEVELOPMENT.md`, `docs/ENVIRONMENTS.md` y OpenSpec.
- Arranque Docker documentado y corregido: `migrate` antes de `seed`, perfil `ops` para tareas de base de datos y entornos por configuracion en vez de perfiles `dev`/`qa`/`prod`.
- QA separada en `QA-Implementation`: smoke ejecutable, contratos de corrida, matriz backend, analisis de gaps, planes manuales y evidencia bajo `tests/`. La rama se integro a `develop` via PR #1 (merge `9a3b15b`).

## Verificacion

Ejecutado al cierre de cada cambio y al cierre total:

```powershell
yarn lint
yarn lint:eslint
yarn format:check
yarn workspace @vps-template/contracts build
yarn workspace @vps-template/api prisma:generate
yarn workspace @vps-template/api build
yarn workspace @vps-template/api test
yarn workspace @vps-template/web build
yarn build
docker compose --env-file .env.example config
docker compose --env-file .env --profile ops run --rm --build migrate
docker compose --env-file .env --profile ops run --rm seed
docker compose --env-file .env up -d --build
```

Resultado: lint OK; lint:eslint OK; format:check OK; contracts build OK; Prisma generate OK con warning no bloqueante de configuracion Prisma 7; API build OK; API tests OK con 8 archivos y 29 tests; web build OK; build raiz OK; Compose config OK; arranque Docker local verificado con `/health`, `/`, `/admin`, catalogo seed, `/api/products?page&pageSize` y Swagger.

## QA Implementation

La rama `QA-Implementation` agrega evidencia especifica de QA sin ampliar el alcance funcional. El proposito fue demostrar como se valida el flujo principal desde la perspectiva del evaluador y dejar artefactos repetibles/auditables.

Motivo: las pruebas unitarias/backend ya cubrian servicios y repositorios, pero no dejaban un contrato operativo claro del recorrido completo con Docker, HTTP real, RBAC, checkout idempotente y estado final del carrito. El smoke `tests/qa-commerce-smoke.mjs` llena ese hueco sin nuevas dependencias.

Resultado QA: backend suite OK con 8 archivos y 29 tests; smoke QA OK con 12 checks; PR #1 integrada a `develop` en `9a3b15b`; commit `cf69941 Add QA implementation artifacts`; documentacion de rationale en `c9ed3aa`.

## Ampliacion post-entrega

Despues del cierre inicial y de integrar QA, se cerraron gaps del rubric y dos mejoras de UX:

- `close-evaluation-gaps` (`08ad0bb`): Helmet + rate limit 429, paginacion de productos y ESLint flat + Prettier con sus scripts y gates en CI; luego `7389013 chore(style): format codebase with Prettier`.
- `add-dark-mode` (`3d048e8`): tema persistente con default OS y toggle sin flash en storefront y admin.
- `add-admin-route` (`c8fe5d0`): ruta `/admin` dedicada, fallback SPA y formulario sticky.
- `541680e fix(web): show demo credential hints and return to catalog on logout`.
- `7c3d86d feat: update product categories flow and UI` (reemplaza `5fd50de`).

Detalle por cambio en [[03 Evidencia/Evidencia - Evaluacion Ampliada]].

## Deuda o gaps abiertos

- No hay suite Playwright frontend versionada; las skills QA dejaron contrato y plan manual para esa etapa posterior.
- El smoke requiere stack Docker ya migrado y seeded en `QA_BASE_URL`, por defecto `http://127.0.0.1:18080`.
- Los cambios OpenSpec `add-admin-route`, `add-dark-mode` y `close-evaluation-gaps` quedan en `openspec/changes/` sin mover a `archive/`; las tareas estan completas (`[x]`) y el codigo aplicado, el archivo de cambios queda como historico sin archivado explicito.
- Busqueda y filtros avanzados siguen fuera de alcance.