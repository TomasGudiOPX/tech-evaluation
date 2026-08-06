CREATE TABLE "reviews" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" VARCHAR(100) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "reviews_rating_check" CHECK ("rating" >= 1 AND "rating" <= 10),
  CONSTRAINT "reviews_comment_length_check" CHECK (char_length("comment") <= 100)
);

CREATE UNIQUE INDEX "reviews_product_id_user_id_key" ON "reviews"("product_id", "user_id");
CREATE INDEX "reviews_product_id_created_at_idx" ON "reviews"("product_id", "created_at");

ALTER TABLE "reviews"
  ADD CONSTRAINT "reviews_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "products"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviews"
  ADD CONSTRAINT "reviews_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
