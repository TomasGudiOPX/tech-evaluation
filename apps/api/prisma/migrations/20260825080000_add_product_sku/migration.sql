ALTER TABLE "products" ADD COLUMN "sku" TEXT;

CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
