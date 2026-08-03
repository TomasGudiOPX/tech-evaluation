# Informe de uso de IA

Este informe se completa durante el desarrollo. No es una transcripcion completa; registra interacciones representativas, decisiones humanas y correcciones concretas.

## Herramientas usadas

- Codex: exploracion inicial, artefactos OpenSpec, implementacion de verticales, polish UI, Swagger, CI y documentacion de evidencia.
- Corepack/Yarn: instalacion reproducible de workspaces y ejecucion de Prisma, tests y builds.
- Prisma: generacion de cliente y migraciones versionadas para usuarios, productos, carrito y ordenes.

## Especificacion previa

- `openspec/changes/add-identity-rbac`: primera especificacion antes de codigo para registro, login, perfil autenticado, RBAC y seed admin.
- `docs/obsidian-vault/`: vault de trazabilidad con mapa de requisitos, decisiones y evidencia por vertical.

## Prompts representativos

### AI-2026-08-03-01 - Especificacion inicial de identidad y RBAC

- **Contexto:** `evaluation.md`, diseño aprobado en `docs/office-hours/traceable-modular-monolith-shopping-cart.md`, y vault inicial.
- **Objetivo:** crear el primer cambio OpenSpec antes de implementar codigo.
- **Resultado:** se creo `openspec/changes/add-identity-rbac` y la evidencia inicial.
- **Revision/correccion humana:** se detecto que el vault inicial estaba fuera del Git root entregable; se corrigio a `docs/obsidian-vault/`.
- **Commit asociado:** `d64c54c feat(auth): add identity RBAC baseline for FR-03 FR-06 AI-01`.

### AI-2026-08-03-02 - Decision de stack

- **Contexto:** el repositorio partia de Vite/Fastify/raw pg, pero `evaluation.md` sugiere Next.js/NestJS y permite otro stack solo con justificacion.
- **Objetivo:** decidir si adaptar el template o seguir la consigna sugerida.
- **Decision humana:** usar NestJS, PostgreSQL y Prisma, y despues mantener Vite + React para la entrega final por menor riesgo de migracion tardia.
- **Resultado:** README, ADR y OpenSpec documentan que Vite + React es la base frontend final y NestJS/Prisma la base backend.
- **Correccion/rechazo:** se rechazo implementar auth sobre Fastify/raw pg porque desviaria el proyecto del stack elegido para la evaluacion.
- **Commit asociado:** `d64c54c feat(auth): add identity RBAC baseline for FR-03 FR-06 AI-01`.

### AI-2026-08-03-03 - Catalogo publico y administracion de productos

- **Contexto:** identidad/RBAC ya tiene guard contracts; `evaluation.md` exige catalogo, detalle y roles/admin como alcance evaluable.
- **Objetivo:** especificar e implementar productos activos publicos y administracion protegida.
- **Decision humana:** separar catalogo/admin de carrito/checkout para mantener una vertical verificable y trazable.
- **Resultado:** `openspec/changes/add-product-catalog-admin` define e implementa catalogo, detalle, create/update/retire y seed deterministico.
- **Correccion/rechazo:** se excluyeron hard delete, uploads, filtros y checkout para proteger el alcance del slice.
- **Verificacion:** `prisma:generate`, build de contracts, build de API, 17 tests de API, build de web y build general.
- **Commit asociado:** `8ed12d2 feat(products): add catalog admin for FR-01 FR-07 FR-06`.

### AI-2026-08-03-04 - Carrito, checkout y ordenes

- **Contexto:** identidad/RBAC y catalogo/admin ya estaban completos; el diseño aprobado exige carrito persistente, checkout atomico, idempotencia e historial.
- **Objetivo:** implementar la siguiente vertical `add-cart-checkout-orders` con pruebas como evidencia de `AI-02`.
- **Decision humana:** mantener carrito solo para usuarios autenticados y checkout simulado, sin pagos reales ni guest-cart merge.
- **Resultado:** contratos compartidos para carrito/ordenes, modelos Prisma, migracion versionada, modulos NestJS `cart` y `orders`, y pruebas de checkout.
- **Correccion/rechazo:** se rechazo guardar pagos externos o reservas previas; la consistencia se concentra en una transaccion con decremento condicional de stock.
- **Verificacion:** `prisma:generate` OK; contracts build OK; API build OK; API test OK: 8 archivos, 29 tests; web build OK; build general OK.
- **Commit asociado:** `feat(orders): add cart checkout orders for FR-02 FR-04 FR-05 AI-02`.

### AI-2026-08-03-05 - Docs CI y polish final

- **Contexto:** las verticales identidad/RBAC, catalogo/admin y carrito/checkout/ordenes ya estaban implementadas y verificadas.
- **Objetivo:** cerrar la entrega con UI retail, Swagger, CI, limpieza de codigo starter y documentacion consistente.
- **Decision humana:** mantener Vite + React en vez de migrar a Next.js; usar `stitch_minimalist_retail_showcase` como referencia visual adaptativa, no como fuente de verdad.
- **Resultado:** storefront product-facing con catalogo, detalle, auth, carrito, checkout, ordenes y admin; Swagger en `/api/docs`; workflow GitHub Actions; docs y vault actualizados.
- **Correccion/rechazo:** se rechazo copiar Aura Commerce literalmente y se eliminaron referencias/codigo starter de `projects`.
- **Verificacion:** lint OK; contracts build OK; Prisma generate OK con warning no bloqueante de configuracion Prisma 7; API build OK; API tests OK: 8 archivos, 29 tests; web build OK; build raiz OK; Compose config OK.
- **Commit asociado:** commit `feat(delivery): finalize docs ci ui polish`.

