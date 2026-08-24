import type { ActionDecision, ActionKind, ActionStatus, PendingAction } from '@vps-template/contracts/actions';

export type ActionRow = {
  id: string;
  kind: string;
  contextRef: string | null;
  payload: unknown;
  source: string;
  proposedAt: Date;
  proposedBy: string | null;
  status: ActionStatus;
  decidedBy: string | null;
  decidedAt: Date | null;
  decision: string | null;
  reason: string | null;
  resultRef: string | null;
  executedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerNoteRow = {
  id: string;
  userId: string;
  orderId: string | null;
  content: string;
  createdAt: Date;
};

export type FollowupTaskRow = {
  id: string;
  title: string;
  owner: string;
  dueAt: Date;
  status: string;
  contextRef: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toPendingAction(row: ActionRow): PendingAction {
  return {
    id: row.id,
    kind: row.kind as ActionKind,
    contextRef: row.contextRef,
    payload: row.payload,
    source: row.source as PendingAction['source'],
    proposedAt: row.proposedAt.toISOString(),
    proposedBy: row.proposedBy,
    status: row.status,
    decidedBy: row.decidedBy,
    decidedAt: row.decidedAt ? row.decidedAt.toISOString() : null,
    decision: (row.decision as ActionDecision | null) ?? null,
    reason: row.reason,
    resultRef: row.resultRef,
    executedAt: row.executedAt ? row.executedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
