---
tags: [arquitectura, dominio]
---

# Modulos de Dominio

## Auth

Posee `User`, credenciales e identidad. Registro publico asigna solo `customer`; un seed controlado por entorno crea el admin inicial. JWT y guards protegen las rutas.

## Products

Posee `Product`. Catalogo y detalle son publicos. Admin crea, edita y retira. El retiro es logico: no se muestra ni se puede comprar. `GET /api/products` admite paginacion opcional (`page`/`pageSize`) con `skip`/`take` + `count` y `pagination` en la respuesta; sin parametros devuelve el listado completo.

## Cart

Posee `Cart` y `CartItem` del usuario autenticado. Sus mutaciones requieren login y solo se limpia despues de checkout exitoso.

## Orders

Posee `Order`, `OrderItem` e idempotencia. Mantiene snapshots de precio/cantidad y limita historial al propietario.

## Seguridad API

Capa de transporte del API: `@fastify/helmet` aplica headers de seguridad a cada respuesta y `@nestjs/throttler` con `AppThrottlerGuard` rate-limita por IP respetando `X-Forwarded-For`. El exceso se mapea a HTTP 429 `{ code: 'RATE_LIMITED', message }` via `AppExceptionFilter` para mantener el envelope de errores.

## Superficies Web

- **Storefront** (`apps/web/src/main.tsx`): ruta por defecto con catalogo, detalle, auth, carrito, checkout, ordenes y header con toggle de tema.
- **Admin** (`apps/web/src/components/AdminApp.tsx` en `/admin`): raiz SPA separada, top bar minima, toggle de tema, redireccion a `/` si no hay admin. Se sirve con fallback SPA via `apps/web/nginx.conf` (`try_files ... /index.html`) y el header abre `/admin` en pestaña nueva.
- **Tema** (`apps/web/src/hooks/useTheme.ts` + inline script en `index.html`): defaulta a `prefers-color-scheme`, persiste en `localStorage['theme']`, aplica `data-theme` en `<html>` sin flash en el primer render.

## Operacion Docker

Compose ejecuta `proxy`, `web`, `api` y `db` como servicios persistentes. No hay perfiles `dev`, `qa` o `prod`; staging y produccion son instancias separadas por branch, checkout, `.env`, `COMPOSE_PROJECT_NAME`, puertos, base de datos, credenciales y dominio. El perfil `ops` contiene solo trabajos puntuales: `migrate` aplica Prisma migrations y `seed` carga datos deterministas despues de migrar.

## Tooling

ESLint flat config y Prettier en la raiz con scripts `lint:eslint`, `format:check`, `format:write`. CI ejecuta `lint:eslint` y `format:check` ademas de los builds y tests existentes. El estilo del codigo quedo normalizado en un solo `chore(style): format codebase with Prettier`.

## API prevista

- Publica: `GET /products` (con `page`/`pageSize` opcionales), `GET /products/:id`.
- Auth: registro, login y perfil.
- Carrito: `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:productId`, `DELETE /cart/items/:productId`.
- Ordenes: `POST /orders/checkout`, `GET /orders`.
- Admin: alta, lectura, actualizacion y retiro de productos.
- Seguridad: headers Helmet y rate limit 429 por IP.