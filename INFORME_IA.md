# Informe de uso de IA

Este informe se completa durante el desarrollo. No es una transcripcion completa; registra interacciones representativas, decisiones humanas y correcciones concretas.

## Herramientas usadas

- Codex: exploracion inicial, creacion de artefactos OpenSpec, bootstrap del vault y primera implementacion de identidad/RBAC.

## Especificacion previa

- `openspec/changes/add-identity-rbac`: primera especificacion antes de codigo para registro, login, perfil autenticado, RBAC y seed admin.
- `docs/obsidian-vault/`: vault de trazabilidad con mapa de requisitos, decisiones y evidencia por vertical.

## Prompts representativos

### AI-2026-08-03-01 - Especificacion inicial de identidad y RBAC

- **Contexto:** `evaluation.md`, diseño aprobado en `docs/office-hours/traceable-modular-monolith-shopping-cart.md`, y vault inicial.
- **Objetivo:** crear el primer cambio OpenSpec antes de implementar codigo.
- **Resultado:** se creo `openspec/changes/add-identity-rbac` y la evidencia inicial.
- **Revision/correccion humana:** se detecto que el vault inicial estaba fuera del Git root entregable; se corrigio a `docs/obsidian-vault/`.

### AI-2026-08-03-02 - Decision de stack

- **Contexto:** el repositorio partia de Vite/Fastify/raw pg, pero `evaluation.md` sugiere Next.js/NestJS y permite otro stack solo con justificacion.
- **Objetivo:** decidir si adaptar el template o seguir la consigna sugerida.
- **Decision humana:** seguir el stack sugerido: Next.js, NestJS, PostgreSQL y Prisma.
- **Resultado:** README, ADR y OpenSpec documentan que el reemplazo del template es intencional.
- **Correccion/rechazo:** se rechazo implementar auth sobre Fastify/raw pg porque desviaria el proyecto del stack elegido para la evaluacion.

## Correcciones o rechazos relevantes

- No se acepto que el request de registro pueda enviar `role` o `isAdmin`; el servicio debe crear siempre `customer`.
- No se acepto crear un admin por defecto si faltan variables de entorno.
- No se acepto conservar el acceso a datos con `CREATE TABLE IF NOT EXISTS` para usuarios; se introdujo Prisma con migracion versionada.

## Estado

Pendiente completar resultados de pruebas, rutas finales de implementacion, commits descriptivos y reflexion final.
