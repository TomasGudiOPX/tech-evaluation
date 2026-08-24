CREATE TYPE "ActionStatus" AS ENUM ('proposed', 'approved', 'rejected', 'executed', 'failed');

CREATE TABLE "pending_actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kind" TEXT NOT NULL,
    "context_ref" TEXT,
    "payload" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "proposed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proposed_by" TEXT,
    "status" "ActionStatus" NOT NULL DEFAULT 'proposed',
    "decided_by" TEXT,
    "decided_at" TIMESTAMP(3),
    "decision" TEXT,
    "reason" TEXT,
    "result_ref" TEXT,
    "executed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_actions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customer_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "order_id" UUID,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "followup_tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "due_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "context_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "followup_tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pending_actions_status_idx" ON "pending_actions"("status");
CREATE INDEX "pending_actions_context_ref_idx" ON "pending_actions"("context_ref");
CREATE INDEX "customer_notes_user_id_idx" ON "customer_notes"("user_id");
CREATE INDEX "customer_notes_order_id_idx" ON "customer_notes"("order_id");
CREATE INDEX "followup_tasks_status_idx" ON "followup_tasks"("status");
CREATE INDEX "followup_tasks_context_ref_idx" ON "followup_tasks"("context_ref");

ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
