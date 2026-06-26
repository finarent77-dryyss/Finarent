-- Journal d'activité owner + assignation prospects aux centres d'appel
CREATE TABLE IF NOT EXISTS "AdminActivityLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AdminActivityLog_module_idx" ON "AdminActivityLog"("module");
CREATE INDEX IF NOT EXISTS "AdminActivityLog_actorId_idx" ON "AdminActivityLog"("actorId");
CREATE INDEX IF NOT EXISTS "AdminActivityLog_action_idx" ON "AdminActivityLog"("action");
CREATE INDEX IF NOT EXISTS "AdminActivityLog_createdAt_idx" ON "AdminActivityLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AdminActivityLog_entityType_entityId_idx" ON "AdminActivityLog"("entityType", "entityId");

DO $$ BEGIN
  ALTER TABLE "AdminActivityLog" ADD CONSTRAINT "AdminActivityLog_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "callCenterId" TEXT;
ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "assignedAgentId" TEXT;

CREATE INDEX IF NOT EXISTS "Prospect_callCenterId_idx" ON "Prospect"("callCenterId");
CREATE INDEX IF NOT EXISTS "Prospect_assignedAgentId_idx" ON "Prospect"("assignedAgentId");

DO $$ BEGIN
  ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_callCenterId_fkey"
    FOREIGN KEY ("callCenterId") REFERENCES "CallCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_assignedAgentId_fkey"
    FOREIGN KEY ("assignedAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
