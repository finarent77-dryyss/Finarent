-- Ringover + Brevo par centre, sync contacts prospects
ALTER TABLE "CallCenter" ADD COLUMN IF NOT EXISTS "ringoverPhoneNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "CallCenter" ADD COLUMN IF NOT EXISTS "brevoMarketingListId" INTEGER;

ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "ringoverContactId" TEXT;
ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "ringoverSyncedAt" TIMESTAMP(3);
