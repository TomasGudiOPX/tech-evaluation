---
tags: [indice, proyecto, carrito]
source_docs:
  - docs/office-hours/traceable-modular-monolith-shopping-cart.md
  - evaluation.md
---

# Carrito de Compras - Vault

Base de conocimiento y trazabilidad para la evaluacion tecnica.

## Navegacion

- [[01 Requisitos/Mapa de Requisitos|Mapa de requisitos]]
- [[02 Arquitectura/Modulos de Dominio|Modulos de dominio]]
- [[03 Evidencia/Registro de Evidencia IA|Registro de evidencia IA]]
- [[03 Evidencia/Evidencia - Identidad y RBAC|Evidencia Identidad y RBAC]]
- [[03 Evidencia/Evidencia - Catalogo y Admin|Evidencia Catalogo y Admin]]
- [[03 Evidencia/Evidencia - Checkout y Ordenes|Evidencia Checkout y Ordenes]]
- [[03 Evidencia/Evidencia - QA Implementation|Evidencia QA Implementation]]
- [[03 Evidencia/Evidencia - Evaluacion Ampliada|Evidencia Evaluacion Ampliada]]
- [[03 Evidencia/Evidencia - Entrega Final|Evidencia Entrega Final]]
- [[04 Gestion/Registro de Decisiones|Registro de decisiones]]

## Principios

- Documentar durante el trabajo, no al final.
- Mantener un monolito modular: una web, una API y una base de datos.
- Registrar uso de IA, revision humana y correcciones concretas.
- Proteger identidad, stock y checkout con pruebas.
- Mantener entornos reproducibles: migrar antes de seed y separar staging/produccion por configuracion, no por perfiles Docker ficticios.
- Separar QA exploratoria/contractual de la implementacion principal cuando agrega evidencia nueva sin cambiar el alcance funcional.

## Flujo

1. Consultar el mapa antes de iniciar una vertical.
2. Registrar la cadena requisito -> spec -> decision -> IA -> revision -> test -> implementacion -> commit.
3. Cerrar una vertical solo con evidencia verificable.

Fuentes: `docs/office-hours/traceable-modular-monolith-shopping-cart.md` y `evaluation.md`.
