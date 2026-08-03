---
tags: [requisitos, funcional]
---

# Requisitos Funcionales

## FR-01 - Catalogo

- Catalogo responsive con nombre, precio, imagen y stock.
- Detalle publico por producto.
- Productos retirados quedan fuera del catalogo y checkout.

## FR-02 - Carrito

- Agregar, quitar y modificar cantidades.
- Las mutaciones requieren login.
- Se persiste en PostgreSQL para un flujo simple y auditable.

## FR-03 - Identidad y RBAC

- Registro e inicio de sesion.
- Registro publico crea solo `customer`.
- Seed de desarrollo crea el primer `admin` con variables de entorno.
- Ver [[03 Evidencia/Evidencia - Identidad y RBAC]].

## FR-04 - Checkout

- Crea una orden sin pago real.
- Descuenta stock, persiste snapshots y limpia el carrito atomicamente.
- Exige `Idempotency-Key`.

## FR-05 - Historial

- El usuario autenticado consulta solo sus ordenes.
- Cada linea conserva precio y cantidad inmutables.

## FR-06 - Administracion

- Solo admin puede crear, editar o retirar productos.
- No hay hard delete.
