---
tags: [evidencia, identidad, rbac]
requirement_ids: [FR-03, FR-06, AI-01, AI-03]
status: accepted
---

# Evidencia - Identidad y RBAC

| Eslabon | Registro |
| --- | --- |
| Requisitos | [[01 Requisitos/Requisitos Funcionales#FR-03 - Identidad y RBAC]], [[01 Requisitos/Requisitos de Calidad#NFR-03 - API y errores]] |
| OpenSpec | `openspec/changes/add-identity-rbac` |
| Decision | Registro publica solo `customer`; seed crea admin por entorno. |
| Arquitectura | [[02 Arquitectura/Modulos de Dominio#Auth]] |
| Prompt y herramienta | [[03 Evidencia/Registro de Evidencia IA#AI-2026-08-03-01 - Especificacion inicial de identidad y RBAC]] |
| Revision humana | Aceptado: registro publico siempre `customer`; seed admin solo por entorno; escalacion de rol rechazada; JWT, guards y envelope de errores verificados. |
| Pruebas | `auth.service.test.ts` (registro, login, perfil, escalacion de rol), `roles.guard.test.ts` (401 sin token y 403 con token valido sin rol admin). Suite API OK: 8 archivos, 29 tests. |
| Implementacion | `apps/api/src/modules/auth/` (`auth.controller.ts`, `auth.service.ts`, `auth.repository.ts`, `jwt-auth.guard.ts`, `roles.guard.ts`, `roles.decorator.ts`, `token.service.ts`), `apps/api/prisma/schema.prisma` (modelo `User`), `apps/api/prisma/seed.ts` (admin por entorno). |
| Commit | `d64c54c feat(auth): add identity RBAC baseline for FR-03 FR-06 AI-01`. |

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

## Verificacion

- `yarn workspace @vps-template/api test`: OK, 8 archivos y 29 tests (incluye `auth.service.test.ts` y `roles.guard.test.ts`).
- `yarn workspace @vps-template/api build`: OK.
- `yarn build`: OK.