---
tags: [evidencia, identidad, rbac]
requirement_ids: [FR-03, FR-06, AI-01, AI-03]
status: planned
---

# Evidencia - Identidad y RBAC

| Eslabon | Registro |
| --- | --- |
| Requisitos | [[01 Requisitos/Requisitos Funcionales#FR-03 - Identidad y RBAC]], [[01 Requisitos/Requisitos de Calidad#NFR-03 - API y errores]] |
| OpenSpec | `openspec/changes/add-identity-rbac` |
| Decision | Registro publica solo `customer`; seed crea admin. |
| Arquitectura | [[02 Arquitectura/Modulos de Dominio#Auth]] |
| Prompt y herramienta | [[03 Evidencia/Registro de Evidencia IA#AI-2026-08-03-01 - Especificacion inicial de identidad y RBAC]] |
| Revision humana | Aceptado: registro publico siempre `customer`; seed admin solo por entorno; probar escalacion de rol, secretos, JWT, guards y envelope de errores antes de cerrar el slice. |
| Pruebas | Pendiente: auth service y rutas RBAC. |
| Implementacion | Pendiente. |
| Commit | Pendiente. |

## Criterios de aceptacion

- El request no puede elevar su rol.
- Login sigue el contrato elegido.
- Rutas admin rechazan no-admin.
- Auth y autorizacion devuelven codigos estables.
- Seed admin depende de entorno.

## Revision humana inicial

- No aceptar campos de rol desde requests publicos.
- No crear admin por defecto si faltan variables de entorno.
- No exponer hash de password ni stack traces.
- Probar `401` sin token y `403` con token valido sin rol admin.
