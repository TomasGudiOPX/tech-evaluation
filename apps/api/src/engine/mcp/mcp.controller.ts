import { All, Controller, Inject, Req, Res } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { APP_CONFIG } from '../../platform/app-config.token.js';
import type { AppConfig } from '../../platform/config.js';
import { ActionService } from '../../modules/actions/action.service.js';
import { AuthService } from '../../modules/auth/auth.service.js';
import { CartService } from '../../modules/cart/cart.service.js';
import { OrderService } from '../../modules/orders/order.service.js';
import { ProductService } from '../../modules/products/product.service.js';
import { ReviewService } from '../../modules/reviews/review.service.js';
import { hasValidBearerToken } from './mcp-auth.js';
import { registerWorkflowTools } from './mcp.workflow-tools.js';

@Controller()
export class McpController {
  constructor(
    private readonly products: ProductService,
    private readonly orders: OrderService,
    private readonly cart: CartService,
    private readonly reviews: ReviewService,
    private readonly auth: AuthService,
    private readonly actions: ActionService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  @All('/mcp')
  async handleMcp(@Req() req: FastifyRequest, @Res({ passthrough: false }) res: FastifyReply): Promise<void> {
    const rawReq = req.raw;
    const rawRes = res.raw;

    if (!this.config.mcpApiToken || !hasValidBearerToken(req, this.config.mcpApiToken)) {
      rawRes.writeHead(401, { 'Content-Type': 'application/json' });
      rawRes.end(JSON.stringify({ error: 'unauthorized' }));
      return;
    }

    const body = req.body as Record<string, unknown> | undefined;

    if (body && isJsonRpcNotification(body)) {
      rawRes.writeHead(202);
      rawRes.end();
      return;
    }

    const parsedBody = req.method === 'POST' ? body : undefined;

    try {
      const server = new McpServer({ name: 'shopping-cart', version: '1.0.0' });
      registerProductTools(server, this.products);
      registerWorkflowTools(server, {
        orders: this.orders,
        cart: this.cart,
        reviews: this.reviews,
        auth: this.auth,
        actions: this.actions,
      });
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      await server.connect(transport);
      await transport.handleRequest(rawReq, rawRes, parsedBody);
    } catch (error) {
      console.error('MCP transport error:', error);
      if (!rawRes.writableEnded) {
        rawRes.writeHead(500, { 'Content-Type': 'application/json' });
        rawRes.end(JSON.stringify({ error: 'internal server error' }));
      }
    }
  }
}

function isJsonRpcNotification(body: unknown): boolean {
  return typeof body === 'object' && body !== null && 'method' in body && !('id' in body);
}

function registerProductTools(server: McpServer, products: ProductService): void {
  server.registerTool(
    'list_products',
    {
      title: 'List products',
      description: 'List products from the catalog. Filter by category, max price (cents), or active status.',
      inputSchema: z.object({
        category: z.enum(['workspace', 'bags', 'kitchen', 'decor', 'wellness', 'travel'] as const).optional(),
        maxPriceCents: z.number().int().positive().optional(),
        activeOnly: z.boolean().optional(),
      }),
    },
    async (args) => {
      const result = await products.listFiltered({
        category: args.category,
        maxPriceCents: args.maxPriceCents,
        activeOnly: args.activeOnly,
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
    },
  );

  server.registerTool(
    'get_product',
    {
      title: 'Get product',
      description: 'Get full details of a product by its UUID id.',
      inputSchema: z.object({ id: z.string().uuid() }),
    },
    async ({ id }) => {
      try {
        const product = await products.getActive(id);
        return { content: [{ type: 'text' as const, text: JSON.stringify(product) }] };
      } catch {
        return { isError: true as const, content: [{ type: 'text' as const, text: 'product not found' }] };
      }
    },
  );

  server.registerTool(
    'search_products',
    {
      title: 'Search products',
      description: 'Search products by name (case-insensitive partial match).',
      inputSchema: z.object({ query: z.string().min(1).max(100) }),
    },
    async ({ query }) => {
      const result = await products.searchByName(query);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
    },
  );
}
