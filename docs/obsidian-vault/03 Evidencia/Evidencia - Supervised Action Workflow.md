---
tags: [evidencia, supervised-action, actions, mcp, openix]
requirement_ids: [AI-01, AI-02, AI-03, NFR-01, NFR-02]
status: verified
---

# Evidencia - Supervised Action Workflow

Convierte el agente MCP de solo lectura en un workflow supervisado (propone → aprueba → ejecuta) con ledger de aprobaciones append-only y ejecucion trazable.

| Eslabon | Registro |
| --- | --- |
| Requisitos | [[01 Requisitos/Mapa de Requisitos#AI-01 - OpenSpec antes de codigo]], [[01 Requisitos/Mapa de Requisitos#AI-03 - Prompts, herramientas, revision y rechazos]], [[01 Requisitos/Requisitos de Calidad#NFR-01 - Estructura y seguridad]] |
| OpenSpec | `openspec/changes/add-supervised-action-workflow` |
| Decision | Los writes de slice 0 (`note`, `followup_task`) van a tablas minimas `CustomerNote` + `FollowupTask` (no ledger-only) para que "nota/tarea creada + read-back + IDs" produzca entidades reales. `stock_adjust` y `retire_product` quedan definidos en el schema pero diferidos. |
| Arquitectura | `apps/api/src/modules/actions/` (ledger + executor); MCP extendido en `apps/api/src/engine/mcp/` |
| Prompt y herramienta | Hermes/Telegram → `openspec/changes/add-supervised-action-workflow`; ver `INFORME_IA.md` (AI-2026-08-24-01) |
| Implementacion | `packages/contracts/src/actions.ts`, `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/20260824160000_add_supervised_action_workflow/migration.sql`, `apps/api/src/modules/actions/`, `apps/api/src/engine/mcp/mcp.workflow-tools.ts`, `apps/api/src/modules/orders/`, `apps/api/src/app.ts` |
| Pruebas | `prisma validate` OK; `prisma generate` OK; contracts build OK; API build OK; `yarn workspace @vps-template/api test` OK: 15 archivos, 80 tests |
| Commit | Implementacion referencia `openspec/changes/add-supervised-action-workflow` |

## Criterios de aceptacion

- `propose_action` guarda en el ledger (`status=proposed`) sin tocar datos de negocio; payload desconocido se rechaza.
- Herramientas read-only (`list_orders`, `get_order`, `get_cart`, `get_user_profile`, `list_reviews`) no escriben; `get_user_profile` enmascara el email.
- `approve_action`/`reject_action` requieren `actionId` + `decidedBy` explicito; `correct_action` reemplaza el payload.
- El ejecutor crea `CustomerNote`/`FollowupTask` y registra el id leido de vuelta en `resultRef`.
- `stock_adjust`/`retire_product` devuelven `ACTION_KIND_NOT_SUPPORTED` (diferidos).

## Verificacion

- `prisma validate` OK con `DATABASE_URL` de prueba.
- `prisma generate` OK (v6.19.3).
- `yarn workspace @vps-template/contracts build` OK.
- `yarn workspace @vps-template/api build` OK.
- `yarn workspace @vps-template/api test` OK: 15 archivos, 80 tests.
