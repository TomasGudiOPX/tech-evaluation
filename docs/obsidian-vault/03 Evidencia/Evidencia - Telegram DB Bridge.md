---
tags: [evidencia, telegram, mcp, db]
requirement_ids: [AI-03]
status: planned
---

# Evidencia - Telegram DB Bridge

Registra el enlace de evidencia para el cambio OpenSpec `openspec/changes/add-telegram-db-mcp-bridge`. La implementacion y verificacion quedan pendientes de una corrida reactiva con evidencia de comandos o commit.

## Criterios de aceptacion

- El bridge expone herramientas MCP de lectura: `list_tables`, `describe_table` y `select`.
- Las credenciales usadas por el bridge solo permiten `SELECT`.
- Cada request de herramientas exige bearer token valido.
- El bot de Telegram atiende solo chats permitidos.
- Los resultados entregados al modelo quedan acotados.
- Los errores no exponen secretos, credenciales, connection strings ni detalles SQL internos.

## Eslabon

| Eslabon | Registro |
| --- | --- |
| Requisitos | AI-03 |
| OpenSpec | `openspec/changes/add-telegram-db-mcp-bridge` |
| Decision | Mantener el bridge local-first y read-only antes de publicar cualquier endpoint externo. |
| Arquitectura | [[02 Arquitectura/Modulos de Dominio#Seguridad API]] |
| Prompt y herramienta | n/a |
| Revision humana | Pendiente: requiere corrida reactiva con evidencia de implementacion. |
| Pruebas | Pendiente. |
| Implementacion | Pendiente. |
| Commit | Pendiente. |

## Verificacion

- Pendiente. No se registro ejecucion de comandos en este run.

## Hechos promovidos

- `contracts.telegram-db-bridge-read-only-tools`
- `security.telegram-db-bridge-access-control`

## Hechos pendientes de revision

- Ninguno en este run.
