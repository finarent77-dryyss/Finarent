-- Coordonnées bancaires (RIB) sur la fiche client.
-- "iban" et "bic" stockent une valeur chiffrée AES-256-GCM (lib/crypto.js),
-- jamais le numéro en clair.
-- Additive : colonnes nullables, aucune donnée existante n'est touchée.

ALTER TABLE "User" ADD COLUMN "iban" TEXT;
ALTER TABLE "User" ADD COLUMN "bic" TEXT;
ALTER TABLE "User" ADD COLUMN "bankHolder" TEXT;
ALTER TABLE "User" ADD COLUMN "bankUpdatedAt" TIMESTAMP(3);
