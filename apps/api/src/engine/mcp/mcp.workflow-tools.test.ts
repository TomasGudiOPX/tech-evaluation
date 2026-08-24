import { describe, expect, it, vi } from 'vitest';
import type { ZodError } from 'zod';
import type { ActionService } from '../../modules/actions/action.service.js';
import type { AuthService } from '../../modules/auth/auth.service.js';
import type { CartService } from '../../modules/cart/cart.service.js';
import type { OrderService } from '../../modules/orders/order.service.js';
import type { ReviewService } from '../../modules/reviews/review.service.js';
import { maskEmail, registerWorkflowTools, type WorkflowToolServices } from './mcp.workflow-tools.js';

const userId = '00000000-0000-4000-8000-000000000001';
const orderId = '00000000-0000-4000-8000-000000000002';

type RegisteredTool = {
  name: string;
  inputSchema: { parse: (input: unknown) => unknown };
  handler: (args: never) => Promise<unknown>;
};

function createServices(): WorkflowToolServices {
  return {
    orders: { listOrders: vi.fn(async () => []), getOrder: vi.fn(async () => ({})) },
    cart: { get: vi.fn(async () => ({})) },
    reviews: { listForProduct: vi.fn(async () => []) },
    auth: { profile: vi.fn(async () => ({ id: userId, email: 'tom@example.com', role: 'customer' })) },
    actions: {
      propose: vi.fn(async () => ({})),
      list: vi.fn(async () => []),
      get: vi.fn(async () => ({})),
      approve: vi.fn(async () => ({})),
      reject: vi.fn(async () => ({})),
      correct: vi.fn(async () => ({})),
      metrics: vi.fn(async () => ({})),
    },
  } as unknown as WorkflowToolServices;
}

function register(services = createServices()) {
  const tools: RegisteredTool[] = [];
  const server = {
    registerTool(name: string, config: { inputSchema: RegisteredTool['inputSchema'] }, handler: RegisteredTool['handler']) {
      tools.push({ name, inputSchema: config.inputSchema, handler });
    },
  };

  registerWorkflowTools(server as never, services);

  return { tools, services };
}

function tool(tools: RegisteredTool[], name: string): RegisteredTool {
  const found = tools.find((entry) => entry.name === name);

  if (!found) {
    throw new Error(`tool ${name} was not registered`);
  }

  return found;
}

describe('registerWorkflowTools', () => {
  it('registers the read-only context and ledger tools', () => {
    const { tools } = register();

    expect(tools.map((entry) => entry.name)).toEqual(
      expect.arrayContaining([
        'list_orders',
        'get_order',
        'get_cart',
        'get_user_profile',
        'list_reviews',
        'propose_action',
        'list_actions',
        'get_action',
        'approve_action',
        'reject_action',
        'correct_action',
        'get_action_metrics',
      ]),
    );
  });

  it('propose_action rejects invalid payloads and accepts a valid note', () => {
    const { tools } = register();
    const propose = tool(tools, 'propose_action');

    expect(() => propose.inputSchema.parse({ payload: { kind: 'send_message', to: 'x' } })).toThrow();
    expect(() => propose.inputSchema.parse({ payload: { kind: 'note', userId, content: '   ' } })).toThrow();
    expect(propose.inputSchema.parse({ payload: { kind: 'note', userId, content: 'hello' } })).toBeTruthy();
  });

  it('approve_action and reject_action require actionId and decidedBy', () => {
    const { tools } = register();
    const approve = tool(tools, 'approve_action');
    const reject = tool(tools, 'reject_action');

    expect(() => approve.inputSchema.parse({})).toThrow();
    expect(() => approve.inputSchema.parse({ actionId: orderId })).toThrow();
    expect(() => reject.inputSchema.parse({ decidedBy: 'support@example.com' })).toThrow();
    expect(approve.inputSchema.parse({ actionId: orderId, decidedBy: 'support@example.com' })).toBeTruthy();
  });

  it('correct_action requires a corrected payload', () => {
    const { tools } = register();
    const correct = tool(tools, 'correct_action');

    expect(() => correct.inputSchema.parse({ actionId: orderId, decidedBy: 'support@example.com' })).toThrow();
    expect(
      correct.inputSchema.parse({
        actionId: orderId,
        decidedBy: 'support@example.com',
        payload: { kind: 'note', userId, content: 'corrected' },
      }),
    ).toBeTruthy();
  });

  it('get_user_profile masks the email in the response', async () => {
    const { tools } = register();
    const profile = tool(tools, 'get_user_profile');

    const result = await profile.handler({ userId } as never);

    expect(result).toEqual({
      content: [{ type: 'text', text: JSON.stringify({ id: userId, email: 't**@example.com', role: 'customer' }) }],
    });
  });

  it('read tools return read-only results without writing', async () => {
    const services = createServices();
    const { tools } = register(services);
    const listOrders = tool(tools, 'list_orders');

    await listOrders.handler({} as never);

    expect(services.orders.listOrders).toHaveBeenCalledWith(undefined);
    expect(services.orders.getOrder).not.toHaveBeenCalled();
  });
});

describe('maskEmail', () => {
  it('masks everything after the first character of the local part', () => {
    expect(maskEmail('tom@example.com')).toBe('t**@example.com');
    expect(maskEmail('a@example.com')).toBe('a@example.com');
    expect(maskEmail('longer-name@example.com')).toBe('l**********@example.com');
  });
});
