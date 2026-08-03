# Evaluación Técnica — Proyecto "Carrito de Compras"

**Nivel objetivo:** Training / Junior / Junior-Avanzado
**Tiempo estimado:** 3 a 5 días

---

## 1. Contexto del problema

Una tienda quiere lanzar una versión mínima de su e-commerce. Necesita un sistema donde los usuarios puedan:

- Ver un catálogo de productos.
- Agregar productos a un carrito.
- Registrarse/iniciar sesión.
- Confirmar una compra (checkout simulado, sin pasarela de pago real).
- Consultar el historial de sus pedidos.

Tu tarea es construir una aplicación **fullstack** que resuelva este problema, aplicando buenas prácticas de arquitectura, testing y, especialmente, **un uso documentado y crítico de herramientas de IA** durante todo el proceso de desarrollo.

No se evalúa solo si "funciona": se evalúa **cómo lo construiste** y **cómo usaste la IA como parte de tu flujo de trabajo**.

---

## 2. Stack tecnológico

- **Sugerido:** Next.js (frontend) + NestJS (backend). Podés usar otro stack si te sentís más cómodo (ej. Express, Fastify, React + Vite, etc.), siempre que sea Node.js/TypeScript y justifiques la elección en el README.
- **Base de datos:** a elección — PostgreSQL o MongoDB. Justificá brevemente por qué elegiste una sobre la otra para este caso de uso.
- **ORM/ODM:** libre (Prisma, TypeORM, Mongoose, etc.).

---

## 3. Requisitos funcionales

### Obligatorios (MVP — todos los niveles)
1. **Catálogo de productos**: listado con nombre, precio, imagen (puede ser URL) y stock. Vista de detalle de producto.
2. **Carrito de compras**: agregar, quitar y modificar cantidad de productos. Debe persistir mientras dura la sesión (no hace falta que sobreviva a un cierre de navegador si no usás Next.js con estado server-side, pero documentá tu decisión).
3. **Autenticación**: registro e inicio de sesión de usuarios (JWT o sesión, a elección).
4. **Checkout simulado**: al confirmar la compra, se crea una orden (no se integra pago real).
5. **Historial de pedidos**: el usuario autenticado puede ver sus compras anteriores.
6. **API REST documentada** (backend) con al menos los endpoints de: productos, carrito/orden, auth.
7. **Validación de inputs** y manejo de errores consistente (respuestas de error estructuradas, sin stack traces expuestos).

### Opcionales (suman para Junior-Avanzado)
- Búsqueda y filtros de productos (por nombre, categoría, precio).
- Paginación en el listado de productos.
- Roles (usuario / admin) con un panel simple para gestionar productos (CRUD).
- Tests automatizados (unitarios, de integración o e2e — con Jest, Vitest, Supertest, etc.).
- Dockerización del proyecto (docker-compose con app + base de datos).
- Rate limiting básico o alguna otra medida de seguridad adicional (ej. helmet, sanitización contra NoSQL/SQL injection).
- Uso de Server Components / SSR / ISR en Next.js con justificación de la elección.
- Un pipeline de CI simple (GitHub Actions) que corra lint y tests.

---

## 4. Requisitos no funcionales

- Código organizado en módulos/carpetas con responsabilidades claras.
- Variables sensibles (conexión a BD, JWT secret, etc.) fuera del código, vía `.env` (con un `.env.example` incluido).
- Manejo de errores centralizado (no `try/catch` desordenados repetidos en cada endpoint).
- Uso de linter/formatter (ESLint/Prettier) configurado.
- Commits de Git con mensajes descriptivos que reflejen el progreso real (no un único commit "proyecto completo").

---

## 5. Uso de IA — instrucciones explícitas (obligatorio, es el eje central de esta evaluación)

Vas a usar herramientas de IA (Claude, Codex, GitHub Copilot, Antigravity, o las que prefieras) como parte de tu flujo de trabajo. No se trata de "no usar IA para que se note que sabés" ni de "que la IA haga todo": se trata de que demuestres que sabés **dirigir, revisar y criticar** lo que la IA produce.

Debés generar un archivo aparte, **`INFORME_IA.md`**, documentando:

1. **Herramientas y agentes usados**: cuáles, para qué partes del proyecto (ej. "usé Claude Code para scaffolding del backend", "usé Copilot para autocompletar tests").
2. **Especificación previa (OpenSpec / SDD)**: si definiste specs o un documento de diseño antes de codificar (aunque sea simple), incluilo o referencialo. Si usaste la metodología OpenSpec formalmente (carpeta `openspec/`, `changes/`), decilo explícitamente.
3. **TDD**: si escribiste tests antes que el código en alguna parte del proyecto, indicá dónde y por qué ahí sí y en otras partes no.
4. **Prompts representativos**: no hace falta pegar todos, pero sí 4-6 prompts clave que muestren cómo le diste contexto a la IA y cómo iteraste (prompt inicial → ajuste → resultado final).
5. **Qué generó la IA vs. qué hiciste vos**: sé específico. Ej. "la IA generó el CRUD base de productos; yo reescribí la validación porque no contemplaba stock negativo".
6. **Casos donde corregiste o rechazaste algo que la IA propuso**: esto es lo más importante del informe. Un buen desarrollador no acepta código a ciegas.
7. **Reflexión final breve** (3-5 líneas): qué aprendiste sobre trabajar con estas herramientas en este proyecto.

**Importante:** este informe se va a leer con el mismo nivel de detalle que el código. Un informe vacío o genérico ("usé Claude para todo, anduvo bien") va a jugar en contra, sin importar qué tan bien funcione la app.

---

## 6. Entregables

1. Repositorio Git (link a GitHub o .zip) con historial de commits real.
2. `README.md` con:
   - Cómo levantar el proyecto (backend, frontend, base de datos).
   - Variables de entorno necesarias.
   - Decisiones técnicas relevantes (stack elegido, BD elegida, y por qué).
3. `INFORME_IA.md` (ver punto 5).
4. (Opcional) Capturas o video corto mostrando el uso de algún agente/skill de IA durante el desarrollo.

---

## 7. Instrucciones de entrega

- Plazo: **3 a 5 días** desde la recepción de este enunciado.
- Enviar el link del repositorio (o el .zip) junto con una breve nota indicando que está listo para revisión.
- Ante cualquier bloqueo o duda durante el desarrollo, documentarlo también en el README o el informe de IA — cómo lo resolviste (o no) también es parte de la evaluación.

---

## 8. Cómo se va a evaluar (resumen)

La evaluación pondera tres bloques: **Dominio técnico** (backend, frontend, base de datos, calidad de código), **Uso de IA y agentes** (OpenSpec, TDD, prompt engineering, juicio crítico, documentación) y **Metodología y buenas prácticas** (gestión del proyecto, documentación, arquitectura, seguridad, pruebas). El bloque de uso de IA tiene peso diferenciador: dos entregas con funcionalidad similar pueden clasificarse en niveles distintos según cómo se usó (y criticó) la IA durante el proceso.

La rúbrica completa la maneja el equipo evaluador; lo relevante para vos es que **documentar tu proceso de decisiones (técnicas y de uso de IA) es tan importante como el código final.**
