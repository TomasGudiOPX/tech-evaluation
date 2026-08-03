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
- Docker Compose para web, API y PostgreSQL.
- GitHub Actions ejecuta lint, pruebas y build.
- Commits descriptivos.

## NFR-03 - API y errores

- Swagger publica el contrato REST.
- Error esperado: `{ code, message, fieldErrors? }`.
- Validacion usa `fieldErrors`; auth, RBAC y conflictos usan codigos estables.
- Conflictos de dominio devuelven HTTP 409.
