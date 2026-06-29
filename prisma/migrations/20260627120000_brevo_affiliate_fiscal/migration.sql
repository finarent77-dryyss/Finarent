-- Brevo, affiliation fiscal, EmailLog, Ringover/Brevo sync champs

-- Enums
DO $$ BEGIN
  CREATE TYPE "AffiliateFiscalStatus" AS ENUM ('PARTICULIER', 'MICRO', 'SOCIETE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "EmailLogStatus" AS ENUM ('SENT', 'DELIVERED', 'OPENED', 'BOUNCED', 'FAILED', 'COMPLAINED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "EmailLogType" AS ENUM ('OUTBOUND_CALL_CENTER', 'OUTBOUND_AFFILIATE', 'TRANSACTIONAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "AffiliateCommissionStatus" ADD VALUE IF NOT EXISTS 'VALIDATED';

-- Prospect
ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "brevoContactId" TEXT;

-- Affiliate fiscal
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "fiscalStatus" "AffiliateFiscalStatus";
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "legalName" TEXT;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "siret" TEXT;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "tvaNumber" TEXT;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "tvaApplicable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "fiscalAddress" TEXT;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "fiscalPostalCode" TEXT;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "fiscalCity" TEXT;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "fiscalCountry" TEXT DEFAULT 'France';
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "mandateSignedAt" TIMESTAMP(3);
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "mandateSignedIp" TEXT;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "mandateVersion" TEXT;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "onboardingCompletedAt" TIMESTAMP(3);
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "payoutMinAmount" DOUBLE PRECISION NOT NULL DEFAULT 20;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "iban" TEXT;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "bic" TEXT;
ALTER TABLE "Affiliate" ADD COLUMN IF NOT EXISTS "payoutHolder" TEXT;

CREATE INDEX IF NOT EXISTS "Affiliate_onboardingCompletedAt_idx" ON "Affiliate"("onboardingCompletedAt");

-- AffiliateCommission
ALTER TABLE "AffiliateCommission" ADD COLUMN IF NOT EXISTS "validatedAt" TIMESTAMP(3);
ALTER TABLE "AffiliateCommission" ADD COLUMN IF NOT EXISTS "payoutId" TEXT;
CREATE INDEX IF NOT EXISTS "AffiliateCommission_payoutId_idx" ON "AffiliateCommission"("payoutId");

-- CallCenterInteraction
ALTER TABLE "CallCenterInteraction" ADD COLUMN IF NOT EXISTS "subject" TEXT;
ALTER TABLE "CallCenterInteraction" ADD COLUMN IF NOT EXISTS "status" TEXT;

-- AffiliatePayout
CREATE TABLE IF NOT EXISTS "AffiliatePayout" (
  "id" TEXT NOT NULL,
  "affiliateId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "amountTTC" DOUBLE PRECISION,
  "reference" TEXT,
  "method" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
  "paidAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'COMPLETED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AffiliatePayout_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AffiliatePayout_affiliateId_createdAt_idx" ON "AffiliatePayout"("affiliateId", "createdAt");

-- AffiliateInvoice
CREATE TABLE IF NOT EXISTS "AffiliateInvoice" (
  "id" TEXT NOT NULL,
  "affiliateId" TEXT NOT NULL,
  "payoutId" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "amountHT" DOUBLE PRECISION NOT NULL,
  "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "vatAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "amountTTC" DOUBLE PRECISION NOT NULL,
  "fiscalSnapshot" JSONB NOT NULL,
  "pdfPath" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ISSUED',
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AffiliateInvoice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AffiliateInvoice_payoutId_key" ON "AffiliateInvoice"("payoutId");
CREATE UNIQUE INDEX IF NOT EXISTS "AffiliateInvoice_invoiceNumber_key" ON "AffiliateInvoice"("invoiceNumber");
CREATE INDEX IF NOT EXISTS "AffiliateInvoice_affiliateId_issuedAt_idx" ON "AffiliateInvoice"("affiliateId", "issuedAt");

-- AffiliateAuditLog
CREATE TABLE IF NOT EXISTS "AffiliateAuditLog" (
  "id" TEXT NOT NULL,
  "affiliateId" TEXT,
  "actorId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "action" TEXT NOT NULL,
  "reason" TEXT,
  "before" JSONB,
  "after" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AffiliateAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AffiliateAuditLog_affiliateId_createdAt_idx" ON "AffiliateAuditLog"("affiliateId", "createdAt");
CREATE INDEX IF NOT EXISTS "AffiliateAuditLog_entityType_entityId_idx" ON "AffiliateAuditLog"("entityType", "entityId");

-- EmailLog
CREATE TABLE IF NOT EXISTS "EmailLog" (
  "id" TEXT NOT NULL,
  "type" "EmailLogType" NOT NULL,
  "subject" TEXT NOT NULL,
  "recipientEmail" TEXT NOT NULL,
  "recipientName" TEXT,
  "status" "EmailLogStatus" NOT NULL DEFAULT 'SENT',
  "brevoMessageId" TEXT,
  "senderUserId" TEXT,
  "affiliateId" TEXT,
  "callCenterId" TEXT,
  "prospectId" TEXT,
  "source" TEXT,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deliveredAt" TIMESTAMP(3),
  "openedAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "errorMessage" TEXT,
  "metadata" JSONB,
  CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "EmailLog_brevoMessageId_idx" ON "EmailLog"("brevoMessageId");
CREATE INDEX IF NOT EXISTS "EmailLog_callCenterId_sentAt_idx" ON "EmailLog"("callCenterId", "sentAt");
CREATE INDEX IF NOT EXISTS "EmailLog_affiliateId_sentAt_idx" ON "EmailLog"("affiliateId", "sentAt");
CREATE INDEX IF NOT EXISTS "EmailLog_prospectId_idx" ON "EmailLog"("prospectId");
CREATE INDEX IF NOT EXISTS "EmailLog_recipientEmail_idx" ON "EmailLog"("recipientEmail");

-- FKs (idempotent)
DO $$ BEGIN
  ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_payoutId_fkey"
    FOREIGN KEY ("payoutId") REFERENCES "AffiliatePayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AffiliatePayout" ADD CONSTRAINT "AffiliatePayout_affiliateId_fkey"
    FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AffiliateInvoice" ADD CONSTRAINT "AffiliateInvoice_affiliateId_fkey"
    FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AffiliateInvoice" ADD CONSTRAINT "AffiliateInvoice_payoutId_fkey"
    FOREIGN KEY ("payoutId") REFERENCES "AffiliatePayout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AffiliateAuditLog" ADD CONSTRAINT "AffiliateAuditLog_affiliateId_fkey"
    FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AffiliateAuditLog" ADD CONSTRAINT "AffiliateAuditLog_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_senderUserId_fkey"
    FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_affiliateId_fkey"
    FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_callCenterId_fkey"
    FOREIGN KEY ("callCenterId") REFERENCES "CallCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_prospectId_fkey"
    FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
