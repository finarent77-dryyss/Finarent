-- Rattrapage : creation des tables absentes de l'historique de migration.
--
-- Constat : 23 des 41 modeles du schema n'etaient crees par
-- aucune migration. Ils n'existaient en production que parce que
-- `prisma db push` les avait fabriques hors historique. Consequences :
--   - `prisma migrate deploy` echouait sur la premiere migration modifiant
--     une table jamais creee ("relation CallCenter does not exist"), ce qui
--     declenchait le repli `db push --accept-data-loss` du script de build
--     et effacait des colonnes ;
--   - la base ne pouvait pas etre reconstruite depuis le depot, ni en local,
--     ni en integration continue, ni pour une restauration.
--
-- Horodatage volontairement anterieur a 20260623220000_call_center_ringover_fields,
-- la premiere migration qui suppose ces tables presentes.
--
-- Tout est ecrit de facon rejouable : en production ces objets existent deja,
-- cette migration n'y fait rien. Sur une base neuve, elle les cree.

-- ═══ Types enumeres ═══
-- CREATE TYPE n'accepte pas IF NOT EXISTS : on absorbe le doublon.
DO $$ BEGIN
  CREATE TYPE "RgpdActionType" AS ENUM ('EXPORT', 'DELETE_ACCOUNT', 'RECTIFY', 'CONSENT_GRANT', 'CONSENT_REVOKE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE "ProspectStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE "AffiliateCommissionType" AS ENUM ('FIXED', 'PERCENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE "AffiliateCommissionStatus" AS ENUM ('PENDING', 'VALIDATED', 'PAID', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE "AffiliateFiscalStatus" AS ENUM ('PARTICULIER', 'MICRO', 'SOCIETE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE "AffiliateInviteStatus" AS ENUM ('SENT', 'CLICKED', 'CONVERTED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE "AffiliateInviteSource" AS ENUM ('AFFILIATE_PAGE', 'ADMIN_SINGLE', 'ADMIN_BULK');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE "CallCenterType" AS ENUM ('INTERNAL', 'EXTERNAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE "CallCenterMemberRole" AS ENUM ('MANAGER', 'AGENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══ Tables (23) ═══
CREATE TABLE IF NOT EXISTS "DocumentAccess" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "accessedById" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentAccess_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RgpdAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "action" "RgpdActionType" NOT NULL,
    "details" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RgpdAction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Newsletter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FAQ" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeEmail" TEXT NOT NULL,
    "refereeName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "paymentTerms" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "clientAddress" TEXT,
    "clientPostal" TEXT,
    "clientCity" TEXT,
    "clientSiret" TEXT,
    "userId" TEXT,
    "applicationId" TEXT,
    "totalHT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTVA" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTTC" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "pdfUrl" TEXT,
    "notes" TEXT,
    "sentAt" TIMESTAMP(3),
    "sentTo" TEXT,
    "archivedAt" TIMESTAMP(3),
    "stripePaymentLinkId" TEXT,
    "stripePaymentLinkUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InvoiceLine" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InvoicePayment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoicePayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CreditNote" (
    "id" TEXT NOT NULL,
    "creditNoteNumber" TEXT NOT NULL,
    "invoiceId" TEXT,
    "userId" TEXT,
    "reason" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "usedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "expiresAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "issuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Quote" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "userId" TEXT,
    "applicationId" TEXT,
    "companyName" TEXT,
    "companyAddress" TEXT,
    "companySiret" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "validUntil" TIMESTAMP(3) NOT NULL,
    "subtotalHT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTTC" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountPercent" DOUBLE PRECISION,
    "discountAmount" DOUBLE PRECISION,
    "paymentTerms" TEXT,
    "notes" TEXT,
    "sentAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "refusedAt" TIMESTAMP(3),
    "refusalReason" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "QuoteItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceHT" DOUBLE PRECISION NOT NULL,
    "totalHT" DOUBLE PRECISION NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SignatureRequest" (
    "id" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "requestedToId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'yousign',
    "providerRefId" TEXT,
    "signUrl" TEXT,
    "signatureData" TEXT,
    "signedAt" TIMESTAMP(3),
    "signedByIp" TEXT,
    "signedByUserAgent" TEXT,
    "documentHash" TEXT,
    "documentPath" TEXT,
    "consentText" TEXT,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "refusalReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignatureRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "headerColor" TEXT DEFAULT '#0A192F',
    "footerText" TEXT,
    "legalMentions" TEXT,
    "htmlTemplate" TEXT NOT NULL,
    "variables" JSONB NOT NULL DEFAULT '[]',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Prospect" (
    "id" TEXT NOT NULL,
    "anonId" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "name" TEXT,
    "company" TEXT,
    "status" "ProspectStatus" NOT NULL DEFAULT 'NEW',
    "source" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "referrer" TEXT,
    "landingPage" TEXT,
    "engagementScore" INTEGER NOT NULL DEFAULT 0,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "notes" TEXT,
    "assignedToId" TEXT,
    "convertedUserId" TEXT,
    "affiliateId" TEXT,
    "callCenterId" TEXT,
    "assignedAgentId" TEXT,
    "callAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastCallAt" TIMESTAMP(3),
    "lastCallOutcome" TEXT,
    "ringoverContactId" TEXT,
    "ringoverSyncedAt" TIMESTAMP(3),
    "brevoContactId" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProspectEvent" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "simulatorSlug" TEXT NOT NULL,
    "category" TEXT,
    "params" JSONB NOT NULL,
    "result" JSONB,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProspectEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Affiliate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "commissionType" "AffiliateCommissionType" NOT NULL DEFAULT 'FIXED',
    "commissionValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "publicStatsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "fiscalStatus" "AffiliateFiscalStatus",
    "legalName" TEXT,
    "siret" TEXT,
    "tvaNumber" TEXT,
    "tvaApplicable" BOOLEAN NOT NULL DEFAULT false,
    "fiscalAddress" TEXT,
    "fiscalPostalCode" TEXT,
    "fiscalCity" TEXT,
    "fiscalCountry" TEXT DEFAULT 'France',
    "mandateSignedAt" TIMESTAMP(3),
    "mandateSignedIp" TEXT,
    "mandateVersion" TEXT,
    "onboardingCompletedAt" TIMESTAMP(3),
    "onboardingToken" TEXT,
    "onboardingTokenExpiresAt" TIMESTAMP(3),
    "payoutMinAmount" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "iban" TEXT,
    "bic" TEXT,
    "payoutHolder" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Affiliate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AffiliateInvite" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "message" TEXT,
    "source" "AffiliateInviteSource" NOT NULL,
    "status" "AffiliateInviteStatus" NOT NULL DEFAULT 'SENT',
    "failedReason" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedAt" TIMESTAMP(3),
    "convertedProspectId" TEXT,
    "convertedApplicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateInvite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AffiliateClick" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "landingPath" TEXT,
    "referer" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateClick_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AffiliateCommission" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "AffiliateCommissionType" NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "AffiliateCommissionStatus" NOT NULL DEFAULT 'PENDING',
    "validatedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "payoutId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateCommission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CallCenter" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CallCenterType" NOT NULL DEFAULT 'INTERNAL',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "iban" TEXT,
    "commissionType" "AffiliateCommissionType" NOT NULL DEFAULT 'PERCENT',
    "commissionValue" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "ringoverPhoneNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "brevoMarketingListId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallCenter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CallCenterMember" (
    "id" TEXT NOT NULL,
    "callCenterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CallCenterMemberRole" NOT NULL DEFAULT 'AGENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallCenterMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CallCenterInteraction" (
    "id" TEXT NOT NULL,
    "callCenterId" TEXT,
    "agentId" TEXT,
    "prospectId" TEXT,
    "applicationId" TEXT,
    "channel" TEXT NOT NULL,
    "direction" TEXT,
    "outcome" TEXT,
    "durationSec" INTEGER,
    "notes" TEXT,
    "callbackAt" TIMESTAMP(3),
    "provider" TEXT NOT NULL DEFAULT 'MANUAL',
    "externalId" TEXT,
    "summary" TEXT,
    "subject" TEXT,
    "status" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallCenterInteraction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CallCenterCommission" (
    "id" TEXT NOT NULL,
    "callCenterId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "AffiliateCommissionType" NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "AffiliateCommissionStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallCenterCommission_pkey" PRIMARY KEY ("id")
);

-- ═══ Index (72) ═══
CREATE INDEX IF NOT EXISTS "DocumentAccess_documentId_createdAt_idx" ON "DocumentAccess"("documentId", "createdAt");
CREATE INDEX IF NOT EXISTS "DocumentAccess_accessedById_idx" ON "DocumentAccess"("accessedById");
CREATE INDEX IF NOT EXISTS "DocumentAccess_action_idx" ON "DocumentAccess"("action");
CREATE INDEX IF NOT EXISTS "RgpdAction_userId_createdAt_idx" ON "RgpdAction"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "RgpdAction_action_idx" ON "RgpdAction"("action");
CREATE UNIQUE INDEX IF NOT EXISTS "Newsletter_email_key" ON "Newsletter"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Referral_code_key" ON "Referral"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE INDEX IF NOT EXISTS "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX IF NOT EXISTS "Invoice_userId_idx" ON "Invoice"("userId");
CREATE INDEX IF NOT EXISTS "Invoice_applicationId_idx" ON "Invoice"("applicationId");
CREATE INDEX IF NOT EXISTS "Invoice_issueDate_idx" ON "Invoice"("issueDate");
CREATE INDEX IF NOT EXISTS "InvoiceLine_invoiceId_idx" ON "InvoiceLine"("invoiceId");
CREATE INDEX IF NOT EXISTS "InvoicePayment_invoiceId_idx" ON "InvoicePayment"("invoiceId");
CREATE INDEX IF NOT EXISTS "InvoicePayment_paidAt_idx" ON "InvoicePayment"("paidAt");
CREATE UNIQUE INDEX IF NOT EXISTS "CreditNote_creditNoteNumber_key" ON "CreditNote"("creditNoteNumber");
CREATE INDEX IF NOT EXISTS "CreditNote_invoiceId_idx" ON "CreditNote"("invoiceId");
CREATE INDEX IF NOT EXISTS "CreditNote_userId_idx" ON "CreditNote"("userId");
CREATE INDEX IF NOT EXISTS "CreditNote_status_idx" ON "CreditNote"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "Quote_quoteNumber_key" ON "Quote"("quoteNumber");
CREATE INDEX IF NOT EXISTS "Quote_status_idx" ON "Quote"("status");
CREATE INDEX IF NOT EXISTS "Quote_userId_idx" ON "Quote"("userId");
CREATE INDEX IF NOT EXISTS "Quote_applicationId_idx" ON "Quote"("applicationId");
CREATE INDEX IF NOT EXISTS "Quote_createdAt_idx" ON "Quote"("createdAt");
CREATE INDEX IF NOT EXISTS "QuoteItem_quoteId_idx" ON "QuoteItem"("quoteId");
CREATE UNIQUE INDEX IF NOT EXISTS "SignatureRequest_token_key" ON "SignatureRequest"("token");
CREATE INDEX IF NOT EXISTS "SignatureRequest_token_idx" ON "SignatureRequest"("token");
CREATE INDEX IF NOT EXISTS "SignatureRequest_documentType_documentId_idx" ON "SignatureRequest"("documentType", "documentId");
CREATE INDEX IF NOT EXISTS "SignatureRequest_requestedToId_idx" ON "SignatureRequest"("requestedToId");
CREATE INDEX IF NOT EXISTS "SignatureRequest_status_idx" ON "SignatureRequest"("status");
CREATE INDEX IF NOT EXISTS "DocumentTemplate_type_isDefault_idx" ON "DocumentTemplate"("type", "isDefault");
CREATE UNIQUE INDEX IF NOT EXISTS "Prospect_anonId_key" ON "Prospect"("anonId");
CREATE INDEX IF NOT EXISTS "Prospect_status_idx" ON "Prospect"("status");
CREATE INDEX IF NOT EXISTS "Prospect_lastSeenAt_idx" ON "Prospect"("lastSeenAt");
CREATE INDEX IF NOT EXISTS "Prospect_email_idx" ON "Prospect"("email");
CREATE INDEX IF NOT EXISTS "Prospect_affiliateId_idx" ON "Prospect"("affiliateId");
CREATE INDEX IF NOT EXISTS "Prospect_engagementScore_idx" ON "Prospect"("engagementScore");
CREATE INDEX IF NOT EXISTS "Prospect_utmSource_idx" ON "Prospect"("utmSource");
CREATE INDEX IF NOT EXISTS "Prospect_callCenterId_idx" ON "Prospect"("callCenterId");
CREATE INDEX IF NOT EXISTS "Prospect_assignedAgentId_idx" ON "Prospect"("assignedAgentId");
CREATE INDEX IF NOT EXISTS "ProspectEvent_prospectId_createdAt_idx" ON "ProspectEvent"("prospectId", "createdAt");
CREATE INDEX IF NOT EXISTS "ProspectEvent_simulatorSlug_idx" ON "ProspectEvent"("simulatorSlug");
CREATE UNIQUE INDEX IF NOT EXISTS "Affiliate_code_key" ON "Affiliate"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "Affiliate_email_key" ON "Affiliate"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Affiliate_onboardingToken_key" ON "Affiliate"("onboardingToken");
CREATE INDEX IF NOT EXISTS "Affiliate_isActive_idx" ON "Affiliate"("isActive");
CREATE INDEX IF NOT EXISTS "Affiliate_email_idx" ON "Affiliate"("email");
CREATE INDEX IF NOT EXISTS "Affiliate_onboardingCompletedAt_idx" ON "Affiliate"("onboardingCompletedAt");
CREATE INDEX IF NOT EXISTS "AffiliateInvite_affiliateId_sentAt_idx" ON "AffiliateInvite"("affiliateId", "sentAt");
CREATE INDEX IF NOT EXISTS "AffiliateInvite_recipientEmail_idx" ON "AffiliateInvite"("recipientEmail");
CREATE INDEX IF NOT EXISTS "AffiliateInvite_status_idx" ON "AffiliateInvite"("status");
CREATE INDEX IF NOT EXISTS "AffiliateClick_affiliateId_createdAt_idx" ON "AffiliateClick"("affiliateId", "createdAt");
CREATE INDEX IF NOT EXISTS "AffiliateCommission_affiliateId_status_idx" ON "AffiliateCommission"("affiliateId", "status");
CREATE INDEX IF NOT EXISTS "AffiliateCommission_status_createdAt_idx" ON "AffiliateCommission"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "AffiliateCommission_payoutId_idx" ON "AffiliateCommission"("payoutId");
CREATE UNIQUE INDEX IF NOT EXISTS "AffiliateCommission_applicationId_key" ON "AffiliateCommission"("applicationId");
CREATE UNIQUE INDEX IF NOT EXISTS "CallCenter_code_key" ON "CallCenter"("code");
CREATE INDEX IF NOT EXISTS "CallCenter_type_isActive_idx" ON "CallCenter"("type", "isActive");
CREATE INDEX IF NOT EXISTS "CallCenter_isActive_idx" ON "CallCenter"("isActive");
CREATE INDEX IF NOT EXISTS "CallCenterMember_userId_idx" ON "CallCenterMember"("userId");
CREATE INDEX IF NOT EXISTS "CallCenterMember_callCenterId_role_idx" ON "CallCenterMember"("callCenterId", "role");
CREATE UNIQUE INDEX IF NOT EXISTS "CallCenterMember_callCenterId_userId_key" ON "CallCenterMember"("callCenterId", "userId");
CREATE INDEX IF NOT EXISTS "CallCenterInteraction_callCenterId_createdAt_idx" ON "CallCenterInteraction"("callCenterId", "createdAt");
CREATE INDEX IF NOT EXISTS "CallCenterInteraction_agentId_createdAt_idx" ON "CallCenterInteraction"("agentId", "createdAt");
CREATE INDEX IF NOT EXISTS "CallCenterInteraction_prospectId_idx" ON "CallCenterInteraction"("prospectId");
CREATE INDEX IF NOT EXISTS "CallCenterInteraction_applicationId_idx" ON "CallCenterInteraction"("applicationId");
CREATE INDEX IF NOT EXISTS "CallCenterInteraction_outcome_idx" ON "CallCenterInteraction"("outcome");
CREATE INDEX IF NOT EXISTS "CallCenterInteraction_provider_occurredAt_idx" ON "CallCenterInteraction"("provider", "occurredAt");
CREATE INDEX IF NOT EXISTS "CallCenterInteraction_externalId_provider_idx" ON "CallCenterInteraction"("externalId", "provider");
CREATE UNIQUE INDEX IF NOT EXISTS "CallCenterCommission_applicationId_key" ON "CallCenterCommission"("applicationId");
CREATE INDEX IF NOT EXISTS "CallCenterCommission_callCenterId_status_idx" ON "CallCenterCommission"("callCenterId", "status");
CREATE INDEX IF NOT EXISTS "CallCenterCommission_status_createdAt_idx" ON "CallCenterCommission"("status", "createdAt");

-- Les cles etrangeres de ces tables sont posees a part, en fin d'historique :
-- certaines pointent vers des tables creees par des migrations posterieures
-- a celle-ci (AffiliatePayout, par exemple). Voir la migration
-- 20260908140000_rattrapage_cles_etrangeres.
