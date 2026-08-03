# Environments

## Default Model

| Environment | Git branch | Location | Purpose |
| --- | --- | --- | --- |
| Development | `feature/*` or local `develop` | Developer machine | Fast implementation and tests |
| Staging | `develop` | VPS | Shared integration and review |
| Production | `main` | VPS | Live application |

Do not create a VPS frontend/backend pair for every developer. The repository already contains both applications; each VPS environment runs one complete Compose project from a separate checkout or worktree.

## GitHub Workflow

1. Create `feature/<short-name>` from `develop`.
2. Open a GitHub pull request from the feature branch into `develop`.
3. Require CI to pass before merge.
4. Deploy `develop` to staging.
5. Test staging, then open a pull request from `develop` into `main`.
6. Deploy `main` to production after review.
7. For an urgent production fix, branch `hotfix/<short-name>` from `main`, merge it into `main`, then merge or back-port the fix to `develop`.

Protect `main` with pull requests and successful checks. Protect `develop` with pull requests when more than one developer works on the project.

## VPS Checkouts

Use two directories or Git worktrees:

```text
/srv/shopping-cart/
  production/   # tracks origin/main
  staging/      # tracks origin/develop
```

Clone them once with the repository URL:

```powershell
git clone --branch main <repository-url> /srv/shopping-cart/production
git clone --branch develop <repository-url> /srv/shopping-cart/staging
```

Create a distinct `.env` in each directory. Example values:

```dotenv
# production/.env
COMPOSE_PROJECT_NAME=shopping-cart-production
HTTP_BIND_ADDRESS=127.0.0.1
HTTP_PORT=18080
POSTGRES_DB=shopping_cart_production
POSTGRES_USER=shopping_cart_production
POSTGRES_PASSWORD=<unique-secret>

# staging/.env
COMPOSE_PROJECT_NAME=shopping-cart-staging
HTTP_BIND_ADDRESS=127.0.0.1
HTTP_PORT=18081
POSTGRES_DB=shopping_cart_staging
POSTGRES_USER=shopping_cart_staging
POSTGRES_PASSWORD=<different-unique-secret>
```

## Domain Routing

Configure the host TLS proxy once:

```caddy
app.example.com {
  reverse_proxy 127.0.0.1:18080
}

staging.example.com {
  reverse_proxy 127.0.0.1:18081
}
```

The application ports are loopback-only. The firewall exposes SSH and HTTP/HTTPS, not the application ports, PostgreSQL, or the API directly.

## Deploying

Run inside the target directory:

```powershell
git fetch origin
git pull --ff-only origin <branch>
docker compose --env-file .env up -d --build
docker compose ps
docker compose logs --tail 100 api
yarn workspace @vps-template/api seed
```

Verify the final domain, `https://<domain>/health`, `https://<domain>/api/docs`, and the core shopping workflow. Record the deployed commit with `git rev-parse HEAD` in the release note or deployment record.

## Rollback

If a deployment fails, identify the last known good commit, check it out in the affected environment, and rebuild that environment only:

```powershell
git log --oneline -n 10
git checkout <known-good-commit>
docker compose --env-file .env up -d --build
```

After recovery, create a corrective branch and pull request. Do not leave production permanently detached from a documented commit or branch.

## Temporary Previews

Create an additional environment only when review needs it. It requires a unique branch, checkout, `COMPOSE_PROJECT_NAME`, loopback port, database, credentials, subdomain, backup decision, and removal date.
