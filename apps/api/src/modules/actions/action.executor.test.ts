import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../../platform/app-error.js';
import { ActionExecutorService } from './action.executor.js';
import type { ActionRepository } from './action.repository.js';
import type { ActionRow, CustomerNoteRow, FollowupTaskRow } from './action.types.js';

const userId = '00000000-0000-4000-8000-000000000001';
const orderId = '00000000-0000-4000-8000-000000000002';
const noteId = '00000000-0000-4000-8000-000000000003';
const taskId = '00000000-0000-4000-8000-000000000004';

function noteRow(): CustomerNoteRow {
  return {
    id: noteId,
    userId,
    orderId,
    content: 'Customer prefers email updates.',
    createdAt: new Date('2026-08-24T10:00:00.000Z'),
  };
}

function taskRow(): FollowupTaskRow {
  return {
    id: taskId,
    title: 'Confirm replacement',
    owner: 'support@example.com',
    dueAt: new Date('2026-08-26T09:00:00.000Z'),
    status: 'open',
    contextRef: orderId,
    createdAt: new Date('2026-08-24T10:00:00.000Z'),
    updatedAt: new Date('2026-08-24T10:00:00.000Z'),
  };
}

function actionWith(kind: string, payload: unknown): ActionRow {
  return {
    id: '00000000-0000-4000-8000-000000000010',
    kind,
    contextRef: null,
    payload,
    source: 'agent',
    proposedAt: new Date('2026-08-24T10:00:00.000Z'),
    proposedBy: 'hermes',
    status: 'approved',
    decidedBy: 'support@example.com',
    decidedAt: new Date('2026-08-24T10:05:00.000Z'),
    decision: 'approve',
    reason: null,
    resultRef: null,
    executedAt: null,
    createdAt: new Date('2026-08-24T10:00:00.000Z'),
    updatedAt: new Date('2026-08-24T10:05:00.000Z'),
  };
}

function createExecutor(existingUser = true, existingOrder = true) {
  const repository = {
    userExists: vi.fn(async () => existingUser),
    orderExists: vi.fn(async () => existingOrder),
    createCustomerNote: vi.fn(async () => noteRow()),
    findCustomerNote: vi.fn(async () => noteRow()),
    createFollowupTask: vi.fn(async () => taskRow()),
    findFollowupTask: vi.fn(async () => taskRow()),
  };

  return {
    repository,
    executor: new ActionExecutorService(repository as unknown as ActionRepository),
  };
}

describe('ActionExecutorService', () => {
  it('creates a customer note and reads it back', async () => {
    const { repository, executor } = createExecutor();

    const resultRef = await executor.execute(
      actionWith('note', { kind: 'note', userId, orderId, content: 'Customer prefers email updates.' }),
    );

    expect(repository.createCustomerNote).toHaveBeenCalledWith({ userId, orderId, content: 'Customer prefers email updates.' });
    expect(repository.findCustomerNote).toHaveBeenCalledWith(noteId);
    expect(JSON.parse(resultRef)).toMatchObject({ kind: 'note', noteId, userId, orderId });
  });

  it('rejects a note for a missing user', async () => {
    const { executor } = createExecutor(false);

    await expect(
      executor.execute(actionWith('note', { kind: 'note', userId, content: 'hello' })),
    ).rejects.toMatchObject({ code: 'NOTE_USER_NOT_FOUND' } satisfies Partial<AppError>);
  });

  it('rejects a note for a missing order', async () => {
    const { executor } = createExecutor(true, false);

    await expect(
      executor.execute(actionWith('note', { kind: 'note', userId, orderId, content: 'hello' })),
    ).rejects.toMatchObject({ code: 'NOTE_ORDER_NOT_FOUND' } satisfies Partial<AppError>);
  });

  it('creates a follow-up task and reads it back', async () => {
    const { repository, executor } = createExecutor();

    const resultRef = await executor.execute(
      actionWith('followup_task', {
        kind: 'followup_task',
        title: 'Confirm replacement',
        owner: 'support@example.com',
        dueAt: '2026-08-26T09:00:00.000Z',
        contextRef: orderId,
      }),
    );

    expect(repository.createFollowupTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Confirm replacement', owner: 'support@example.com' }),
    );
    expect(JSON.parse(resultRef)).toMatchObject({ kind: 'followup_task', taskId });
  });

  it('rejects the deferred stock_adjust and retire_product kinds', async () => {
    const { executor } = createExecutor();

    await expect(
      executor.execute(actionWith('stock_adjust', { kind: 'stock_adjust', productId: orderId, delta: -1 })),
    ).rejects.toMatchObject({ code: 'ACTION_KIND_NOT_SUPPORTED' } satisfies Partial<AppError>);

    await expect(
      executor.execute(actionWith('retire_product', { kind: 'retire_product', productId: orderId })),
    ).rejects.toMatchObject({ code: 'ACTION_KIND_NOT_SUPPORTED' } satisfies Partial<AppError>);
  });

  it('rejects unknown kinds', async () => {
    const { executor } = createExecutor();

    await expect(executor.execute(actionWith('unknown', { kind: 'unknown' }))).rejects.toMatchObject({
      code: 'ACTION_KIND_UNKNOWN',
    } satisfies Partial<AppError>);
  });
});
