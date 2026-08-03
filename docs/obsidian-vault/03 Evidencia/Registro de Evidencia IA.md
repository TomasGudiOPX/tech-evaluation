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

## AI-2026-08-03-04 - Carrito checkout y ordenes

- **Vertical / requisito:** FR-02, FR-04, FR-05, FR-06, NFR-02, AI-02, AI-03.
- **Herramienta o agente:** Codex con `$openspec-propose` y `$openspec-apply-change`.
- **Objetivo:** Implementar carrito persistente, checkout simulado atomico, idempotencia y historial aislado.
- **Prompt resumido o enlace:** El usuario pidio continuar con la fase "cart + checkout + orders" despues de catalogo/admin.
- **Salida recibida:** Cambio `openspec/changes/add-cart-checkout-orders` y modulos NestJS `cart` y `orders`.
- **Revision humana:** Pendiente de revision final por el usuario despues de pruebas.
- **Correccion o rechazo:** Se rechazo guest cart, pago real y reservas previas; se uso checkout transaccional con decremento condicional de stock.
- **Motivo tecnico:** El flujo evaluable necesita trazabilidad y consistencia antes que integraciones externas.
- **Prueba asociada:** Cart service, checkout repository/service, idempotencia, stock insuficiente, ultima unidad concurrente e historial por usuario.
- **Enlaces:** [[03 Evidencia/Evidencia - Checkout y Ordenes]], `openspec/changes/add-cart-checkout-orders`.

## AI-2026-08-03-05 - Docs CI y polish final

- **Vertical / requisito:** FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07, NFR-01, NFR-02, NFR-03, AI-01, AI-02, AI-03.
- **Herramienta o agente:** Codex con `$openspec-explore`, `$openspec-propose` y `$openspec-apply-change`.
- **Objetivo:** Cerrar la entrega con UI retail, Swagger, CI, limpieza de starter code y documentacion consistente.
- **Prompt resumido o enlace:** El usuario pidio continuar con la fase "docs + CI + code polish", eligio mantener Vite + React y aclaro que `stitch_minimalist_retail_showcase` es referencia adaptativa, no fuente de verdad.
- **Salida recibida:** Cambio `openspec/changes/finalize-delivery-docs-ci-polish`, storefront Vite actualizado, Swagger en `/api/docs`, workflow `.github/workflows/ci.yml` y docs de entrega.
- **Revision humana:** Pendiente de revision final por el usuario despues de pruebas.
- **Correccion o rechazo:** Se rechazo copiar Aura Commerce literalmente; se adapto la direccion visual al dominio real del proyecto.
- **Motivo tecnico:** Migrar a Next.js en esta fase aumentaria riesgo sin mejorar los requisitos ya implementados.
- **Prueba asociada:** Lint, builds de contratos/API/web, Prisma generate, tests API, build raiz y validacion Compose.
- **Enlaces:** [[03 Evidencia/Evidencia - Entrega Final]], `openspec/changes/finalize-delivery-docs-ci-polish`.

## AI-2026-08-03-06 - Arranque Docker y documentacion operativa

- **Vertical / requisito:** NFR-01, NFR-02, AI-03.
- **Herramienta o agente:** Codex con revision de Compose, Dockerfiles, README, guias VPS y ejecucion local Docker.
- **Objetivo:** Corregir el proceso reproducible de arranque para Docker local, staging y produccion.
- **Prompt resumido o enlace:** El usuario pidio revisar perfiles Docker y documentacion de arranque, luego actualizar README, INFORME_IA y docs.
- **Salida recibida:** `docker-compose.yml` con perfil `ops` para `migrate`/`seed`, Dockerfile API con target `api-tools`, `.env.example` con Postgres loopback configurable y guias actualizadas.
- **Revision humana:** El usuario pidio agregar tambien la documentacion del vault antes del commit.
- **Correccion o rechazo:** No se documentaron perfiles `dev`, `qa` o `prod` inexistentes; se dejo el modelo real de entornos por configuracion y un perfil operativo `ops`.
- **Motivo tecnico:** Las migraciones deben ejecutarse antes del seed y sin depender del host `DATABASE_URL` contra el `db` interno de Compose.
- **Prueba asociada:** Compose config, build raiz, build Docker del target `api-tools`, build Docker runtime API, `/health`, `/api/products` y `/api/docs`.
- **Enlaces:** [[03 Evidencia/Evidencia - Entrega Final]], [[04 Gestion/Registro de Decisiones]].
