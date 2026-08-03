---
tags: [requisitos, calidad]
---

# Requisitos de Calidad

## NFR-01 - Estructura y seguridad

- TypeScript y modulos con responsabilidades claras.
- Secretos fuera del codigo y `.env.example` completo.
- Prisma con migraciones versionadas.
- Manejo de errores centralizado, sin stack traces expuestos.

## NFR-02 - Calidad y entrega

- ESLint y Prettier.
- Pruebas de auth, products, RBAC y e2e happy path.
- Pruebas de checkout: exito, sin stock, idempotencia y ultima unidad concurrente.
- Docker Compose para web, API, PostgreSQL y tareas operativas `migrate`/`seed` bajo perfil `ops`.
- GitHub Actions ejecuta lint, pruebas y build.
- Entornos separados por `.env`, `COMPOSE_PROJECT_NAME`, puertos, base de datos, credenciales, dominio y branch; no por perfiles `dev`, `qa` o `prod`.
- Commits descriptivos.

## NFR-03 - API y errores

- Swagger publica el contrato REST.
- Error esperado: `{ code, message, fieldErrors? }`.
- Validacion usa `fieldErrors`; auth, RBAC y conflictos usan codigos estables.
- Conflictos de dominio devuelven HTTP 409.
