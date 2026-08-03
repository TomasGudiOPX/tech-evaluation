import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { ProjectService } from './project.service.js';

export function registerProjectRoutes(app: FastifyInstance, projectService: ProjectService) {
  app.get('/api/projects', async () => ({
    projects: await projectService.listRecent(),
  }));

  app.post('/api/projects', async (request, reply) => {
    try {
      const project = await projectService.create(request.body);
      reply.code(201);
      return { project };
    } catch (error) {
      if (error instanceof ZodError) {
        reply.code(400);
        return { error: 'Project name must contain between 1 and 120 characters.' };
      }

      throw error;
    }
  });
}
