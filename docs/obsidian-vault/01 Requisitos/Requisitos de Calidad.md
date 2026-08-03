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

## NFR-04 - Seguridad API

- `@fastify/helmet` registra headers de seguridad en todas las respuestas.
- `@nestjs/throttler` con `AppThrottlerGuard` aplica rate limit global por IP, considerando `X-Forwarded-For`.
- Al excedir el limite, la API responde HTTP 429 con `{ code: 'RATE_LIMITED', message }` via `AppExceptionFilter`.
- Pruebas backend afirman headers presentes y shape del 429.

## NFR-05 - Lint y formato

- ESLint flat config (`eslint.config.mjs`) con reglas TS recomendadas y hooks React para `apps/web`.
- Prettier con `.prettierrc` y `.prettierignore`.
- Scripts raiz: `lint:eslint`, `format:check`, `format:write`.
- CI ejecuta `lint:eslint` y `format:check` ademas del `tsc --noEmit` existente.
- El codigo base queda formateado en un solo `chore(style)` para partir de una linea base consistente.
