-- Dashboard performance: indexes manquants pour requêtes /api/admin|insurer|partner/stats

-- Application : filtrages par date / secteur / produit utilisés en groupBy & monthlyData
CREATE INDEX IF NOT EXISTS "Application_createdAt_idx"          ON "Application"("createdAt");
CREATE INDEX IF NOT EXISTS "Application_updatedAt_idx"          ON "Application"("updatedAt");
CREATE INDEX IF NOT EXISTS "Application_sector_idx"             ON "Application"("sector");
CREATE INDEX IF NOT EXISTS "Application_productType_idx"        ON "Application"("productType");
CREATE INDEX IF NOT EXISTS "Application_status_createdAt_idx"   ON "Application"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Application_status_updatedAt_idx"   ON "Application"("status", "updatedAt");

-- StatusHistory : groupBy & filtres par toStatus / fromStatus utilisés pour funnel & délais
CREATE INDEX IF NOT EXISTS "StatusHistory_toStatus_idx"             ON "StatusHistory"("toStatus");
CREATE INDEX IF NOT EXISTS "StatusHistory_fromStatus_toStatus_idx"  ON "StatusHistory"("fromStatus", "toStatus");

-- Commission : partner stats / timeline
CREATE INDEX IF NOT EXISTS "Commission_partnerId_idx"             ON "Commission"("partnerId");
CREATE INDEX IF NOT EXISTS "Commission_status_idx"                ON "Commission"("status");
CREATE INDEX IF NOT EXISTS "Commission_partnerId_status_idx"      ON "Commission"("partnerId", "status");
CREATE INDEX IF NOT EXISTS "Commission_partnerId_createdAt_idx"   ON "Commission"("partnerId", "createdAt");

-- Offer : SLA / today actions
CREATE INDEX IF NOT EXISTS "Offer_status_expiresAt_idx"  ON "Offer"("status", "expiresAt");
CREATE INDEX IF NOT EXISTS "Offer_status_sentAt_idx"     ON "Offer"("status", "sentAt");
