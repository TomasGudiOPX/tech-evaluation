---
tags: [evidencia, ia, revision]
---

# Registro de Evidencia IA

Este registro alimenta `INFORME_IA.md`. No registrar actividad que no haya ocurrido.

## AI-2026-08-03-01 - Especificacion inicial de identidad y RBAC

- **Vertical / requisito:** FR-03, FR-06, AI-01, AI-03.
- **Herramienta o agente:** Codex con `$openspec-explore` y `$openspec-apply-change`.
- **Objetivo:** Crear la primera especificacion OpenSpec antes de implementar identidad y roles.
- **Prompt resumido o enlace:** El usuario pidio iniciar cambios con contexto de `vault/00 Inicio.md` y `docs/office-hours/traceable-modular-monolith-shopping-cart.md`, luego aplicar el cambio.
- **Salida recibida:** Cambio `openspec/changes/add-identity-rbac` con proposal, design, tasks y spec.
- **Revision humana:** Pendiente de revision final por el usuario antes de implementar codigo de auth.
- **Correccion o rechazo:** Se corrigio la ubicacion de vault hacia `docs/obsidian-vault/` porque `cart/` es el Git root entregable.
- **Motivo tecnico:** La carpeta `vault/` a nivel workspace queda fuera del repositorio `cart/` y no seria parte de la entrega.
- **Prueba asociada:** Pendiente: pruebas de auth service, escalacion de rol y rutas RBAC.
- **Enlaces:** [[03 Evidencia/Evidencia - Identidad y RBAC]], `openspec/changes/add-identity-rbac`.

## AI-2026-08-03-03 - Catalogo publico y administracion de productos

- **Vertical / requisito:** FR-01, FR-06, FR-07, NFR-02, AI-03.
- **Herramienta o agente:** Codex con `$openspec-propose` y `$openspec-apply-change`.
- **Objetivo:** Crear e implementar la vertical de catalogo publico y administracion de productos.
- **Prompt resumido o enlace:** El usuario pidio continuar con "admin + catalog" despues de completar identidad/RBAC.
- **Salida recibida:** Cambio `openspec/changes/add-product-catalog-admin` con proposal, design, spec y tasks.
- **Revision humana:** Pendiente de revision final por el usuario despues de pruebas.
- **Correccion o rechazo:** Se mantiene fuera de alcance checkout, carrito, busqueda, filtros y hard delete.
- **Motivo tecnico:** El catalogo/admin es el prerequisito de datos para carrito y checkout, y debe aislar RBAC antes del flujo transaccional.
- **Prueba asociada:** Pendiente: products service, validacion y rutas RBAC.
- **Enlaces:** [[03 Evidencia/Evidencia - Catalogo y Admin]], `openspec/changes/add-product-catalog-admin`.
