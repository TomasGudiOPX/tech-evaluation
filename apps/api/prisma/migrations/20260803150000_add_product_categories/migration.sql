CREATE TYPE "ProductCategory" AS ENUM ('workspace', 'bags', 'kitchen', 'decor', 'wellness', 'travel');

ALTER TABLE "products" ADD COLUMN "category" "ProductCategory" NOT NULL DEFAULT 'workspace';

CREATE INDEX "products_category_idx" ON "products"("category");
