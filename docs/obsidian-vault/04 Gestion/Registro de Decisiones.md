---
tags: [adr, decisiones]
---

# Registro de Decisiones

## ADR-001 - Stack modular

**Aprobado.** Next.js, NestJS, PostgreSQL y Prisma hacen visible la separacion por dominios sin costo de microservicios. Aunque el repositorio parte de una plantilla Vite/Fastify, se reemplaza esa base porque `evaluation.md` sugiere Next.js/NestJS y solo permite otro stack con justificacion explicita.

## ADR-002 - Carrito autenticado persistente

**Aprobado.** Evita guest-cart merge y conserva un flujo pequeno y auditable.

## ADR-003 - Registro sin eleccion de rol

**Aprobado.** Registro publico crea customer; seed por entorno crea admin. Ver [[03 Evidencia/Evidencia - Identidad y RBAC]].
