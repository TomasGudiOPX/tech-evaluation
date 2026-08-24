import { Injectable } from '@nestjs/common';
import type { ActionMetrics, PendingAction } from '@vps-template/contracts/actions';
import {
  correctActionInputSchema,
  decisionInputSchema,
  proposeActionInputSchema,
} from '@vps-template/contracts/actions';
import { AppError } from '../../platform/app-error.js';
import { ActionExecutorService } from './action.executor.js';
import { ActionRepository } from './action.repository.js';
import { toPendingAction } from './action.types.js';

@Injectable()
export class ActionService {
  constructor(
    private readonly repository: ActionRepository,
    private readonly executor: ActionExecutorService,
  ) {}

  async propose(input: unknown): Promise<PendingAction> {
    const parsed = proposeActionInputSchema.parse(input);
    const row = await this.repository.createPendingAction({
      kind: parsed.payload.kind,
      contextRef: parsed.contextRef ?? null,
      payload: parsed.payload,
      source: parsed.source,
      proposedBy: parsed.proposedBy ?? null,
    });

    return toPendingAction(row);
  }

  async list(status?: string): Promise<PendingAction[]> {
    return (await this.repository.list(status)).map(toPendingAction);
  }

  async get(id: string): Promise<PendingAction> {
    const action = await this.repository.findById(id);

    if (!action) {
      throw new AppError(404, 'ACTION_NOT_FOUND', 'Action not found');
    }

    return toPendingAction(action);
  }

  async approve(input: unknown): Promise<PendingAction> {
    const parsed = decisionInputSchema.parse(input);
    const action = await this.requireProposed(parsed.actionId);

    await this.repository.recordDecision(parsed.actionId, {
      status: 'approved',
      decidedBy: parsed.decidedBy,
      decidedAt: new Date(),
      decision: 'approve',
      reason: parsed.reason ?? null,
    });

    try {
      const resultRef = await this.executor.execute(action);
      return toPendingAction(await this.repository.markExecuted(parsed.actionId, resultRef, new Date()));
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Execution failed';
      await this.repository.markFailed(parsed.actionId, reason);
      return toPendingAction((await this.repository.findById(parsed.actionId))!);
    }
  }

  async reject(input: unknown): Promise<PendingAction> {
    const parsed = decisionInputSchema.parse(input);
    await this.requireProposed(parsed.actionId);

    const row = await this.repository.recordDecision(parsed.actionId, {
      status: 'rejected',
      decidedBy: parsed.decidedBy,
      decidedAt: new Date(),
      decision: 'reject',
      reason: parsed.reason ?? null,
    });

    return toPendingAction(row);
  }

  async correct(input: unknown): Promise<PendingAction> {
    const parsed = correctActionInputSchema.parse(input);
    await this.requireProposed(parsed.actionId);

    const row = await this.repository.recordDecision(parsed.actionId, {
      status: 'proposed',
      decidedBy: parsed.decidedBy,
      decidedAt: new Date(),
      decision: 'correct',
      reason: parsed.reason ?? null,
      payload: parsed.payload,
    });

    return toPendingAction(row);
  }

  async metrics(): Promise<ActionMetrics> {
    const [byStatus, byKind] = await Promise.all([this.repository.countByStatus(), this.repository.countByKind()]);

    const statusCounts = { proposed: 0, approved: 0, rejected: 0, executed: 0, failed: 0 };
    for (const { status, count } of byStatus) {
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts] = count;
      }
    }

    const byKindMap: Record<string, number> = {};
    for (const { kind, count } of byKind) {
      byKindMap[kind] = count;
    }

    return {
      total: byStatus.reduce((sum, entry) => sum + entry.count, 0),
      byStatus: statusCounts,
      byKind: byKindMap,
      // Counts (not ratios) in slice 0: proposals that crossed the human gate,
      // and approvals that reached a successful execution.
      proposedToApproved: statusCounts.approved + statusCounts.executed,
      approvedToExecuted: statusCounts.executed,
    };
  }

  private async requireProposed(id: string) {
    const action = await this.repository.findById(id);

    if (!action) {
      throw new AppError(404, 'ACTION_NOT_FOUND', 'Action not found');
    }
    if (action.status !== 'proposed') {
      throw new AppError(409, 'ACTION_NOT_PROPOSED', `Action is already ${action.status}`);
    }

    return action;
  }
}
