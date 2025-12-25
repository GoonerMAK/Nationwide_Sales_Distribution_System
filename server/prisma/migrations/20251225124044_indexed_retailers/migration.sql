-- AlterTable
ALTER TABLE "Retailer" ALTER COLUMN "points" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Retailer_sales_representative_id_idx" ON "Retailer"("sales_representative_id");

-- CreateIndex
CREATE INDEX "Retailer_region_id_idx" ON "Retailer"("region_id");

-- CreateIndex
CREATE INDEX "Retailer_area_id_idx" ON "Retailer"("area_id");

-- CreateIndex
CREATE INDEX "Retailer_territory_id_idx" ON "Retailer"("territory_id");

-- CreateIndex
CREATE INDEX "Retailer_distributor_id_idx" ON "Retailer"("distributor_id");

-- CreateIndex
CREATE INDEX "Retailer_name_idx" ON "Retailer"("name");
