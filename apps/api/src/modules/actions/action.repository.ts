import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ActionStatus } from '@vps-template/contracts/actions';
import { PrismaService } from '../../platform/prisma.service.js';
import type { ActionRow, CustomerNoteRow, FollowupTaskRow } from './action.types.js';

export type PendingActionCreate = {
  kind: string;
  contextRef: string | null;
  payload: unknown;
  source: string;
  proposedBy: string | null;
};

export type DecisionUpdate = {
  status: ActionStatus;
  decidedBy: string;
  decidedAt: Date;
  decision: string;
  reason: string | null;
  payload?: unknown;
};

@Injectable()
export class ActionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPendingAction(data: PendingActionCreate): Promise<ActionRow> {
    return this.prisma.pendingAction.create({
      data: {
        kind: data.kind,
        contextRef: data.contextRef,
        payload: data.payload as Prisma.InputJsonValue,
        source: data.source,
        proposedBy: data.proposedBy,
      },
    });
  }

  async findById(id: string): Promise<ActionRow | null> {
    return this.prisma.pendingAction.findUnique({ where: { id } });
  }

  async list(status?: string): Promise<ActionRow[]> {
    return this.prisma.pendingAction.findMany({
      where: status ? { status: status as ActionStatus } : {},
      orderBy: { proposedAt: 'desc' },
    });
  }

  async recordDecision(id: string, data: DecisionUpdate): Promise<ActionRow> {
    return this.prisma.pendingAction.update({
      where: { id },
      data: {
        status: data.status,
        decidedBy: data.decidedBy,
        decidedAt: data.decidedAt,
        decision: data.decision,
        reason: data.reason,
        ...(data.payload !== undefined ? { payload: data.payload as Prisma.InputJsonValue } : {}),
      },
    });
  }

  async markExecuted(id: string, resultRef: string, executedAt: Date): Promise<ActionRow> {
    return this.prisma.pendingAction.update({
      where: { id },
      data: { status: 'executed', resultRef, executedAt },
    });
  }

  async markFailed(id: string, reason: string): Promise<ActionRow> {
    return this.prisma.pendingAction.update({
      where: { id },
      data: { status: 'failed', reason },
    });
  }

  async userExists(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
    return user !== null;
  }

  async orderExists(id: string): Promise<boolean> {
    const order = await this.prisma.order.findUnique({ where: { id }, select: { id: true } });
    return order !== null;
  }

  async createCustomerNote(data: { userId: string; orderId: string | null; content: string }): Promise<CustomerNoteRow> {
    return this.prisma.customerNote.create({
      data: { userId: data.userId, orderId: data.orderId, content: data.content },
    });
  }

  async findCustomerNote(id: string): Promise<CustomerNoteRow | null> {
    return this.prisma.customerNote.findUnique({ where: { id } });
  }

  async createFollowupTask(data: {
    title: string;
    owner: string;
    dueAt: Date;
    contextRef: string | null;
  }): Promise<FollowupTaskRow> {
    return this.prisma.followupTask.create({
      data: { title: data.title, owner: data.owner, dueAt: data.dueAt, contextRef: data.contextRef },
    });
  }

  async findFollowupTask(id: string): Promise<FollowupTaskRow | null> {
    return this.prisma.followupTask.findUnique({ where: { id } });
  }

  async countByStatus(): Promise<Array<{ status: string; count: number }>> {
    const grouped = await this.prisma.pendingAction.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    return grouped.map((entry) => ({ status: entry.status, count: entry._count._all }));
  }

  async countByKind(): Promise<Array<{ kind: string; count: number }>> {
    const grouped = await this.prisma.pendingAction.groupBy({
      by: ['kind'],
      _count: { _all: true },
    });
    return grouped.map((entry) => ({ kind: entry.kind, count: entry._count._all }));
  }
}
