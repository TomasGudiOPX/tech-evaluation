# Identity and RBAC Design

## Decision

Use email/password authentication with JWT access tokens and two roles: `customer` and `admin`.

Public registration always creates a `customer`. No public request body may set `role`, `isAdmin`, permissions, or any equivalent authorization field. The initial admin account is created only by a development seed controlled through environment variables.

Use the evaluation's suggested stack: Next.js, NestJS, PostgreSQL, and Prisma. The current Fastify/Vite template is only a starter shell; it is not the target architecture for this evaluation.

## Domain Ownership

```text
auth
  owns User, credentials, password hashing, JWT issuing, role checks

products
  trusts authenticated admin role for write operations

cart/orders
  trust authenticated user id for ownership boundaries
```

Controllers may depend on auth guards, but non-auth modules must not query auth persistence directly.

The identity slice exports the JWT and role guard contract. The products slice will attach those guards to administrator product write routes when product CRUD is implemented.

## Stack Justification

NestJS is selected because the evaluation explicitly suggests it and because its module, guard, pipe, and Swagger patterns make auth/RBAC boundaries visible to a reviewer. Prisma is selected because versioned migrations and explicit models are easier to audit than ad hoc `CREATE TABLE IF NOT EXISTS` statements once users, roles, carts, and orders are introduced.

## API Contract

- `POST /auth/register`: create customer account.
- `POST /auth/login`: validate credentials and return token.
- `GET /auth/profile`: return current authenticated user identity.
- Admin routes: require authenticated `admin`.

Expected failures use the shared error envelope:

```json
{ "code": "AUTH_INVALID_CREDENTIALS", "message": "Invalid credentials" }
```

Validation failures include `fieldErrors`. Authentication and authorization failures use stable error codes and expose no stack traces.

## Security Notes

- Passwords are hashed before persistence.
- JWT secret comes from environment configuration.
- Development admin credentials come from environment configuration.
- Missing admin seed configuration must not create a weak default admin.
- Route tests must prove customer tokens cannot access admin product writes.

## Traceability

This change covers `FR-03`, part of `FR-06`, `NFR-01`, `AI-01`, and `AI-03`.
