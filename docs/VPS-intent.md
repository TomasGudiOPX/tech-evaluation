# VPS Intent

## Who This Is For

This document is for clients, operators, and non-developers who need to understand why a small project might run on a VPS instead of separate hosted services.

It is not a technical deployment guide. It explains the business reason, the tradeoffs, and the habits that make this setup work well.

## The Simple Idea

A VPS is a rented computer on the internet.

Instead of paying one company for the frontend, another for the backend, another for the database, another for logs, and another for background tasks, a small project can run its main pieces on one controlled server.

For many early client projects, this is enough:

- The website or app runs there.
- The API runs there.
- The database lives there.
- Backups are created from there.
- The domain points to it.

The goal is not to avoid every external service forever. The goal is to start with a setup that is understandable, affordable, and easy to hand over.

## Why Use a VPS

### Predictable Cost

Managed platforms are convenient, but small costs can multiply:

- Frontend hosting.
- Backend hosting.
- Database hosting.
- Extra environments.
- Usage-based bandwidth.
- Logs and monitoring.
- Background workers.
- File storage.
- Team seats.

Each service may look cheap by itself. Together, they can become expensive before the project has enough users or revenue to justify the bill.

A VPS gives the project one main monthly infrastructure cost. That makes planning easier for small clients.

### One Place to Understand

With one VPS, the project has one main home.

That makes it easier to answer basic questions:

- Where is the app running?
- Where is the data?
- Where are the logs?
- What needs to be backed up?
- What do we restart if something breaks?
- What has to be moved if the client changes providers?

This matters because many small projects fail operationally before they fail technically. The setup becomes too spread out, too expensive, or too hard for the client to understand.

### Faster Client Projects

A reusable VPS template lets a new client project start from a known base:

- Frontend ready.
- Backend ready.
- Database ready.
- Reverse proxy ready.
- Environment file ready.
- Basic health check ready.
- Optional MCP integration ready.

That means less time rebuilding the same foundation and more time building the actual client workflow.

### Better Ownership

A VPS keeps the project close to standard tools:

- Linux server.
- Docker containers.
- PostgreSQL database.
- Domain and TLS proxy.
- Normal backups.

These are portable. If the client later needs to move to a bigger provider, the project is not trapped inside a highly specific hosting platform.

## What We Give Up

A VPS is not magic. It reduces platform cost, but it adds operational responsibility.

The team must care about:

- Security updates.
- Backups.
- Disk space.
- Server monitoring.
- Database recovery.
- Firewall rules.
- Secrets and passwords.
- Occasional manual maintenance.

Managed platforms handle more of this automatically. A VPS keeps the bill simpler, but the owner must be disciplined.

## When a VPS Is a Good Fit

A VPS is a strong fit for:

- Internal tools.
- Small dashboards.
- Client portals.
- CRM-style apps.
- Admin panels.
- Booking or scheduling tools.
- Small ecommerce helpers.
- Project management tools.
- Data-entry workflows.
- Early product prototypes.

These projects usually need a frontend, an API, a database, authentication, and a few integrations. They do not always need a large cloud architecture from day one.

## When Not to Use a VPS

A VPS may not be the best first choice when the project needs:

- Very high traffic from day one.
- Global low-latency delivery.
- Complex autoscaling.
- Heavy video processing.
- Large file storage.
- Strict enterprise compliance.
- A full operations team.
- Many separate environments.
- Zero-maintenance infrastructure.

In those cases, managed services may be worth the extra cost.

The important point is not that VPS is always better. The point is that a VPS is often enough for the first serious version of a small client project.

## How to Make the Most of a VPS

### Keep the Stack Small

Every new service adds cost and maintenance.

Start with:

- Frontend.
- Backend.
- Database.
- Proxy.

Add Redis, workers, object storage, search, or queues only when the product clearly needs them.

### Use One Public Entry Point

The outside world should normally reach only the public website address.

The database and backend should not be opened directly to the internet. They should talk privately inside the server setup.

This keeps the surface area smaller and easier to reason about.

### Make Backups a First-Class Requirement

The database is usually the most valuable part of the project.

A VPS setup should always answer:

- How often is the database backed up?
- Where are backups stored?
- Who can access them?
- Has a restore been tested?
- What happens if the VPS provider has an outage?

A backup that has never been restored is only a hope.

### Keep Each Client Isolated

Each client project should have its own:

- Project folder.
- Environment file.
- Database name.
- Database user.
- Passwords.
- Domain.
- Backup routine.

This reduces the chance that one client's change affects another client.

### Budget for Maintenance

A low server bill does not mean zero maintenance.

Someone still needs to:

- Apply updates.
- Check logs.
- Watch disk usage.
- Verify backups.
- Renew or verify domain and TLS settings.
- Review access when people leave a team.

This work can be light, but it should be planned.

### Keep the App Portable

The project should avoid unnecessary lock-in.

Good habits:

- Store app config in environment variables.
- Keep the database in PostgreSQL.
- Use Docker so the app runs the same way in different places.
- Keep deployment notes in plain documents.
- Avoid features that only work on one provider unless there is a clear reason.

Portability gives the client options later.

## How to Explain This to a Client

Use this short version:

> We are using one rented server to run the app, API, and database together. This keeps the monthly cost predictable and makes the system easier to understand while the project is small. It is not the biggest possible architecture, but it is a practical one. If the product grows enough to need more scale or specialized services, we can move parts out later.

The client should understand that this choice is about starting responsibly, not cutting corners.

## The Main Rule

Use a VPS to keep small projects simple, affordable, and portable.

Do not overload it with complexity that belongs to a later stage of the product.

Do not ignore the operational basics that protect the client's data.
