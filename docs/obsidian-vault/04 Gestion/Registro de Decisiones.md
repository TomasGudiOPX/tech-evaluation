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

Se usaron las skills locales `qa-smoke`, `qa-backend-full-test` y `qa-front-playwright-test` como guias. Se rechazo TestSprite porque las instrucciones locales lo reservan para pedido explicito o evidencia TestSprite existente.
