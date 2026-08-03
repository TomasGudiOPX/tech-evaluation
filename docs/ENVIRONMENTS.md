# Bitbucket Environments

## Default Model

Use three environments:

| Environment | Git branch                             | Location          | Purpose                              |
| ----------- | -------------------------------------- | ----------------- | ------------------------------------ |
| Development | `feature/*` or local work on `develop` | Developer machine | Fast implementation and tests        |
| Staging     | `develop`                              | VPS               | Shared integration and client review |
| Production  | `main`                                 | VPS               | Live client application              |

Do not create a VPS frontend/backend pair for every developer. The repository already contains both applications; each VPS environment runs its own complete Compose project from a separate checkout.

## Bitbucket Workflow

1. Create `feature/<short-name>` from `develop`.
2. Open a Bitbucket pull request from the feature branch into `develop`.
3. After review and merge, deploy `develop` to staging.
4. Test staging, then open a pull request from `develop` into `main`.
5. After review and merge, deploy `main` to production.
6. For an urgent production fix, branch `hotfix/<short-name>` from `main`, merge it into `main`, then merge or back-port the fix to `develop`.

Protect `main` in Bitbucket: require pull requests and successful build checks. Protect `develop` with pull requests when more than one developer works on the project.

Use a dedicated read-only SSH deploy key for the VPS checkout. Keep it in the VPS user's SSH configuration or Bitbucket repository access keys. Do not put Bitbucket credentials, private keys, or app passwords in `.env` or the repository.

## VPS Checkouts

Use two directories or Git worktrees. Two normal clones are easier to explain and are the default:

```text
/srv/acme-portal/
  production/   # tracks origin/main
  staging/      # tracks origin/develop
```

Clone them once with the repository's Bitbucket SSH URL:

```powershell
git clone --branch main git@bitbucket.org:<workspace>/<repository>.git /srv/acme-portal/production
git clone --branch develop git@bitbucket.org:<workspace>/<repository>.git /srv/acme-portal/staging
```

Create a distinct `.env` in each directory. Example values:

```dotenv
# production/.env
COMPOSE_PROJECT_NAME=acme-production
HTTP_BIND_ADDRESS=127.0.0.1
HTTP_PORT=18080
POSTGRES_DB=acme_production
POSTGRES_USER=acme_production
POSTGRES_PASSWORD=<unique-secret>

# staging/.env
COMPOSE_PROJECT_NAME=acme-staging
HTTP_BIND_ADDRESS=127.0.0.1
HTTP_PORT=18081
POSTGRES_DB=acme_staging
POSTGRES_USER=acme_staging
POSTGRES_PASSWORD=<different-unique-secret>
```

The Compose project names ensure Docker names and PostgreSQL volumes cannot collide. Keep `.env` files on the VPS only.

## Domain Routing

Configure the host TLS proxy once. A Caddy example:

```caddy
app.example.com {
  reverse_proxy 127.0.0.1:18080
}

staging.example.com {
  reverse_proxy 127.0.0.1:18081
}
```

The application ports are loopback-only. The firewall exposes SSH and HTTP/HTTPS, not `18080`, `18081`, PostgreSQL, or the API directly.

## Deploying

Run the commands inside the target directory. Staging deploys `develop`; production deploys `main`.

```powershell
git fetch origin
git pull --ff-only origin <branch>
docker compose --env-file .env up -d --build
docker compose ps
docker compose logs --tail 100 api
```

Verify the final domain and `https://<domain>/health`. Record the deployed commit with `git rev-parse HEAD` in the release note or Bitbucket deployment record.

Bitbucket Pipelines should at least run the same source checks before a merge:

```powershell
corepack enable
yarn install --immutable
yarn build
```

Start with manual SSH deployment after a successful pipeline. Move to a Bitbucket runner or SSH deployment step only when the team can manage its secrets, access controls, and rollback process.

## Rollback

If a deployment fails, identify the last known good commit, check it out in the affected environment, then rebuild that environment only:

```powershell
git log --oneline -n 10
git checkout <known-good-commit>
docker compose --env-file .env up -d --build
```

After recovery, create a corrective branch and pull request. Do not leave production permanently detached from a documented commit or branch.

## Temporary Previews

Create an additional environment only when client review needs it. It requires a unique branch, checkout, `COMPOSE_PROJECT_NAME`, loopback port, database, credentials, subdomain, backup decision, and removal date.

Preview environments are not the default. They consume the same operational resources as staging and production and can quickly make a small VPS difficult to maintain.
