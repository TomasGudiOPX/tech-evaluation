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
- **Revision humana:** Aceptado. Ver [[03 Evidencia/Evidencia - Identidad y RBAC]].
- **Correccion o rechazo:** Se corrigio la ubicacion de vault hacia `docs/obsidian-vault/` porque `cart/` es el Git root entregable.
- **Motivo tecnico:** La carpeta `vault/` a nivel workspace queda fuera del repositorio `cart/` y no seria parte de la entrega.
- **Prueba asociada:** `auth.service.test.ts` y `roles.guard.test.ts` cubren registro, login, perfil y rutas RBAC.
- **Enlaces:** [[03 Evidencia/Evidencia - Identidad y RBAC]], `openspec/changes/add-identity-rbac`.

## AI-2026-08-03-02 - Decision de stack

- **Vertical / requisito:** NFR-01, AI-03.
- **Herramienta o agente:** Codex sobre `evaluation.md` y el template VPS existente.
- **Objetivo:** Decidir si adaptar el template (Vite/Fastify/raw pg) o seguir la sugerencia Next.js/NestJS.
- **Prompt resumido o enlace:** El usuario pidio justificar el stack antes de escribir codigo.
- **Salida recibida:** Decision documentada en README, ADR-001 y OpenSpec: NestJS + PostgreSQL + Prisma como backend; Vite + React mantenido para frontend por menor riesgo de migracion tardia.
- **Revision humana:** Aceptado.
- **Correccion o rechazo:** Se rechazo implementar auth sobre Fastify/raw pg porque desviaria el proyecto del stack elegido para la evaluacion.
- **Motivo tecnico:** NestJS/Prisma da modulos, migraciones y validacion que encajan con el enunciado mejor que un stack ad hoc.
- **Prueba asociada:** Cobertura derivada en `auth.service.test.ts`, `auth.repository.ts` y migraciones Prisma.
- **Enlaces:** [[04 Gestion/Registro de Decisiones#ADR-001 - Stack modular]], `INFORME_IA.md` (seccion AI-2026-08-03-02).
- **Commit asociado:** `d64c54c feat(auth): add identity RBAC baseline for FR-03 FR-06 AI-01`.

## AI-2026-08-03-03 - Catalogo publico y administracion de productos

- **Vertical / requisito:** FR-01, FR-06, NFR-02, AI-03.
- **Herramienta o agente:** Codex con `$openspec-propose` y `$openspec-apply-change`.
- **Objetivo:** Crear e implementar la vertical de catalogo publico y administracion de productos.
- **Prompt resumido o enlace:** El usuario pidio continuar con "admin + catalog" despues de completar identidad/RBAC.
- **Salida recibida:** Cambio `openspec/changes/add-product-catalog-admin` con proposal, design, spec y tasks. El commit historico menciona `FR-07` como duplicado de `FR-06`; el ID `FR-07` se reutilizo mas tarde para `add-admin-route` (ver Mapa de Requisitos, Historico de IDs).
- **Revision humana:** Aceptado. Ver [[03 Evidencia/Evidencia - Catalogo y Admin]].
- **Correccion o rechazo:** Se mantiene fuera de alcance checkout, carrito, busqueda, filtros y hard delete.
- **Motivo tecnico:** El catalogo/admin es el prerequisito de datos para carrito y checkout, y debe aislar RBAC antes del flujo transaccional.
- **Prueba asociada:** Products service, validacion y rutas RBAC (5 archivos, 17 tests en su cierre).
- **Enlaces:** [[03 Evidencia/Evidencia - Catalogo y Admin]], `openspec/changes/add-product-catalog-admin`.

## AI-2026-08-03-04 - Carrito checkout y ordenes

- **Vertical / requisito:** FR-02, FR-04, FR-05, FR-06, NFR-02, AI-02, AI-03.
- **Herramienta o agente:** Codex con `$openspec-propose` y `$openspec-apply-change`.
- **Objetivo:** Implementar carrito persistente, checkout simulado atomico, idempotencia y historial aislado.
- **Prompt resumido o enlace:** El usuario pidio continuar con la fase "cart + checkout + orders" despues de catalogo/admin.
- **Salida recibida:** Cambio `openspec/changes/add-cart-checkout-orders` y modulos NestJS `cart` y `orders`.
- **Revision humana:** Aceptado. Ver [[03 Evidencia/Evidencia - Checkout y Ordenes]].
- **Correccion o rechazo:** Se rechazo guest cart, pago real y reservas previas; se uso checkout transaccional con decremento condicional de stock.
- **Motivo tecnico:** El flujo evaluable necesita trazabilidad y consistencia antes que integraciones externas.
- **Prueba asociada:** Cart service, checkout repository/service, idempotencia, stock insuficiente, ultima unidad concurrente e historial por usuario (8 archivos, 29 tests en su cierre).
- **Enlaces:** [[03 Evidencia/Evidencia - Checkout y Ordenes]], `openspec/changes/add-cart-checkout-orders`.

## AI-2026-08-03-05 - Docs CI y polish final

- **Vertical / requisito:** FR-01..FR-07, NFR-01..NFR-03, AI-01, AI-02, AI-03.
- **Herramienta o agente:** Codex con `$openspec-explore`, `$openspec-propose` y `$openspec-apply-change`.
- **Objetivo:** Cerrar la entrega con UI retail, Swagger, CI, limpieza de starter code y documentacion consistente.
- **Prompt resumido o enlace:** El usuario pidio continuar con la fase "docs + CI + code polish", eligio mantener Vite + React y aclaro que `stitch_minimalist_retail_showcase` es referencia adaptativa, no fuente de verdad.
- **Salida recibida:** Cambio `openspec/changes/finalize-delivery-docs-ci-polish`, storefront Vite actualizado, Swagger en `/api/docs`, workflow `.github/workflows/ci.yml` y docs de entrega.
- **Revision humana:** Aceptado. Ver [[03 Evidencia/Evidencia - Entrega Final]].
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
- **Revision humana:** Aceptado. El usuario pidio agregar tambien la documentacion del vault antes del commit.
- **Correccion o rechazo:** No se documentaron perfiles `dev`, `qa` o `prod` inexistentes; se dejo el modelo real de entornos por configuracion y un perfil operativo `ops`.
- **Motivo tecnico:** Las migraciones deben ejecutarse antes del seed y sin depender del host `DATABASE_URL` contra el `db` interno de Compose.
- **Prueba asociada:** Compose config, build raiz, build Docker del target `api-tools`, build Docker runtime API, `/health`, `/api/products` y `/api/docs`.
- **Enlaces:** [[03 Evidencia/Evidencia - Entrega Final]], [[04 Gestion/Registro de Decisiones]].

## AI-2026-08-03-07 - QA implementation con skills locales

- **Vertical / requisito:** FR-02, FR-03, FR-04, FR-05, FR-06, FR-07, NFR-02, AI-03.
- **Herramienta o agente:** Codex usando las skills locales `qa-smoke`, `qa-backend-full-test` y `qa-front-playwright-test` desde `software-development-qa-skills`.
- **Objetivo:** Crear una rama separada `QA-Implementation` con evidencia QA reproducible y documentada.
- **Prompt resumido o enlace:** El usuario pidio continuar la implementacion QA y luego corrigio que debian usarse las skills locales de `C:\Users\tomas\OneDrive\Documents\workspace\tech-evaluation\software-development-qa-skills`.
- **Salida recibida:** Smoke Node sin dependencias, run contracts, matriz backend, analisis de gaps, planes manuales y resumenes de evidencia bajo `tests/`.
- **Revision humana:** El usuario autorizo commit y push al terminar el proceso QA.
- **Correccion o rechazo:** Se omitio TestSprite porque las skills locales lo limitan a solicitud explicita o artefactos previos en alcance. Se corrigio el `Content-Type` de checkout sin body antes de cerrar el smoke.
- **Motivo tecnico:** La evidencia QA queda separada de los tests unitarios y cubre el recorrido real que evaluaria un usuario: health, catalogo, auth, RBAC, carrito, checkout idempotente, carrito vacio e historial.
- **Prueba asociada:** `yarn workspace @vps-template/api test` OK: 8 archivos, 29 tests. `yarn node tests/qa-commerce-smoke.mjs` OK: 12 checks.
- **Enlaces:** [[03 Evidencia/Evidencia - QA Implementation]], `tests/qa-commerce-smoke.mjs`, commit `cf69941`. La rama se integro a `develop` via PR #1 (merge `9a3b15b`).

## AI-2026-08-03-08 - Cierre de gaps de evaluacion

- **Vertical / requisito:** FR-08, NFR-04, NFR-05, NFR-02, AI-03.
- **Herramienta o agente:** Codex con `$openspec-propose` y `$openspec-apply-change`.
- **Objetivo:** Cerrar los gaps mas objetivos del rubric: rate limit/headers, paginacion y ESLint/Prettier.
- **Prompt resumido o enlace:** El usuario pidio cerrar los gaps evaluables mas claros antes de declarar terminada la entrega.
- **Salida recibida:** Cambio `openspec/changes/close-evaluation-gaps` con `api-security` y `product-pagination`; ESLint flat config, `.prettierrc`, scripts raiz `lint:eslint`/`format:check`/`format:write` y pasos en CI.
- **Revision humana:** Aceptado. Ver [[03 Evidencia/Evidencia - Evaluacion Ampliada]].
- **Correccion o rechazo:** Se mantuvo `tsc --noEmit` existente; los nuevos checks no reemplazan tipo. La paginacion es opt-in (sin parametros = listado completo) para no romper consumidores.
- **Motivo tecnico:** Headers y rate limit protegen al API antes de cualquier auth-scoped throttle y son objetivos en el rubric; ESLint/Prettier normalizan estilo y cierran el punto 4 NFR.
- **Prueba asociada:** Tests de headers presentes y shape 429; tests de paginacion default/paged/invalido. Suite API OK: 8 archivos, 29 tests. `yarn lint:eslint` y `yarn format:check` OK.
- **Enlaces:** [[03 Evidencia/Evidencia - Evaluacion Ampliada]], `openspec/changes/close-evaluation-gaps`.
- **Commit asociado:** `08ad0bb feat: API security hardening, product pagination, and ESLint/Prettier tooling`; `7389013 chore(style): format codebase with Prettier`.

## AI-2026-08-03-09 - Modo oscuro persistente

- **Vertical / requisito:** UX-01, AI-03.
- **Herramienta o agente:** Codex con `$openspec-propose` y `$openspec-apply-change`.
- **Objetivo:** Anadir tema claro/oscuro con toggle, persistencia y default a `prefers-color-scheme` sin flash.
- **Prompt resumido o enlace:** El usuario pidio anadir modo oscuro como mejora de UX post-entrega.
- **Salida recibida:** Cambio `openspec/changes/add-dark-mode` con capability `theme-mode`: dark palette via `[data-theme='dark']`, `apps/web/src/hooks/useTheme.ts`, toggle en Header y AdminApp, inline script anti-flash en `index.html`.
- **Revision humana:** Aceptado.
- **Correccion o rechazo:** Se reemplazaron colores hardcoded (site-header backdrop, focus ring, surface `#f0e9dd`) por variables para mantener consistencia entre temas.
- **Motivo tecnico:** CSS variables ya en `:root` permitieron anadir el tema sin tocar runtime ni base de datos.
- **Prueba asociada:** `yarn workspace @vps-template/web lint` (tsc --noEmit) OK; verificacion Docker `/` y `/admin` 200 y manual del toggle.
- **Enlaces:** [[03 Evidencia/Evidencia - Evaluacion Ampliada]], `openspec/changes/add-dark-mode`.
- **Commit asociado:** `3d048e8 feat(web): add dark mode with persisted theme toggle`.

## AI-2026-08-03-10 - Ruta admin dedicada

- **Vertical / requisito:** FR-07, AI-03.
- **Herramienta o agente:** Codex con `$openspec-propose` y `$openspec-apply-change`.
- **Objetivo:** Convertir la consola admin en una ruta `/admin` deep-linkable en pestaña nueva, con formulario sticky.
- **Prompt resumido o enlace:** El usuario pidio separar la admin del SPA en su propia ruta.
- **Salida recibida:** Cambio `openspec/changes/add-admin-route` con capability `admin-panel`: boot check en `main.tsx`, `AdminApp.tsx`, fallback SPA via `apps/web/nginx.conf`, sticky form en `styles.css` (responsive a 960px) y header abriendo `/admin` en nueva pestaña.
- **Revision humana:** Aceptado.
- **Correccion o rechazo:** Se elimino el bloque `view === 'admin'` del storefront y `'admin'` del `View` union para no dejar codigos muertos.
- **Motivo tecnico:** La admin inline rompia deep-link, refresh y aislamiento visual; la ruta dedicada resuelve los tres con un fallback nginx barato.
- **Prueba asociada:** `yarn workspace @vps-template/web lint` OK; `/admin` hard-loads; no admin redirige a `/`; sticky OK ancho y estatico en movil.
- **Enlaces:** [[03 Evidencia/Evidencia - Evaluacion Ampliada]], `openspec/changes/add-admin-route`.
- **Commit asociado:** `c8fe5d0 feat(web): dedicated /admin route with sticky product form`.

## AI-2026-08-03-11 - Demo credential hints y volver al catalogo

- **Vertical / requisito:** FR-03, FR-06, AI-03.
- **Herramienta o agente:** Codex para fixUX de auth demo.
- **Objetivo:** Mostrar credenciales demo en login y volver al catalogo al cerrar sesion.
- **Prompt resumido o enlace:** El usuario pidio que el evaluador vea las credenciales demo y que logout no deje en pantalla admin.
- **Salida recibida:** Pista de credenciales demo en pantalla de login; logout en admin redirige o retorna al catalogo.
- **Revision humana:** Aceptado.
- **Correccion o rechazo:** Ninguna relevante; fix directo.
- **Motivo tecnico:** Reducir friccion del evaluador sin almacenar secretos; logout coherente con la nueva ruta `/admin`.
- **Prueba asociada:** Verificacion manual sobre stack Docker.
- **Enlaces:** [[03 Evidencia/Evidencia - Evaluacion Ampliada]].
- **Commit asociado:** `541680e fix(web): show demo credential hints and return to catalog on logout`.

## AI-2026-08-03-12 - Flujo de categorias de producto

- **Vertical / requisito:** FR-01, AI-03.
- **Herramienta o agente:** Codex para revision del flujo de categorias.
- **Objetivo:** Normalizar el manejo de categorias en admin y catalogo.
- **Prompt resumido o enlace:** El usuario pidio actualizar el flujo y UI de categorias de producto.
- **Salida recibida:** Ajustes en el flujo de categorias (admin + UI).
- **Revision humana:** Aceptado.
- **Correccion o rechazo:** Se reescribio una version intermedia por inconsistencia UI; el commit `5fd50de` quedo descartado y `7c3d86d` es la version final.
- **Motivo tecnico:** Mantener categorias consistente entre admin y catalogo sin nuevo openspec por ser ajuste de UI dentro del alcance ya implementado.
- **Prueba asociada:** Verificacion manual; suite API sin regresion (8 archivos, 29 tests).
- **Enlaces:** [[03 Evidencia/Evidencia - Catalogo y Admin]], [[03 Evidencia/Evidencia - Evaluacion Ampliada]].
- **Commit asociado:** `7c3d86d feat: update product categories flow and UI` (reemplaza a `5fd50de`).

## AI-2026-08-06-01 - Product reviews

- **Vertical / requisito:** FR-09, NFR-01, NFR-02, NFR-03, AI-03.
- **Herramienta o agente:** Codex con `$openspec-apply-change` y skills locales `proj-bot`/`proj-bot-shared`.
- **Objetivo:** Implementar resenas de productos con contrato compartido, modelo Prisma, API NestJS y evidencia.
- **Prompt resumido o enlace:** El usuario pidio aplicar `openspec/changes/add-product-reviews` con contexto de `.project-knowledge` y `docs`.
- **Salida recibida:** Contrato `@vps-template/contracts/reviews`, modelo `Review`, migracion versionada y modulo API `reviews`.
- **Revision humana:** La propuesta confirma que consumidor significa cliente autenticado; no verified-purchase.
- **Correccion o rechazo:** Se rechazo verified-purchase-only en este slice porque introduce reglas de elegibilidad por orden fuera del alcance.
- **Motivo tecnico:** Mantener reviews como modulo separado evita contaminar `Product` con contenido generado por usuarios y conserva el retiro logico del catalogo.
- **Prueba asociada:** Prisma validate OK; Prisma generate `--no-engine` OK por bloqueo `EPERM` del DLL de engine; contracts build OK; API build OK; API tests OK: 11 archivos, 42 tests; build raiz OK.
- **Enlaces:** [[03 Evidencia/Evidencia - Product Reviews]], `openspec/changes/add-product-reviews`.
