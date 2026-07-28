import { timingSafeEqual } from 'node:crypto';

import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { Pool } from 'pg';
import { z } from 'zod';

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  id?: unknown;
  method?: unknown;
  params?: unknown;
};

const protocolVersion = '2024-11-05';
const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

const tools = [
  {
    name: 'list_projects',
    description: 'List the most recently created projects.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'create_project',
    description: 'Create a project with a short name.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Project name, between 1 and 120 characters.',
        },
      },
      required: ['name'],
      additionalProperties: false,
    },
  },
];

function getRequestId(value: unknown): JsonRpcId {
  return typeof value === 'string' || typeof value === 'number' ? value : null;
}

function rpcResult(id: JsonRpcId, result: Record<string, unknown>) {
  return { jsonrpc: '2.0', id, result };
}

function rpcError(id: JsonRpcId, code: number, message: string) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

function hasValidBearerToken(request: FastifyRequest, expectedToken: string) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return false;
  }

  const providedToken = Buffer.from(authorization.slice('Bearer '.length));
  const expectedTokenBuffer = Buffer.from(expectedToken);

  return (
    providedToken.length === expectedTokenBuffer.length &&
    timingSafeEqual(providedToken, expectedTokenBuffer)
  );
}

function toolError(id: JsonRpcId, message: string) {
  return rpcResult(id, {
    content: [{ type: 'text', text: message }],
    isError: true,
  });
}

export function registerMcpRoutes(app: FastifyInstance, pool: Pool) {
  const apiToken = process.env.MCP_API_TOKEN;

  app.post('/mcp', async (request, reply) => {
    if (!apiToken) {
      reply.code(404);
      return { error: 'MCP is disabled. Set MCP_API_TOKEN to enable it.' };
    }

    if (!hasValidBearerToken(request, apiToken)) {
      reply.header('WWW-Authenticate', 'Bearer');
      reply.code(401);
      return { error: 'A valid MCP bearer token is required.' };
    }

    const body = request.body as JsonRpcRequest;
    const id = getRequestId(body?.id);

    if (!body || typeof body.method !== 'string') {
      return rpcError(id, -32600, 'Invalid JSON-RPC request.');
    }

    if (body.method === 'initialize') {
      return rpcResult(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: {
          name: 'vps-template-mcp',
          version: '0.1.0',
        },
        instructions:
          'Use tools/list before calling tools. This starter exposes project examples only.',
      });
    }

    if (body.method === 'notifications/initialized') {
      reply.code(204);
      return;
    }

    if (body.method === 'ping') {
      return rpcResult(id, {});
    }

    if (body.method === 'tools/list') {
      return rpcResult(id, { tools });
    }

    if (body.method === 'resources/list') {
      return rpcResult(id, { resources: [] });
    }

    if (body.method !== 'tools/call' || !body.params || typeof body.params !== 'object') {
      return rpcError(id, -32601, `Unsupported MCP method: ${body.method}`);
    }

    const params = body.params as { name?: unknown; arguments?: unknown };

    if (params.name === 'list_projects') {
      const { rows } = await pool.query(
        'SELECT id, name, created_at FROM projects ORDER BY created_at DESC LIMIT 100',
      );

      return rpcResult(id, {
        content: [{ type: 'text', text: JSON.stringify({ projects: rows }) }],
        isError: false,
      });
    }

    if (params.name === 'create_project') {
      const parsed = createProjectSchema.safeParse(params.arguments);

      if (!parsed.success) {
        return toolError(id, 'name must contain between 1 and 120 characters.');
      }

      const { rows } = await pool.query(
        'INSERT INTO projects (name) VALUES ($1) RETURNING id, name, created_at',
        [parsed.data.name],
      );

      return rpcResult(id, {
        content: [{ type: 'text', text: JSON.stringify({ project: rows[0] }) }],
        isError: false,
      });
    }

    return toolError(id, `Unknown tool: ${String(params.name)}`);
  });
}
