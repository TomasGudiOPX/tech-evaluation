---
tags: [evidencia, qa, smoke, branch]
requirement_ids: [FR-02, FR-03, FR-04, FR-05, FR-06, FR-07, NFR-02, AI-03]
status: accepted
---

# Evidencia - QA Implementation

| Eslabon | Registro |
| --- | --- |
| Requisitos | FR-02 carrito, FR-03 auth/RBAC, FR-04 checkout, FR-05 historial, FR-06 API, FR-07 admin, NFR-02 calidad, AI-03 evidencia de IA. |
| Rama | `QA-Implementation` publicada en `origin/QA-Implementation`. |
| Decision | Separar QA en una rama propia para agregar evidencia, contratos de prueba y smoke reproducible sin mezclarlo con cambios funcionales nuevos. |
| Prompt y herramienta | [[03 Evidencia/Registro de Evidencia IA#AI-2026-08-03-07 - QA implementation con skills locales]] |
| Revision humana | El usuario pidio usar las skills QA locales y autorizo commit/push cuando el proceso estuviera terminado. |
| Correccion o rechazo | No se uso TestSprite porque las skills locales lo condicionan a solicitud explicita o artefactos TestSprite existentes. |
| Pruebas | `yarn workspace @vps-template/api test` OK: 8 archivos, 29 tests. `yarn node tests/qa-commerce-smoke.mjs` OK: 12 checks. |
| Artefactos | `tests/qa-commerce-smoke.mjs`, `tests/casos-de-prueba-backend/cart-checkout-orders/`, `tests/casos-de-prueba/cart-checkout-orders/`. |
| Commit | `cf69941 Add QA implementation artifacts`. |

## Proposito

La QA implementation documenta como se valida el sistema completo despues de implementar las verticales principales. No agrega una nueva feature de negocio; agrega evidencia ejecutable y revisable sobre el comportamiento que ya debe cumplir la aplicacion.

## Razon tecnica

Las pruebas unitarias y de servicios prueban reglas internas, pero el evaluador tambien necesita ver que el stack levantado responde como producto: healthcheck, catalogo publico, registro, RBAC, carrito, checkout con idempotencia, carrito limpio e historial de ordenes. El smoke ejecuta ese recorrido por HTTP contra la URL de QA y reporta checks discretos.

## Cobertura QA

- Health y conexion de base de datos.
- Perfil autenticado rechazado sin token.
- Catalogo publico con productos seed.
- Registro de cliente.
- Cliente bloqueado en operaciones admin.
- Alta de item en carrito.
- Checkout sin body con `Idempotency-Key`.
- Reintento idempotente devuelve la misma orden.
- Carrito queda vacio despues del checkout.
- Historial devuelve la orden del usuario.

## Deuda o gaps

- No hay suite Playwright frontend versionada; las skills dejaron contrato y plan manual para cubrir navegacion visual en una etapa posterior.
- El smoke requiere stack Docker ya migrado y seeded en `QA_BASE_URL`, por defecto `http://127.0.0.1:18080`.
