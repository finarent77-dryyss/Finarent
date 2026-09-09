-- Archivage des documents générés (factures, devis, contrats, récapitulatifs).
-- Additive : aucune table existante n'est touchée.

CREATE TYPE "GeneratedDocumentKind" AS ENUM ('FACTURE', 'FACTURE_AFFILIE', 'DEVIS', 'CONTRAT', 'RECAP_DOSSIER', 'AUTRE');

CREATE TABLE "GeneratedDocument" (
    "id" TEXT NOT NULL,
    "kind" "GeneratedDocumentKind" NOT NULL,
    "reference" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "checksum" TEXT NOT NULL,
    "applicationId" TEXT,
    "invoiceId" TEXT,
    "quoteId" TEXT,
    "affiliateId" TEXT,
    "userId" TEXT,
    "recipientEmail" TEXT,
    "emailSentAt" TIMESTAMP(3),
    "emailLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GeneratedDocument_kind_createdAt_idx" ON "GeneratedDocument"("kind", "createdAt");
CREATE INDEX "GeneratedDocument_applicationId_idx" ON "GeneratedDocument"("applicationId");
CREATE INDEX "GeneratedDocument_invoiceId_idx" ON "GeneratedDocument"("invoiceId");
CREATE INDEX "GeneratedDocument_quoteId_idx" ON "GeneratedDocument"("quoteId");
CREATE INDEX "GeneratedDocument_checksum_idx" ON "GeneratedDocument"("checksum");
