import cors from '@fastify/cors';
import Fastify from 'fastify';
import type { Pool } from 'pg';
import { registerMcpRoutes } from './engine/mcp/mcp.routes.js';
import { ProjectRepository } from './modules/projects/project.repository.js';
import { registerProjectRoutes } from './modules/projects/project.routes.js';
import { ProjectService } from './modules/projects/project.service.js';
import type { AppConfig } from './platform/config.js';

export async function createApp(config: AppConfig, pool: Pool) {
  const app = Fastify({ logger: true });
  const projectService = new ProjectService(new ProjectRepository(pool));

  await app.register(cors, { origin: config.corsOrigin });
  await projectService.initialize();

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
    environment: config.nodeEnv,
  }));

  registerProjectRoutes(app, projectService);
  await registerMcpRoutes(app, {
    apiToken: config.mcpApiToken,
    projectService,
  });

  app.addHook('onClose', async () => {
    await pool.end();
  });

  return app;
}
