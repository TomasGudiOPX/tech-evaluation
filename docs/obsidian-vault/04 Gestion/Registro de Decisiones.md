---
tags: [adr, decisiones]
---

# Registro de Decisiones

## ADR-001 - Stack modular

**Actualizado.** Vite + React, NestJS, PostgreSQL y Prisma hacen visible la separacion por dominios sin costo de microservicios. Se mantiene Vite + React para la entrega final porque la aplicacion ya esta integrada y verificada; la justificacion queda en conservar momentum y reducir riesgo de migracion tardia.

## ADR-002 - Carrito autenticado persistente

**Aprobado.** Evita guest-cart merge y conserva un flujo pequeno y auditable.

## ADR-003 - Registro sin eleccion de rol

**Aprobado.** Registro publico crea customer; seed por entorno crea admin. Ver [[03 Evidencia/Evidencia - Identidad y RBAC]].

## ADR-004 - Stitch como referencia visual adaptativa

**Aprobado.** `stitch_minimalist_retail_showcase` guia el lenguaje UI/UX, pero no es fuente de verdad. La app adapta jerarquia, espaciado, imagenes y tono minimalista a los endpoints, datos y alcance de este proyecto.

## ADR-005 - Entornos por configuracion y perfil operativo

**Aprobado.** No se crean perfiles Docker `dev`, `qa` o `prod` porque staging y produccion se separan por checkout, branch, `.env`, `COMPOSE_PROJECT_NAME`, puertos, base de datos, credenciales y dominio. Compose mantiene solo el perfil `ops` para tareas puntuales `migrate` y `seed`, ejecutadas antes de levantar el stack persistente.

## ADR-006 - QA implementation en rama separada

**Aprobado.** La QA implementation se mantiene en `QA-Implementation` para aislar evidencia, contratos de prueba y smoke reproducible de los cambios funcionales principales. La razon es que los artefactos QA agregan trazabilidad y repetibilidad, pero no deben reabrir el alcance del producto ni mezclar planes de prueba con refactors de UI.

Se usaron las skills locales `qa-smoke`, `qa-backend-full-test` y `qa-front-playwright-test` como guias. Se rechazo TestSprite porque las instrucciones locales lo reservan para pedido explicito o evidencia TestSprite existente. La rama se integro a `develop` via PR #1 (merge `9a3b15b`).

## ADR-007 - Ruta `/admin` dedicada (no inline)

**Aprobado.** La consola admin pasa de ser un `view === 'admin'` dentro del storefront a una ruta SPA `/admin` con su propia raiz (`AdminApp.tsx`), top bar minima y fallback SPA via `apps/web/nginx.conf`. Se abstrae del storefront para tener deep-link, refresh y aislamiento visual; el header abre `/admin` en pestaña nueva. No tocar API ni base de datos. Ver `openspec/changes/add-admin-route`.

## ADR-008 - Modo oscuro con default OS y sin flash

**Aprobado.** Tema claro/oscuro via CSS variables (`[data-theme='dark']`), toggle en Header y AdminApp, persistencia en `localStorage['theme']`, default a `prefers-color-scheme` y script inline anti-flash en `index.html`. Se evita tocar runtime o base de datos. Ver `openspec/changes/add-dark-mode`.

## ADR-009 - Seguridad API de transporte con Helmet + throttle global

**Aprobado.** Antes de cualquier throttle por usuario/auth, la API tiene headers Helmet y rate limit por IP via `@nestjs/throttler` con `AppThrottlerGuard` que respeta `X-Forwarded-For`. El 429 sigue el envelope `{ code: 'RATE_LIMITED', message }`. Espera proteccion basica sin acoplar a login. Ver `openspec/changes/close-evaluation-gaps`.

## ADR-010 - ESLint flat config + Prettier post-hoc

**Aprobado.** Se anade ESLint flat config (`eslint.config.mjs`) con TS recomendado y reglas hooks de React para `apps/web`, Prettier con `.prettierrc`/`.prettierignore`, y scripts `lint:eslint`/`format:check`/`format:write` ejecutados en CI junto al `tsc --noEmit` existente. Se normalizo el codigo en un solo `7389013 chore(style): format codebase with Prettier` para partir de una linea base consistente.
