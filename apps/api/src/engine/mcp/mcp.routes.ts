import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ProjectService } from '../../modules/projects/project.service.js';
import { hasValidBearerToken } from './mcp-auth.js';
import { mcpInstructions } from './mcp-instructions.js';
import { registerProjectTools } from './project-tools.js';

type McpRouteOptions = {
  apiToken: string | undefined;
  projectService: ProjectService;
};

function createMcpServer(projectService: ProjectService) {
  const server = new McpServer(
    { name: 'vps-template-mcp', version: '0.2.0' },
    { instructions: mcpInstructions },
  );

  registerProjectTools(server, projectService);
  return server;
}

export async function registerMcpRoutes(app: FastifyInstance, options: McpRouteOptions) {
  const server = createMcpServer(options.projectService);
  const transport = new StreamableHTTPServerTransport({
    enableJsonResponse: true,
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);

  const handleMcpRequest = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!options.apiToken) {
      reply.code(404);
      return { error: 'MCP is disabled.' };
    }

    if (!hasValidBearerToken(request, options.apiToken)) {
      reply.header('WWW-Authenticate', 'Bearer');
      reply.code(401);
      return { error: 'A valid MCP bearer token is required.' };
    }

    reply.hijack();

    try {
      await transport.handleRequest(request.raw, reply.raw, request.body);
    } catch (error) {
      request.log.error(error, 'MCP request failed');

      if (!reply.raw.headersSent) {
        reply.raw.statusCode = 500;
        reply.raw.setHeader('Content-Type', 'application/json');
        reply.raw.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32603, message: 'Internal server error' },
          }),
        );
      }
    }
  };

  app.route({
    method: ['GET', 'POST', 'DELETE'],
    url: '/mcp',
    handler: handleMcpRequest,
  });
}
