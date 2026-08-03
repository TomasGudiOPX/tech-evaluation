# Informe de uso de IA

Este informe se completa durante el desarrollo. No es una transcripcion completa; registra interacciones representativas, decisiones humanas y correcciones concretas.

## Herramientas usadas

- Codex: exploracion inicial, creacion de artefactos OpenSpec, bootstrap del vault y primera implementacion de identidad/RBAC.
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
- **Decision humana:** seguir el stack sugerido: Next.js, NestJS, PostgreSQL y Prisma.
- **Resultado:** README, ADR y OpenSpec documentan que el reemplazo del template es intencional.
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

## Correcciones o rechazos relevantes

- No se acepto que el request de registro pueda enviar `role` o `isAdmin`; el servicio debe crear siempre `customer`.
- No se acepto crear un admin por defecto si faltan variables de entorno.
- No se acepto conservar el acceso a datos con `CREATE TABLE IF NOT EXISTS` para usuarios; se introdujo Prisma con migracion versionada.
- No se acepto borrar productos fisicamente; se usa retiro logico para preservar trazabilidad y futuras ordenes.
- No se acepto agregar checkout sin `Idempotency-Key`; las reejecuciones deben ser seguras por usuario y clave.

## Estado

Catalogo/admin quedo verificado con Prisma generate, build de contracts/API, 17 tests de API y build general. Carrito/checkout/ordenes quedo verificado con Prisma generate, build de contracts/API, 29 tests de API, build web y build general. Pendiente reflexion final.

## Comandos de verificacion usados

```powershell
corepack yarn workspace @vps-template/api prisma:generate
corepack yarn workspace @vps-template/contracts build
corepack yarn workspace @vps-template/api build
corepack yarn workspace @vps-template/api test
corepack yarn workspace @vps-template/web build
corepack yarn build
```

En el entorno del agente, Vitest/Vite necesitaron ejecucion con permisos elevados porque la sandbox bloqueaba procesos auxiliares con `spawn EPERM`. No se cambio el codigo para ocultar ese problema; se verifico el mismo comando fuera de esa restriccion.
