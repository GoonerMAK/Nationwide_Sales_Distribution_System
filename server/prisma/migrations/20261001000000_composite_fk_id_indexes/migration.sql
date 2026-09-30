CREATE INDEX "Retailer_sales_representative_id_id_idx" ON "Retailer"("sales_representative_id", "id");
CREATE INDEX "Retailer_region_id_id_idx" ON "Retailer"("region_id", "id");
CREATE INDEX "Retailer_area_id_id_idx" ON "Retailer"("area_id", "id");
CREATE INDEX "Retailer_territory_id_id_idx" ON "Retailer"("territory_id", "id");
CREATE INDEX "Retailer_distributor_id_id_idx" ON "Retailer"("distributor_id", "id");

CREATE INDEX "SalesRepresentative_region_id_id_idx" ON "SalesRepresentative"("region_id", "id");
CREATE INDEX "SalesRepresentative_area_id_id_idx" ON "SalesRepresentative"("area_id", "id");
CREATE INDEX "SalesRepresentative_territory_id_id_idx" ON "SalesRepresentative"("territory_id", "id");

DROP INDEX "Retailer_sales_representative_id_idx";
DROP INDEX "Retailer_region_id_idx";
DROP INDEX "Retailer_area_id_idx";
DROP INDEX "Retailer_territory_id_idx";
DROP INDEX "Retailer_distributor_id_idx";

DROP INDEX "SalesRepresentative_region_id_idx";
DROP INDEX "SalesRepresentative_area_id_idx";
DROP INDEX "SalesRepresentative_territory_id_idx";
