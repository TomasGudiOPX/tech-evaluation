# Backend Manual and Infrastructure Test Plan

| ID | Risk | Scenario | Why not automated here | Prerequisites | Status |
|---|---|---|---|---|---|
| B-MAN-01 | Migration drift | Apply all Prisma migrations to a disposable PostgreSQL database, restart API, and verify `/health` reports `database=connected`. | No committed migration-test harness. | Docker and disposable database. | MANUAL EXECUTED |
| B-MAN-02 | Stock race | Submit concurrent checkouts for the last available stock and verify no negative stock or duplicate allocation. | No stress/concurrency runner in repo. | Disposable database and parallel request runner. | DEFERRED |
| B-MAN-03 | Production parity | Run migrations, seed, proxy, API, and web from the target deployment checkout and repeat the critical smoke. | Local QA Compose is not staging/production. | Staging deployment approval. | DEFERRED |
