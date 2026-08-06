---
tags: [evidencia, product-reviews, reviews]
requirement_ids: [FR-09, NFR-01, NFR-02, NFR-03, AI-03]
status: verified
---

# Evidencia - Product Reviews

Agrega resenas de productos como modulo de dominio independiente de catalogo.

| Eslabon | Registro |
| --- | --- |
| Requisitos | [[01 Requisitos/Requisitos Funcionales#FR-09 - Resenas de productos]], [[01 Requisitos/Requisitos de Calidad#NFR-01 - Estructura y seguridad]], [[01 Requisitos/Requisitos de Calidad#NFR-03 - API y errores]] |
| OpenSpec | `openspec/changes/add-product-reviews` |
| Decision | "Consumer" significa cliente autenticado; se difiere verificacion de compra para evitar dependencia con historial de ordenes. |
| Arquitectura | [[02 Arquitectura/Modulos de Dominio#Reviews]] |
| Prompt y herramienta | [[03 Evidencia/Registro de Evidencia IA#AI-2026-08-06-01 - Product reviews]] |
| Implementacion | `packages/contracts/src/reviews.ts`, `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/20260806120000_add_product_reviews/migration.sql`, `apps/api/src/modules/reviews/`, `apps/api/src/app.ts`. |
| Pruebas | `yarn workspace @vps-template/api exec prisma generate --no-engine` OK; `yarn workspace @vps-template/contracts build` OK; `yarn workspace @vps-template/api build` OK; `yarn workspace @vps-template/api test` OK: 11 archivos, 42 tests; `yarn build` OK. |
| Commit | Este commit de implementacion referencia `openspec/changes/add-product-reviews`. |

## Criterios de aceptacion

- `GET /api/products/:productId/reviews` lista resenas solo de productos activos.
- Producto faltante o retirado devuelve `REVIEW_PRODUCT_NOT_FOUND`.
- `POST /api/products/:productId/reviews` requiere JWT y crea una resena por cliente/producto.
- Review duplicada devuelve HTTP 409 `REVIEW_ALREADY_EXISTS`.
- `PATCH /api/reviews/:reviewId` requiere JWT y actualiza solo resenas propias.
- Review ajena o inexistente devuelve `REVIEW_NOT_FOUND`.
- Rating no entero, rating fuera de 1..10 o comentario mayor a 100 caracteres devuelve `VALIDATION_ERROR` con `fieldErrors`.

## Verificacion

- `yarn workspace @vps-template/api exec prisma validate` OK con `DATABASE_URL=postgresql://app:app@localhost:5432/app`.
- `yarn workspace @vps-template/api exec prisma generate --no-engine` OK; el comando estandar `yarn workspace @vps-template/api prisma:generate` intento reemplazar `node_modules/.prisma/client/query_engine-windows.dll.node` y fallo por `EPERM` en Windows.
- `yarn workspace @vps-template/contracts build` OK.
- `yarn workspace @vps-template/api build` OK.
- `yarn workspace @vps-template/api test` OK: 11 archivos, 42 tests.
- `yarn build` OK.
