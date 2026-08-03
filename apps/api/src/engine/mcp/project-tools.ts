import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ProjectService } from '../../modules/projects/project.service.js';

const createProjectInputSchema: z.ZodRawShape = {
  name: z.string().trim().min(1).max(120).describe('Project name, between 1 and 120 characters.'),
};

type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
};

type ToolRegistrar = {
  registerTool(
    name: string,
    configuration: Record<string, unknown>,
    handler: (input: Record<string, unknown>) => Promise<ToolResult>,
  ): unknown;
};

export function registerProjectTools(server: McpServer, projectService: ProjectService) {
  const toolRegistrar = server as unknown as ToolRegistrar;

  toolRegistrar.registerTool(
    'list_projects',
    {
      description: 'List recently created projects. Returns no more than 20 projects.',
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => ({
      content: [
        {
          type: 'text',
          text: JSON.stringify({ projects: await projectService.listRecent(20) }),
        },
      ],
    }),
  );

  toolRegistrar.registerTool(
    'create_project',
    {
      description: 'Create a project with a short name.',
      inputSchema: createProjectInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (input) => ({
      content: [
        {
          type: 'text',
          text: JSON.stringify({ project: await projectService.create(input) }),
        },
      ],
    }),
  );
}
