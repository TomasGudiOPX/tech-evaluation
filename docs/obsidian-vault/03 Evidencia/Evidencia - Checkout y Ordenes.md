---
tags: [evidencia, carrito, checkout, ordenes, tdd]
requirement_ids: [FR-02, FR-04, FR-05, FR-06, NFR-02, AI-02, AI-03]
status: accepted
---

# Evidencia - Checkout y Ordenes

| Eslabon | Registro |
| --- | --- |
| Requisitos | [[01 Requisitos/Requisitos Funcionales#FR-02 - Carrito]], [[01 Requisitos/Requisitos Funcionales#FR-04 - Checkout]], [[01 Requisitos/Requisitos Funcionales#FR-05 - Historial]], [[01 Requisitos/Requisitos de Calidad#NFR-02 - Calidad y entrega]] |
| OpenSpec | `openspec/changes/add-cart-checkout-orders` |
| Decision | Carrito autenticado persistente; checkout simulado atomico; snapshots inmutables; idempotencia por usuario y clave. |
| Arquitectura | [[02 Arquitectura/Modulos de Dominio#Cart]], [[02 Arquitectura/Modulos de Dominio#Orders]] |
| Prompt y herramienta | [[03 Evidencia/Registro de Evidencia IA#AI-2026-08-03-04 - Carrito checkout y ordenes]] |
| Revision humana | Aceptado: sin guest cart, sin pagos reales, sin reservas previas; se mantiene stock-safe checkout como invariante principal. |
| Pruebas | `yarn workspace @vps-template/contracts build` OK; `yarn workspace @vps-template/api prisma:generate` OK; `yarn workspace @vps-template/api build` OK; `yarn workspace @vps-template/api test` OK: 8 archivos, 29 tests; `yarn workspace @vps-template/web build` OK; `yarn build` OK. |
| Implementacion | `packages/contracts/src/cart.ts`, `packages/contracts/src/orders.ts`, `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/20260803123000_create_cart_orders/`, `apps/api/src/modules/cart/`, `apps/api/src/modules/orders/`. |
| Commit | `feat(orders): add cart checkout orders for FR-02 FR-04 FR-05 AI-02`. |

## Criterios de aceptacion

- Carrito requiere login y pertenece al usuario autenticado.
- Se puede agregar, actualizar y quitar productos activos.
- Productos faltantes o retirados no entran al carrito.
- Checkout exige `Idempotency-Key`.
- Checkout decrementa stock, crea orden, guarda snapshots y limpia carrito en una transaccion.
- Stock insuficiente devuelve `INSUFFICIENT_STOCK` y no crea orden.
- Retry idempotente devuelve la orden original.
- Reuso de clave con carrito distinto devuelve `IDEMPOTENCY_KEY_REUSED`.
- Historial devuelve solo ordenes del usuario actual.

## Revision humana inicial

- Se rechaza carrito anonimo para evitar merge de invitados.
- Se rechaza pago real porque el requisito pide checkout simulado.
- Se rechaza hard delete de productos porque las ordenes necesitan snapshots auditables.
- El test de ultima unidad concurrente es el ancla TDD de `AI-02`.

## Verificacion

- `yarn workspace @vps-template/contracts build`: OK.
- `yarn workspace @vps-template/api prisma:generate`: OK.
- `yarn workspace @vps-template/api build`: OK.
- `yarn workspace @vps-template/api test`: OK, 8 archivos y 29 tests.
- `yarn workspace @vps-template/web build`: OK.
- `yarn build`: OK.
