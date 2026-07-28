import 'dotenv/config';

import cors from '@fastify/cors';
import Fastify from 'fastify';
import { Pool } from 'pg';
import { z } from 'zod';
import { registerMcpRoutes } from './mcp.js';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({ connectionString: databaseUrl });
const app = Fastify({ logger: true });
const corsOrigin = process.env.CORS_ORIGIN ?? false;

await app.register(cors, {
  origin: corsOrigin === '*' ? true : corsOrigin,
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

app.get('/health', async (_request, reply) => {
  try {
    await pool.query('SELECT 1');
    return { status: 'ok', database: 'connected' };
  } catch (error) {
    reply.code(503);
    return {
      status: 'unavailable',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
});

app.get('/api/config', async () => ({
  service: 'vps-template-api',
  environment: process.env.NODE_ENV ?? 'development',
}));

app.get('/api/projects', async () => {
  const { rows } = await pool.query(
    'SELECT id, name, created_at FROM projects ORDER BY created_at DESC',
  );

  return { projects: rows };
});

const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

app.post('/api/projects', async (request, reply) => {
  const parsed = createProjectSchema.safeParse(request.body);

  if (!parsed.success) {
    reply.code(400);
    return { error: 'Project name must contain between 1 and 120 characters.' };
  }

  const { rows } = await pool.query(
    'INSERT INTO projects (name) VALUES ($1) RETURNING id, name, created_at',
    [parsed.data.name],
  );

  reply.code(201);
  return { project: rows[0] };
});

registerMcpRoutes(app, pool);

app.addHook('onClose', async () => {
  await pool.end();
});

const port = Number(process.env.PORT ?? 3000);

try {
  await app.listen({ port, host: '0.0.0.0' });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
