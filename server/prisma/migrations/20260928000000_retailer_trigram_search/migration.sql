-- pg_trgm powers GIN indexes for `contains` (ILIKE/LIKE '%x%') searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX "Retailer_name_trgm_idx" ON "Retailer" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Retailer_phone_trgm_idx" ON "Retailer" USING GIN ("phone" gin_trgm_ops);
