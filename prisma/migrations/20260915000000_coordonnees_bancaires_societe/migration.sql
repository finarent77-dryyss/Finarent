-- Coordonnees bancaires de Finarent, saisies dans Admin > Parametres.
--
-- Le RIB imprime en pied de facture et utilise comme compte debiteur des
-- virements SEPA etait ecrit en dur dans lib/invoicing/company.js, sous forme
-- de gabarit (IBAN a zeros, BIC XXXX). Il vit desormais dans cette table, qui
-- ne compte qu'une ligne (id « finarent »). Tant qu'elle est vide, le gabarit
-- s'applique et l'envoi des factures comme l'export SEPA restent refuses.
--
-- Migration purement additive : aucune table existante n'est modifiee.
CREATE TABLE IF NOT EXISTS "CompanyBankDetails" (
    "id" TEXT NOT NULL DEFAULT 'finarent',
    "bankName" TEXT NOT NULL,
    "holder" TEXT,
    "iban" TEXT NOT NULL,
    "bic" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyBankDetails_pkey" PRIMARY KEY ("id")
);
