-- Creates the read-only role for the MCP DB bridge.
-- Run against the cart 'app' database as a superuser or the database owner:
--   docker compose --env-file .env up -d db
--   Get-Content scripts/create_readonly_role.sql | docker compose --env-file .env exec -T db psql -U app -d app
--
-- Policy: only public information (products) is accessible.
-- Orders, users, carts, checkout keys are private and MUST NOT be queryable.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'mcp_ro') THEN
    CREATE ROLE mcp_ro LOGIN PASSWORD 'mcp_ro_local_only';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE app TO mcp_ro;
GRANT USAGE ON SCHEMA public TO mcp_ro;

-- Public: products (and Prisma migrations for schema introspection).
-- REVOKE first to clear any previous blanket grants, then grant selectively.
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM mcp_ro;
GRANT SELECT ON products TO mcp_ro;
GRANT SELECT ON _prisma_migrations TO mcp_ro;
