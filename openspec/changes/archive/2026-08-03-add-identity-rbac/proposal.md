# Add Identity and Role-Based Access

## Why

The shopping-cart evaluation requires registration, login, user-specific workflows, and optional administrator capabilities. Identity and RBAC should be specified before code because later cart, order history, checkout, and admin product management depend on a stable user and authorization model.

The evaluation suggests Next.js and NestJS, while allowing another Node.js/TypeScript stack only with README justification. This project chooses the suggested stack and replaces the starter Fastify/Vite template intentionally so the final submission aligns with the evaluator's expected framework shape while still documenting the tradeoff.

## What Changes

- Add public customer registration.
- Add login that returns an authenticated session token.
- Add an authenticated profile endpoint.
- Add role-based access with `customer` and `admin` roles.
- Prevent public requests from choosing or escalating roles.
- Add an environment-controlled development admin seed.
- Standardize auth and authorization error responses.
- Replace the starter API foundation with NestJS and Prisma where required for this slice.

## Non-Goals

- OAuth or third-party login.
- Password reset and email verification.
- Multi-tenant roles or permissions.
- Self-service admin creation.
- Guest-cart merge behavior.

## Impact

- Creates the security foundation for cart persistence, order ownership, checkout, and admin product management.
- Defines test expectations for auth service behavior and protected routes.
- Updates the evidence chain for `FR-03`, `FR-06`, `AI-01`, and `AI-03`.
