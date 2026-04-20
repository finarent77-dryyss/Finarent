-- Migration: Offers, Pre-scoring, SLA (April 2026)

-- Enum: OfferStatus
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REFUSED', 'EXPIRED', 'SIGNED');

-- Application: scoring fields
ALTER TABLE "Application"
  ADD COLUMN IF NOT EXISTS "scorePreQual" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "scoreLabel"   TEXT;

-- Table Offer
CREATE TABLE "Offer" (
  "id"              TEXT NOT NULL,
  "applicationId"   TEXT NOT NULL,
  "amount"          DOUBLE PRECISION NOT NULL,
  "durationMonths"  INTEGER NOT NULL,
  "monthlyPayment"  DOUBLE PRECISION NOT NULL,
  "rate"            DOUBLE PRECISION NOT NULL,
  "totalCost"       DOUBLE PRECISION NOT NULL,
  "partnerId"       TEXT,
  "conditions"      JSONB,
  "status"          "OfferStatus" NOT NULL DEFAULT 'DRAFT',
  "expiresAt"       TIMESTAMP(3) NOT NULL,
  "sentAt"          TIMESTAMP(3),
  "viewedAt"        TIMESTAMP(3),
  "acceptedAt"      TIMESTAMP(3),
  "signatureUrl"    TEXT,
  "signedAt"        TIMESTAMP(3),
  "createdBy"       TEXT NOT NULL,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Offer"
  ADD CONSTRAINT "Offer_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Offer"
  ADD CONSTRAINT "Offer_partnerId_fkey"
  FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Offer_applicationId_idx" ON "Offer"("applicationId");
CREATE INDEX "Offer_partnerId_idx"     ON "Offer"("partnerId");
CREATE INDEX "Offer_status_idx"        ON "Offer"("status");
