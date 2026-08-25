import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AuthService } from '../../modules/auth/auth.service.js';
import type { ActionService } from '../../modules/actions/action.service.js';
import type { CartService } from '../../modules/cart/cart.service.js';
import type { OrderService } from '../../modules/orders/order.service.js';
import type { ReviewService } from '../../modules/reviews/review.service.js';
import {
  correctActionInputSchema,
  decisionInputSchema,
  getActionInputSchema,
  listActionsInputSchema,
  proposeActionInputSchema,
} from '@vps-template/contracts/actions';

export type WorkflowToolServices = {
  orders: OrderService;
  cart: CartService;
  reviews: ReviewService;
  auth: AuthService;
  actions: ActionService;
};

export const listOrdersToolSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
});

export const getOrderToolSchema = z.object({
  id: z.string().uuid(),
});

export const getCartToolSchema = z.object({
  userId: z.string().uuid(),
});

export const getUserProfileToolSchema = z.object({
  userId: z.string().uuid(),
});

export const listReviewsToolSchema = z.object({
  productId: z.string().uuid(),
});

export const getActionMetricsToolSchema = z.object({});

export function maskEmail(email: string): string {
  const at = email.indexOf('@');

  if (at <= 1) {
    return email;
  }

  return `${email[0]}${'*'.repeat(at - 1)}${email.slice(at)}`;
}

function result(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
}

function error(message: string) {
  return { isError: true as const, content: [{ type: 'text' as const, text: message }] };
}

async function run(fn: () => Promise<unknown>) {
  try {
    return result(await fn());
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Internal error');
  }
}

/**
 * Registers the supervised-workflow tools on the project MCP server. Read tools
 * are read-only on business data; `propose_action` writes only to the ledger;
 * the approval tools (`approve_action` / `reject_action` / `correct_action`)
 * are the human gate and must only be invoked on the user's explicit instruction.
 */
export function registerWorkflowTools(server: McpServer, services: WorkflowToolServices): void {
  // --- Read-only context tools -------------------------------------------------
  server.registerTool(
    'list_orders',
    {
      title: 'List orders',
      description: 'List recent orders (newest first). Optionally limit the result count.',
      inputSchema: listOrdersToolSchema,
    },
    async (args) => run(() => services.orders.listOrders(args.limit)),
  );

  server.registerTool(
    'get_order',
    {
      title: 'Get order',
      description: 'Get a single order with its items by UUID id.',
      inputSchema: getOrderToolSchema,
    },
    async (args) => run(() => services.orders.getOrder(args.id)),
  );

  server.registerTool(
    'get_cart',
    {
      title: 'Get cart',
      description: 'Get the current cart for a user by UUID id.',
      inputSchema: getCartToolSchema,
    },
    async (args) => run(() => services.cart.get(args.userId)),
  );

  server.registerTool(
    'get_user_profile',
    {
      title: 'Get user profile',
      description: 'Get a user profile (masked email) by UUID id.',
      inputSchema: getUserProfileToolSchema,
    },
    async (args) =>
      run(async () => {
        const profile = await services.auth.profile(args.userId);
        return { id: profile.id, email: maskEmail(profile.email), role: profile.role, externalId: profile.externalId };
      }),
  );

  server.registerTool(
    'list_reviews',
    {
      title: 'List reviews',
      description: 'List reviews for an active product by UUID id.',
      inputSchema: listReviewsToolSchema,
    },
    async (args) => run(() => services.reviews.listForProduct(args.productId)),
  );

  // --- Ledger tools ------------------------------------------------------------
  server.registerTool(
    'propose_action',
    {
      title: 'Propose action',
      description:
        'Record a proposed write action in the approval ledger (ledger-only; never writes business data). The payload is a discriminated union keyed on kind: note, followup_task, stock_adjust, retire_product.',
      inputSchema: proposeActionInputSchema,
    },
    async (args) => run(() => services.actions.propose(args)),
  );

  server.registerTool(
    'list_actions',
    {
      title: 'List actions',
      description: 'List proposed actions from the approval ledger, optionally filtered by status.',
      inputSchema: listActionsInputSchema,
    },
    async (args) => run(() => services.actions.list(args.status)),
  );

  server.registerTool(
    'get_action',
    {
      title: 'Get action',
      description: 'Get a single action from the approval ledger by UUID id.',
      inputSchema: getActionInputSchema,
    },
    async (args) => run(() => services.actions.get(args.id)),
  );

  server.registerTool(
    'approve_action',
    {
      title: 'Approve action',
      description:
        'Approve a proposed action and execute it. Requires an explicit human decider identity. Only call on the user explicit instruction.',
      inputSchema: decisionInputSchema,
    },
    async (args) => run(() => services.actions.approve(args)),
  );

  server.registerTool(
    'reject_action',
    {
      title: 'Reject action',
      description: 'Reject a proposed action. Requires an explicit human decider identity.',
      inputSchema: decisionInputSchema,
    },
    async (args) => run(() => services.actions.reject(args)),
  );

  server.registerTool(
    'correct_action',
    {
      title: 'Correct action',
      description: 'Record a correction that replaces a proposed action payload with a corrected one.',
      inputSchema: correctActionInputSchema,
    },
    async (args) => run(() => services.actions.correct(args)),
  );

  server.registerTool(
    'get_action_metrics',
    {
      title: 'Get action metrics',
      description: 'Return counters derived from the approval ledger (total, by status, by kind).',
      inputSchema: getActionMetricsToolSchema,
    },
    async () => run(() => services.actions.metrics()),
  );
}
