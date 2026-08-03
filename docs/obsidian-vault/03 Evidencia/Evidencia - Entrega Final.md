---
tags: [evidencia, entrega, ci, docs, ui]
---

# Evidencia - Entrega Final

## Alcance

- **Requisitos:** FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07, NFR-01, NFR-02, NFR-03, AI-01, AI-02, AI-03.
- **Cambio OpenSpec:** `openspec/changes/finalize-delivery-docs-ci-polish`.
- **Decision humana:** mantener Vite + React y usar `stitch_minimalist_retail_showcase` como referencia UI/UX adaptativa, no como fuente canonica.

## Evidencia tecnica

- Storefront reemplaza la pantalla starter por catalogo, detalle, login/register, carrito, checkout, ordenes y admin.
- Swagger queda expuesto en `/api/docs`.
- CI de GitHub ejecuta instalacion inmutable, lint, build de contratos, Prisma generate, build API, tests API, build web y build raiz.
- Codigo starter de `projects` y herramientas MCP asociadas queda retirado para evitar una narrativa ajena al dominio.
- Documentacion actualizada en `README.md`, `AGENT.md`, `docs/VPS-DOC.md`, `docs/DESIGN.md`, `docs/DEVELOPMENT.md`, `docs/ENVIRONMENTS.md` y OpenSpec.
- Arranque Docker documentado y corregido: `migrate` antes de `seed`, perfil `ops` para tareas de base de datos y entornos por configuracion en vez de perfiles `dev`/`qa`/`prod`.
- QA separada en `QA-Implementation`: smoke ejecutable, contratos de corrida, matriz backend, analisis de gaps, planes manuales y evidencia bajo `tests/`.

## Verificacion

Ejecutado al cierre del cambio:

```powershell
yarn lint
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

Resultado: lint OK; contracts build OK; Prisma generate OK con warning no bloqueante de configuracion Prisma 7; API build OK; API tests OK con 8 archivos y 29 tests; web build OK; build raiz OK; Compose config OK; arranque Docker local verificado con `/health`, catalogo seed y Swagger.

## QA Implementation

La rama `QA-Implementation` agrega evidencia especifica de QA sin ampliar el alcance funcional de la aplicacion. El proposito fue demostrar como se valida el flujo principal desde la perspectiva del evaluador y dejar artefactos que puedan repetirse o auditarse despues.

Motivo: las pruebas unitarias/backend ya cubrian servicios y repositorios, pero no dejaban un contrato operativo claro del recorrido completo con Docker, HTTP real, RBAC, checkout idempotente y estado final del carrito. El smoke `tests/qa-commerce-smoke.mjs` llena ese hueco sin introducir dependencias nuevas.

Resultado QA: backend suite OK con 8 archivos y 29 tests; smoke QA OK con 12 checks; branch publicada en `origin/QA-Implementation`; commit `cf69941 Add QA implementation artifacts`.
