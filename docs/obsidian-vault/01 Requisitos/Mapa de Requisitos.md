---
tags: [requisitos, indice]
---

# Mapa de Requisitos

| ID | Requisito | Evidencia o contexto |
| --- | --- | --- |
| FR-01 | Catalogo y detalle con precio, imagen y stock | [[03 Evidencia/Evidencia - Catalogo y Admin]] |
| FR-02 | Carrito persistente del usuario autenticado | [[03 Evidencia/Evidencia - Checkout y Ordenes]] |
| FR-03 | Registro, login y roles | [[03 Evidencia/Evidencia - Identidad y RBAC]] |
| FR-04 | Checkout simulado atomico | [[03 Evidencia/Evidencia - Checkout y Ordenes]] |
| FR-05 | Historial aislado por usuario | [[03 Evidencia/Evidencia - Checkout y Ordenes]] |
| FR-06 | Admin CRUD con retiro logico de productos | [[03 Evidencia/Evidencia - Catalogo y Admin]] |
| FR-07 | Ruta web `/admin` dedicada, deep-linkable y sticky | [[03 Evidencia/Evidencia - Evaluacion Ampliada]] |
| FR-08 | Paginacion del listado de productos | [[03 Evidencia/Evidencia - Evaluacion Ampliada]] |
| FR-09 | Resenas de productos por clientes autenticados | [[03 Evidencia/Evidencia - Product Reviews]] |
| NFR-01 | Modulos, secretos por entorno, migraciones | [[01 Requisitos/Requisitos de Calidad]] |
| NFR-02 | Pruebas, lint, formato, Compose y CI | [[01 Requisitos/Requisitos de Calidad#NFR-02 - Calidad y entrega]] |
| NFR-03 | API REST y errores consistentes | [[01 Requisitos/Requisitos de Calidad#NFR-03 - API y errores]] |
| NFR-04 | Seguridad API: Helmet y rate limit 429 | [[01 Requisitos/Requisitos de Calidad#NFR-04 - Seguridad API]] |
| NFR-05 | ESLint y Prettier en CI | [[01 Requisitos/Requisitos de Calidad#NFR-05 - Lint y formato]] |
| UX-01 | Modo claro/oscuro persistente y default OS | [[03 Evidencia/Evidencia - Evaluacion Ampliada]] |
| AI-01 | OpenSpec antes de codigo | [[03 Evidencia/Plantilla de Evidencia]] |
| AI-02 | TDD documentado | [[03 Evidencia/Evidencia - Checkout y Ordenes]] |
| AI-03 | Prompts, herramientas, revision y rechazos | [[03 Evidencia/Registro de Evidencia IA]] |

Los IDs deben aparecer en OpenSpec, notas de evidencia, pruebas y commits descriptivos.

## Historico de IDs

La version previa del mapa duplicaba `FR-07` con el alcance de `FR-06` (admin CRUD). `FR-07` se reutiliza ahora para la ruta `/admin` dedicada introducida por `openspec/changes/add-admin-route`, y el CRUD admin queda unico bajo `FR-06`.
