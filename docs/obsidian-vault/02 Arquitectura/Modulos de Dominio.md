---
tags: [arquitectura, dominio]
---

# Modulos de Dominio

## Auth

Posee `User`, credenciales e identidad. Registro publico asigna solo `customer`; un seed controlado por entorno crea el admin inicial. JWT y guards protegen las rutas.

## Products

Posee `Product`. Catalogo y detalle son publicos. Admin crea, edita y retira. El retiro es logico: no se muestra ni se puede comprar.

## Cart

Posee `Cart` y `CartItem` del usuario autenticado. Sus mutaciones requieren login y solo se limpia despues de checkout exitoso.

## Orders

Posee `Order`, `OrderItem` e idempotencia. Mantiene snapshots de precio/cantidad y limita historial al propietario.

## Operacion Docker

Compose ejecuta `proxy`, `web`, `api` y `db` como servicios persistentes. No hay perfiles `dev`, `qa` o `prod`; staging y produccion son instancias separadas por branch, checkout, `.env`, `COMPOSE_PROJECT_NAME`, puertos, base de datos, credenciales y dominio. El perfil `ops` contiene solo trabajos puntuales: `migrate` aplica Prisma migrations y `seed` carga datos deterministas despues de migrar.

## API prevista

- Publica: `GET /products`, `GET /products/:id`.
- Auth: registro, login y perfil.
- Carrito: `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:productId`, `DELETE /cart/items/:productId`.
- Ordenes: `POST /orders/checkout`, `GET /orders`.
- Admin: alta, lectura, actualizacion y retiro de productos.
