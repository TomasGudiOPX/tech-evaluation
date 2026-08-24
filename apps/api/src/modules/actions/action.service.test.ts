import { describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import { AppError } from '../../platform/app-error.js';
import { ActionExecutorService } from './action.executor.js';
import type { ActionRepository } from './action.repository.js';
import { ActionService } from './action.service.js';
import type { ActionRow } from './action.types.js';

const userId = '00000000-0000-4000-8000-000000000001';
const orderId = '00000000-0000-4000-8000-000000000002';
const actionId = '00000000-0000-4000-8000-000000000003';

function action(overrides: Partial<ActionRow> = {}): ActionRow {
  return {
    id: actionId,
    kind: 'note',
    contextRef: orderId,
    payload: { kind: 'note', userId, orderId, content: 'Customer prefers email updates.' },
    source: 'agent',
    proposedAt: new Date('2026-08-24T10:00:00.000Z'),
    proposedBy: 'hermes',
    status: 'proposed',
    decidedBy: null,
    decidedAt: null,
    decision: null,
    reason: null,
    resultRef: null,
    executedAt: null,
    createdAt: new Date('2026-08-24T10:00:00.000Z'),
    updatedAt: new Date('2026-08-24T10:00:00.000Z'),
    ...overrides,
  };
}

function createService(initial: ActionRow[] = [action()]) {
  const store = initial.map((item) => ({ ...item }));

  const repository = {
    createPendingAction: vi.fn(
      async (data: {
        kind: string;
        contextRef: string | null;
        payload: unknown;
        source: string;
        proposedBy: string | null;
      }) => {
        const row = action({
          kind: data.kind,
          contextRef: data.contextRef,
          payload: data.payload,
          source: data.source,
          proposedBy: data.proposedBy,
        });
        store.push(row);
        return row;
      },
    ),
    findById: vi.fn(async (id: string) => store.find((item) => item.id === id) ?? null),
    list: vi.fn(async (status?: string) => store.filter((item) => !status || item.status === status)),
    recordDecision: vi.fn(async (id: string, data: Record<string, unknown>) => {
      const row = store.find((item) => item.id === id)!;
      Object.assign(row, {
        status: data.status,
        decidedBy: data.decidedBy,
        decidedAt: data.decidedAt,
        decision: data.decision,
        reason: data.reason,
        ...(data.payload !== undefined ? { payload: data.payload } : {}),
      });
      return { ...row };
    }),
    markExecuted: vi.fn(async (id: string, resultRef: string, executedAt: Date) => {
      const row = store.find((item) => item.id === id)!;
      Object.assign(row, { status: 'executed', resultRef, executedAt });
      return { ...row };
    }),
    markFailed: vi.fn(async (id: string, reason: string) => {
      const row = store.find((item) => item.id === id)!;
      Object.assign(row, { status: 'failed', reason });
      return { ...row };
    }),
    countByStatus: vi.fn(async () => {
      const counts: Record<string, number> = { proposed: 0, approved: 0, rejected: 0, executed: 0, failed: 0 };
      for (const item of store) counts[item.status] = (counts[item.status] ?? 0) + 1;
      return Object.entries(counts).map(([status, count]) => ({ status, count }));
    }),
    countByKind: vi.fn(async () => {
      const counts: Record<string, number> = {};
      for (const item of store) counts[item.kind] = (counts[item.kind] ?? 0) + 1;
      return Object.entries(counts).map(([kind, count]) => ({ kind, count }));
    }),
  };

  const executor = {
    execute: vi.fn(async (row: ActionRow) => JSON.stringify({ kind: row.kind, executed: true })),
  };

  return {
    repository,
    executor,
    service: new ActionService(repository as unknown as ActionRepository, executor as unknown as ActionExecutorService),
  };
}

describe('ActionService', () => {
  it('proposes a validated action into the ledger', async () => {
    const { repository, service } = createService([]);

    const result = await service.propose({
      payload: { kind: 'note', userId, orderId, content: 'Please email updates.' },
      source: 'agent',
      proposedBy: 'hermes',
    });

    expect(result.status).toBe('proposed');
    expect(result.kind).toBe('note');
    expect(result.proposedBy).toBe('hermes');
    expect(repository.createPendingAction).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'note', source: 'agent' }),
    );
  });

  it('rejects proposals with an unknown or invalid payload', async () => {
    const { service } = createService([]);

    await expect(service.propose({ payload: { kind: 'send_message', to: 'x' } })).rejects.toBeInstanceOf(ZodError);
    await expect(service.propose({ payload: { kind: 'note', userId, content: '  ' } })).rejects.toBeInstanceOf(
      ZodError,
    );
  });

  it('approves a proposed action, executes it, and records the read-back', async () => {
    const { executor, service } = createService();

    const result = await service.approve({ actionId, decidedBy: 'support@example.com', reason: 'approved' });

    expect(executor.execute).toHaveBeenCalledWith(expect.objectContaining({ id: actionId }));
    expect(result.status).toBe('executed');
    expect(result.decidedBy).toBe('support@example.com');
    expect(result.decision).toBe('approve');
    expect(result.resultRef).toBe(JSON.stringify({ kind: 'note', executed: true }));
  });

  it('marks the action failed when the executor throws', async () => {
    const { executor, service } = createService();
    executor.execute.mockRejectedValueOnce(new AppError(404, 'NOTE_USER_NOT_FOUND', 'User not found for note'));

    const result = await service.approve({ actionId, decidedBy: 'support@example.com' });

    expect(result.status).toBe('failed');
    expect(result.reason).toBe('User not found for note');
  });

  it('rejects approval of an action that is not proposed', async () => {
    const { service } = createService([action({ status: 'rejected' })]);

    await expect(service.approve({ actionId, decidedBy: 'support@example.com' })).rejects.toMatchObject({
      code: 'ACTION_NOT_PROPOSED',
      statusCode: 409,
    } satisfies Partial<AppError>);
  });

  it('rejects a proposed action with an explicit decider', async () => {
    const { service } = createService();

    const result = await service.reject({ actionId, decidedBy: 'support@example.com', reason: 'not needed' });

    expect(result.status).toBe('rejected');
    expect(result.decision).toBe('reject');
    expect(result.decidedBy).toBe('support@example.com');
    expect(result.reason).toBe('not needed');
  });

  it('corrects a proposed action by replacing the payload and keeping it proposed', async () => {
    const { service } = createService();

    const result = await service.correct({
      actionId,
      decidedBy: 'support@example.com',
      reason: 'use a different note',
      payload: { kind: 'note', userId, content: 'Corrected note content.' },
    });

    expect(result.status).toBe('proposed');
    expect(result.decision).toBe('correct');
    expect(result.payload).toMatchObject({ content: 'Corrected note content.' });
  });

  it('returns a specific action or a not-found error', async () => {
    const { service } = createService();

    await expect(service.get(actionId)).resolves.toMatchObject({ id: actionId, status: 'proposed' });
    await expect(service.get('00000000-0000-4000-8000-000000000099')).rejects.toMatchObject({
      code: 'ACTION_NOT_FOUND',
    } satisfies Partial<AppError>);
  });

  it('lists actions optionally filtered by status', async () => {
    const { repository, service } = createService([
      action(),
      action({ id: '00000000-0000-4000-8000-000000000004', status: 'executed' }),
    ]);

    await expect(service.list()).resolves.toHaveLength(2);
    await expect(service.list('executed')).resolves.toEqual([
      expect.objectContaining({ id: '00000000-0000-4000-8000-000000000004', status: 'executed' }),
    ]);
    expect(repository.list).toHaveBeenCalledWith('executed');
  });

  it('derives counters from the ledger', async () => {
    const { service } = createService([
      action(),
      action({ id: '00000000-0000-4000-8000-000000000004', status: 'executed' }),
      action({ id: '00000000-0000-4000-8000-000000000005', status: 'rejected' }),
    ]);

    await expect(service.metrics()).resolves.toMatchObject({
      total: 3,
      byStatus: { proposed: 1, approved: 0, rejected: 1, executed: 1, failed: 0 },
      proposedToApproved: 1,
      approvedToExecuted: 1,
    });
  });
});
