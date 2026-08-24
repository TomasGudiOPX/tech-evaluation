import { Injectable } from '@nestjs/common';
import { AppError } from '../../platform/app-error.js';
import { ActionRepository } from './action.repository.js';
import type { ActionRow } from './action.types.js';

/**
 * The only writer of business data in the supervised workflow. Maps an approved
 * `kind` + `payload` to a concrete write, reads the created entity back, and
 * returns a `resultRef` JSON string. Slice 0 supports `note` and `followup_task`;
 * `stock_adjust` and `retire_product` are defined in the ledger schema but
 * deferred to a later slice.
 */
@Injectable()
export class ActionExecutorService {
  constructor(private readonly repository: ActionRepository) {}

  async execute(action: ActionRow): Promise<string> {
    switch (action.kind) {
      case 'note':
        return this.executeNote(action.payload);
      case 'followup_task':
        return this.executeFollowupTask(action.payload);
      case 'stock_adjust':
      case 'retire_product':
        throw new AppError(501, 'ACTION_KIND_NOT_SUPPORTED', `Action kind '${action.kind}' is deferred to a later slice`);
      default:
        throw new AppError(400, 'ACTION_KIND_UNKNOWN', `Unknown action kind '${action.kind}'`);
    }
  }

  private async executeNote(payload: unknown): Promise<string> {
    const { userId, orderId, content } = payload as { userId?: string; orderId?: string; content?: string };

    if (!userId || typeof userId !== 'string') {
      throw new AppError(400, 'NOTE_USER_REQUIRED', 'A note action requires a userId');
    }
    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new AppError(400, 'NOTE_CONTENT_REQUIRED', 'A note action requires non-empty content');
    }
    if (!(await this.repository.userExists(userId))) {
      throw new AppError(404, 'NOTE_USER_NOT_FOUND', 'User not found for note');
    }
    const resolvedOrderId = orderId ?? null;
    if (resolvedOrderId && !(await this.repository.orderExists(resolvedOrderId))) {
      throw new AppError(404, 'NOTE_ORDER_NOT_FOUND', 'Order not found for note');
    }

    const created = await this.repository.createCustomerNote({ userId, orderId: resolvedOrderId, content });
    const readBack = await this.repository.findCustomerNote(created.id);

    return JSON.stringify({
      kind: 'note',
      noteId: readBack?.id ?? created.id,
      userId,
      orderId: resolvedOrderId,
      content: readBack?.content ?? content,
    });
  }

  private async executeFollowupTask(payload: unknown): Promise<string> {
    const { title, owner, dueAt, contextRef } = payload as {
      title?: string;
      owner?: string;
      dueAt?: string;
      contextRef?: string;
    };

    if (!title || !owner || !dueAt) {
      throw new AppError(400, 'TASK_FIELDS_REQUIRED', 'A followup_task requires title, owner, and dueAt');
    }

    const created = await this.repository.createFollowupTask({
      title,
      owner,
      dueAt: new Date(dueAt),
      contextRef: contextRef ?? null,
    });
    const readBack = await this.repository.findFollowupTask(created.id);

    return JSON.stringify({
      kind: 'followup_task',
      taskId: readBack?.id ?? created.id,
      title,
      owner,
      dueAt: readBack?.dueAt.toISOString() ?? dueAt,
      contextRef: contextRef ?? null,
    });
  }
}
