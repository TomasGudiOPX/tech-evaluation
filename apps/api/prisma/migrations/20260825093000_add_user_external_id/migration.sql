ALTER TABLE "users" ADD COLUMN "external_id" TEXT;

CREATE UNIQUE INDEX "users_external_id_key" ON "users"("external_id");