### AI-2026-08-03-06 - Arranque Docker y documentacion operativa

- **Contexto:** al intentar levantar la aplicacion desde cero se detecto que Docker Compose construia las apps sin compilar antes `packages/contracts`, que el runtime API necesitaba `@fastify/static` para Swagger/Fastify, y que las guias no aplicaban migraciones antes del seed.
- **Objetivo:** dejar un proceso reproducible para desarrollo local, Docker local, staging y produccion.
- **Decision humana:** documentar que no existen perfiles Docker `dev`, `qa` o `prod`; los entornos se separan por `.env`, checkout, branch, `COMPOSE_PROJECT_NAME`, puertos, base de datos, credenciales y dominio. Se agrego solo el perfil Compose `ops` para tareas de migracion y seed.
- **Resultado:** Dockerfile API con target `api-tools`, Compose con servicios `migrate` y `seed` bajo perfil `ops`, Postgres en loopback configurable, README y guias operativas actualizadas.
- **Correccion/rechazo:** se rechazo presentar `docker compose up` + `yarn seed` como suficiente porque no aplica migraciones y no conecta limpiamente contra el `db` interno de Compose.
- **Verificacion:** Docker health OK, catalogo seed OK, Swagger OK y build raiz OK despues de corregir arranque/runtime.

### AI-2026-08-03-07 - QA implementation branch y habilidades QA locales

- **Contexto:** la entrega ya tenia pruebas backend y arranque Docker verificado, pero faltaba una rama separada de QA con artefactos explicitos producidos desde el directorio local `software-development-qa-skills`.
- **Objetivo:** crear una rama `QA-Implementation`, aplicar las habilidades locales de QA relevantes y dejar evidencia ejecutable/revisable del smoke y de los planes de prueba.
- **Decision humana:** usar `qa-smoke`, `qa-backend-full-test` y `qa-front-playwright-test` como guias; no usar TestSprite porque las skills locales indican hacerlo solo si se solicita explicitamente o si ya existen artefactos TestSprite en alcance.
- **Resultado:** se agrego `tests/qa-commerce-smoke.mjs` y documentacion QA en `tests/casos-de-prueba-backend/cart-checkout-orders/` y `tests/casos-de-prueba/cart-checkout-orders/`.
- **Correccion/rechazo:** durante el smoke se detecto que el cliente web enviaba `Content-Type: application/json` en un checkout sin body; eso provocaba `400` en Fastify. Se corrigio para setear JSON solo cuando existe `options.body`.
- **Motivo tecnico:** la QA separada preserva trazabilidad de lo probado, evita mezclar evidencia manual con pruebas unitarias y cubre el flujo evaluador real: health, catalogo, auth, RBAC, carrito, checkout idempotente, carrito vacio e historial.
- **Verificacion:** API tests OK: 8 archivos, 29 tests; smoke QA OK: 12 checks contra `http://127.0.0.1:18080`.
- **Commit asociado:** `cf69941 Add QA implementation artifacts` en `QA-Implementation`.

## Correcciones o rechazos relevantes

- No se acepto que el request de registro pueda enviar `role` o `isAdmin`; el servicio debe crear siempre `customer`.
- No se acepto crear un admin por defecto si faltan variables de entorno.
- No se acepto conservar el acceso a datos con `CREATE TABLE IF NOT EXISTS` para usuarios; se introdujo Prisma con migracion versionada.
- No se acepto borrar productos fisicamente; se usa retiro logico para preservar trazabilidad y futuras ordenes.
- No se acepto agregar checkout sin `Idempotency-Key`; las reejecuciones deben ser seguras por usuario y clave.
- No se acepto tratar el Stitch showcase como contenido canonico; solo guia UI/UX.
- No se acepto migrar a Next.js al final porque no aporta al alcance verificado y aumenta riesgo.
- No se acepto documentar perfiles Docker `dev`, `qa` o `prod` que no existen; el modelo real usa entornos por configuracion y un perfil operativo `ops` para migraciones/seed.
- No se acepto usar TestSprite como sustituto de Playwright/smoke normal porque las skills locales lo reservan para una solicitud explicita o artefactos TestSprite existentes.

## Estado

Catalogo/admin quedo verificado con Prisma generate, build de contracts/API, 17 tests de API y build general. Carrito/checkout/ordenes quedo verificado con Prisma generate, build de contracts/API, 29 tests de API, build web y build general. Docs/CI/polish quedo verificado con lint, builds, tests y Compose config. El arranque Docker local quedo verificado con `migrate`, `seed`, `up`, `/health`, `/api/products` y `/api/docs`. La rama `QA-Implementation` agrega evidencia QA separada, planes de prueba y un smoke ejecutable; quedo publicada en `origin/QA-Implementation`.

## Comandos de verificacion usados

```powershell
corepack yarn workspace @vps-template/api prisma:generate
corepack yarn lint
corepack yarn workspace @vps-template/contracts build
corepack yarn workspace @vps-template/api build
corepack yarn workspace @vps-template/api test
corepack yarn workspace @vps-template/web build
corepack yarn build
docker compose --env-file .env.example config
docker compose --env-file .env --profile ops run --rm --build migrate
docker compose --env-file .env --profile ops run --rm seed
docker compose --env-file .env up -d --build
yarn node tests/qa-commerce-smoke.mjs
```

En el entorno del agente, Vitest/Vite necesitaron ejecucion con permisos elevados porque la sandbox bloqueaba procesos auxiliares con `spawn EPERM`. No se cambio el codigo para ocultar ese problema; se verifico el mismo comando fuera de esa restriccion.
