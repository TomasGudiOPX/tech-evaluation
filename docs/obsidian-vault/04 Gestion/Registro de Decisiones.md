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
