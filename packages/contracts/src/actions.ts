import { z } from 'zod';

// ---------------------------------------------------------------------------
// Action kinds and status (the approval ledger state machine)
// ---------------------------------------------------------------------------

export const actionKindSchema = z.enum(['note', 'followup_task', 'stock_adjust', 'retire_product']);
export const actionStatusSchema = z.enum(['proposed', 'approved', 'rejected', 'executed', 'failed']);
export const actionDecisionSchema = z.enum(['approve', 'reject', 'correct']);

export type ActionKind = z.infer<typeof actionKindSchema>;
export type ActionStatus = z.infer<typeof actionStatusSchema>;
export type ActionDecision = z.infer<typeof actionDecisionSchema>;

// ---------------------------------------------------------------------------
// InterventionBrief (the structured brief the agent drafts before any write)
// ---------------------------------------------------------------------------

export const interventionBriefSchema = z.object({
  title: z.string().trim().min(1).max(160),
  confirmedFacts: z.array(z.string().trim().min(1).max(1000)).min(1).max(20),
  sources: z.array(z.string().trim().min(1).max(500)).min(1).max(20),
  hypotheses: z.array(z.string().trim().min(1).max(500)).max(3),
  risks: z.array(z.string().trim().min(1).max(1000)).max(20),
  pendingValidations: z.array(z.string().trim().min(1).max(1000)).max(20),
  brief90s: z.string().trim().min(1).max(4000),
  questions: z.array(z.string().trim().min(1).max(500)).max(20),
  candidateNextStep: z.string().trim().min(1).max(1000),
  desiredNextStep: z.string().trim().min(1).max(1000),
  noFitCondition: z.string().trim().min(1).max(1000),
});

export type InterventionBrief = z.infer<typeof interventionBriefSchema>;

// ---------------------------------------------------------------------------
// InterventionRecord (structured evidence after authorized capture)
// ---------------------------------------------------------------------------

export const sipocSchema = z.object({
  suppliers: z.array(z.string().trim().min(1).max(500)).max(20),
  inputs: z.array(z.string().trim().min(1).max(500)).max(20),
  process: z.array(z.string().trim().min(1).max(500)).max(20),
  outputs: z.array(z.string().trim().min(1).max(500)).max(20),
  customers: z.array(z.string().trim().min(1).max(500)).max(20),
});

export const interventionRecordSchema = z.object({
  problem: z.string().trim().min(1).max(2000),
  process: z.string().trim().min(1).max(2000),
  impact: z.string().trim().min(1).max(2000),
  stakeholders: z.array(z.string().trim().min(1).max(500)).min(1).max(20),
  constraints: z.array(z.string().trim().min(1).max(1000)).max(20),
  commitments: z.array(z.string().trim().min(1).max(1000)).max(20),
  nextStep: z.string().trim().min(1).max(1000),
  risks: z.array(z.string().trim().min(1).max(1000)).max(20),
  validations: z.array(z.string().trim().min(1).max(1000)).max(20),
  sipoc: sipocSchema,
});

export type InterventionRecord = z.infer<typeof interventionRecordSchema>;

// ---------------------------------------------------------------------------
// PendingAction payload (discriminated union keyed on kind)
// ---------------------------------------------------------------------------

export const noteActionPayloadSchema = z.object({
  kind: z.literal('note'),
  userId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  content: z.string().trim().min(1).max(4000),
});

export const followupTaskActionPayloadSchema = z.object({
  kind: z.literal('followup_task'),
  title: z.string().trim().min(1).max(200),
  owner: z.string().trim().min(1).max(200),
  dueAt: z
    .string()
    .trim()
    .min(1)
    .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'dueAt must be a valid ISO datetime' }),
  contextRef: z.string().uuid().optional(),
});

export const stockAdjustActionPayloadSchema = z.object({
  kind: z.literal('stock_adjust'),
  productId: z.string().uuid(),
  delta: z.number().int(),
});

export const retireProductActionPayloadSchema = z.object({
  kind: z.literal('retire_product'),
  productId: z.string().uuid(),
});

export const pendingActionPayloadSchema = z.discriminatedUnion('kind', [
  noteActionPayloadSchema,
  followupTaskActionPayloadSchema,
  stockAdjustActionPayloadSchema,
  retireProductActionPayloadSchema,
]);

export type NoteActionPayload = z.infer<typeof noteActionPayloadSchema>;
export type FollowupTaskActionPayload = z.infer<typeof followupTaskActionPayloadSchema>;
export type StockAdjustActionPayload = z.infer<typeof stockAdjustActionPayloadSchema>;
export type RetireProductActionPayload = z.infer<typeof retireProductActionPayloadSchema>;
export type PendingActionPayload = z.infer<typeof pendingActionPayloadSchema>;

// ---------------------------------------------------------------------------
// Propose / decide request schemas
// ---------------------------------------------------------------------------

export const proposeActionInputSchema = z.object({
  payload: pendingActionPayloadSchema,
  contextRef: z.string().uuid().optional(),
  source: z.enum(['agent', 'human']).default('agent'),
  proposedBy: z.string().trim().max(200).optional(),
});

export const decisionInputSchema = z.object({
  actionId: z.string().uuid(),
  decidedBy: z.string().trim().min(1).max(200),
  reason: z.string().trim().max(1000).optional(),
});

export const correctActionInputSchema = z.object({
  actionId: z.string().uuid(),
  decidedBy: z.string().trim().min(1).max(200),
  reason: z.string().trim().max(1000).optional(),
  payload: pendingActionPayloadSchema,
});

export const getActionInputSchema = z.object({
  id: z.string().uuid(),
});

export const listActionsInputSchema = z.object({
  status: actionStatusSchema.optional(),
});

// ---------------------------------------------------------------------------
// Ledger row (response) and metrics schemas
// ---------------------------------------------------------------------------

export const pendingActionSchema = z.object({
  id: z.string().uuid(),
  kind: actionKindSchema,
  contextRef: z.string().nullable(),
  payload: z.unknown(),
  source: z.enum(['agent', 'human']),
  proposedAt: z.string(),
  proposedBy: z.string().nullable(),
  status: actionStatusSchema,
  decidedBy: z.string().nullable(),
  decidedAt: z.string().nullable(),
  decision: actionDecisionSchema.nullable(),
  reason: z.string().nullable(),
  resultRef: z.string().nullable(),
  executedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const pendingActionListResponseSchema = z.object({
  actions: z.array(pendingActionSchema),
});

export const pendingActionResponseSchema = z.object({
  action: pendingActionSchema,
});

export const actionMetricsSchema = z.object({
  total: z.number().int().min(0),
  byStatus: z.object({
    proposed: z.number().int().min(0),
    approved: z.number().int().min(0),
    rejected: z.number().int().min(0),
    executed: z.number().int().min(0),
    failed: z.number().int().min(0),
  }),
  byKind: z.record(z.string(), z.number().int().min(0)),
  proposedToApproved: z.number().int().min(0),
  approvedToExecuted: z.number().int().min(0),
});

export type PendingAction = z.infer<typeof pendingActionSchema>;
export type PendingActionListResponse = z.infer<typeof pendingActionListResponseSchema>;
export type PendingActionResponse = z.infer<typeof pendingActionResponseSchema>;
export type ProposeActionInput = z.infer<typeof proposeActionInputSchema>;
export type DecisionInput = z.infer<typeof decisionInputSchema>;
export type CorrectActionInput = z.infer<typeof correctActionInputSchema>;
export type ActionMetrics = z.infer<typeof actionMetricsSchema>;
