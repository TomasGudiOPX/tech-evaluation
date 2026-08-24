import { describe, expect, it } from 'vitest';
import {
  correctActionInputSchema,
  decisionInputSchema,
  followupTaskActionPayloadSchema,
  interventionBriefSchema,
  interventionRecordSchema,
  noteActionPayloadSchema,
  pendingActionPayloadSchema,
  proposeActionInputSchema,
} from '@vps-template/contracts/actions';

const userId = '00000000-0000-4000-8000-000000000001';
const orderId = '00000000-0000-4000-8000-000000000002';
const productId = '00000000-0000-4000-8000-000000000003';

const validBrief = {
  title: 'Order exception: out-of-stock lamp',
  confirmedFacts: ['Order 123 contains one Minimal Desk Lamp', 'The lamp is out of stock'],
  sources: ['orders table', 'products table'],
  hypotheses: ['The customer will accept a follow-up'],
  risks: ['No confirmed contact channel'],
  pendingValidations: ['Confirm the customer note is authorized'],
  brief90s: 'A customer ordered a lamp that is now out of stock.',
  questions: ['Should we offer a substitution?'],
  candidateNextStep: 'Add a customer note and a follow-up task',
  desiredNextStep: 'Notify the customer of the delay',
  noFitCondition: 'No order or no out-of-stock item found',
};

const validRecord = {
  problem: 'Out-of-stock item in a placed order',
  process: 'order -> checkout -> fulfillment',
  impact: 'Customer waits without a status update',
  stakeholders: ['customer', 'support'],
  constraints: ['No financial mutation in slice 0'],
  commitments: ['Follow up within 2 days'],
  nextStep: 'Create a customer note and follow-up task',
  risks: ['Note contains unmasked personal data'],
  validations: ['Consent confirmed for the note'],
  sipoc: {
    suppliers: ['warehouse'],
    inputs: ['order'],
    process: ['pick', 'pack'],
    outputs: ['shipment'],
    customers: ['buyer'],
  },
};

describe('actions contracts', () => {
  describe('InterventionBrief', () => {
    it('accepts a valid brief', () => {
      expect(interventionBriefSchema.parse(validBrief)).toMatchObject({ title: validBrief.title });
    });

    it('rejects more than three hypotheses', () => {
      expect(() =>
        interventionBriefSchema.parse({
          ...validBrief,
          hypotheses: ['h1', 'h2', 'h3', 'h4'],
        }),
      ).toThrow();
    });

    it('rejects an empty facts list', () => {
      expect(() => interventionBriefSchema.parse({ ...validBrief, confirmedFacts: [] })).toThrow();
    });
  });

  describe('InterventionRecord', () => {
    it('accepts a valid record', () => {
      expect(interventionRecordSchema.parse(validRecord)).toMatchObject({ problem: validRecord.problem });
    });

    it('rejects a record without stakeholders', () => {
      expect(() => interventionRecordSchema.parse({ ...validRecord, stakeholders: [] })).toThrow();
    });

    it('rejects a record without a SIPOC', () => {
      const { sipoc, ...withoutSipoc } = validRecord;
      expect(() => interventionRecordSchema.parse(withoutSipoc)).toThrow();
    });
  });

  describe('PendingActionPayload union', () => {
    it('accepts a note payload', () => {
      const parsed = pendingActionPayloadSchema.parse({
        kind: 'note',
        userId,
        orderId,
        content: 'Customer prefers email updates.',
      });
      expect(parsed.kind).toBe('note');
      expect(noteActionPayloadSchema.parse(parsed).content).toBe('Customer prefers email updates.');
    });

    it('accepts a followup_task payload', () => {
      const parsed = pendingActionPayloadSchema.parse({
        kind: 'followup_task',
        title: 'Confirm replacement with customer',
        owner: 'support@example.com',
        dueAt: '2026-08-26T09:00:00.000Z',
        contextRef: orderId,
      });
      expect(followupTaskActionPayloadSchema.parse(parsed).owner).toBe('support@example.com');
    });

    it('accepts the deferred stock_adjust and retire_product payloads', () => {
      expect(pendingActionPayloadSchema.parse({ kind: 'stock_adjust', productId, delta: -2 }).kind).toBe(
        'stock_adjust',
      );
      expect(pendingActionPayloadSchema.parse({ kind: 'retire_product', productId }).kind).toBe('retire_product');
    });

    it('rejects an unknown kind', () => {
      expect(() => pendingActionPayloadSchema.parse({ kind: 'send_message', to: 'x' })).toThrow();
    });

    it('rejects a note with empty content', () => {
      expect(() => pendingActionPayloadSchema.parse({ kind: 'note', userId, content: '   ' })).toThrow();
    });

    it('rejects a followup_task with an invalid dueAt', () => {
      expect(() =>
        pendingActionPayloadSchema.parse({
          kind: 'followup_task',
          title: 'x',
          owner: 'a@b.c',
          dueAt: 'not-a-date',
        }),
      ).toThrow();
    });
  });

  describe('propose and decision schemas', () => {
    it('requires a payload to propose an action', () => {
      expect(() => proposeActionInputSchema.parse({})).toThrow();
      expect(proposeActionInputSchema.parse({ payload: { kind: 'note', userId, content: 'ok' } }).source).toBe('agent');
    });

    it('requires actionId and decidedBy for a decision', () => {
      expect(() => decisionInputSchema.parse({ actionId: 'nope' })).toThrow();
      expect(() => decisionInputSchema.parse({ decidedBy: 'support@example.com' })).toThrow();
      expect(
        decisionInputSchema.parse({ actionId: orderId, decidedBy: 'support@example.com', reason: 'ok' }).reason,
      ).toBe('ok');
    });

    it('requires a corrected payload for correct_action', () => {
      expect(() => correctActionInputSchema.parse({ actionId: orderId, decidedBy: 'support@example.com' })).toThrow();
      expect(
        correctActionInputSchema.parse({
          actionId: orderId,
          decidedBy: 'support@example.com',
          payload: { kind: 'note', userId, content: 'corrected' },
        }).payload.kind,
      ).toBe('note');
    });
  });
});
