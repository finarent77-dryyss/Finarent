-- Rattrapage : colonnes, valeurs d'enumeration et index jamais capturés par une migration.
--
-- CONSTAT (10 septembre 2026)
-- Rejouee depuis une base vide, la chaine de migrations ne reconstituait pas
-- schema.prisma : valeurs d'enumeration absentes, colonnes renommees, index
-- perdus. Ces evolutions avaient ete appliquees a la base reelle par
-- « prisma db push » sans jamais etre ecrites dans une migration. La base de
-- production etait donc juste, et l'historique faux — d'ou l'impossibilite de
-- monter un environnement de recette ou de restaurer une sauvegarde.
--
-- IDEMPOTENCE
-- Ce fichier doit valoir pour deux etats de base opposes : une base neuve, ou
-- il applique reellement les changements ; une base existante (production,
-- developpement), ou tout est deja en place et ou il ne doit rien faire.
-- Chaque instruction est donc gardee.
--
-- RENOMMAGES
-- "Document.uploadedBy" -> "uploadedById" et "StatusHistory.changedBy" ->
-- "changedById" sont traites comme des RENOMMAGES, pas comme un DROP suivi d'un
-- ADD. C'est ce que « prisma migrate diff » proposait, et cela aurait efface la
-- colonne — donc l'auteur de chaque piece deposee et de chaque changement de
-- statut — sur toute base ou l'ancienne colonne subsiste encore.

-- ---------------------------------------------------------------------------
-- 1. Valeurs d'enumeration
-- ---------------------------------------------------------------------------
ALTER TYPE "ProductType" ADD VALUE IF NOT EXISTS 'LLD';
ALTER TYPE "ProductType" ADD VALUE IF NOT EXISTS 'LEASING_OPS';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PARTNER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'INSURER';

-- ---------------------------------------------------------------------------
-- 2. Renommages (avec conservation des donnees)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'Document' AND column_name = 'uploadedBy')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_schema = 'public' AND table_name = 'Document' AND column_name = 'uploadedById') THEN
    ALTER TABLE "Document" RENAME COLUMN "uploadedBy" TO "uploadedById";
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'StatusHistory' AND column_name = 'changedBy')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_schema = 'public' AND table_name = 'StatusHistory' AND column_name = 'changedById') THEN
    ALTER TABLE "StatusHistory" RENAME COLUMN "changedBy" TO "changedById";
  END IF;
END $$;

-- Les contraintes et index heritent du renommage en gardant leur ANCIEN nom :
-- on les retire pour les recreer sous le nom attendu. schema.prisma ne declare
-- plus de relation sur ces deux colonnes, les cles etrangeres ne sont donc pas
-- recreees.
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_uploadedBy_fkey";
ALTER TABLE "StatusHistory" DROP CONSTRAINT IF EXISTS "StatusHistory_changedBy_fkey";
DROP INDEX IF EXISTS "Document_uploadedBy_idx";
DROP INDEX IF EXISTS "StatusHistory_changedBy_idx";

-- ---------------------------------------------------------------------------
-- 3. Colonnes
-- ---------------------------------------------------------------------------
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "affiliateId" TEXT,
                          ADD COLUMN IF NOT EXISTS "callCenterId" TEXT;
ALTER TABLE "Application" ALTER COLUMN "reference" DROP NOT NULL,
                          ALTER COLUMN "siren" DROP NOT NULL,
                          ALTER COLUMN "companyName" DROP NOT NULL,
                          ALTER COLUMN "sector" DROP NOT NULL,
                          ALTER COLUMN "email" DROP NOT NULL,
                          ALTER COLUMN "phone" DROP NOT NULL;

ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
                       ADD COLUMN IF NOT EXISTS "deletedById" TEXT,
                       ADD COLUMN IF NOT EXISTS "uploadedById" TEXT;
ALTER TABLE "Document" ALTER COLUMN "type" SET DEFAULT 'AUTRE';

ALTER TABLE "StatusHistory" ADD COLUMN IF NOT EXISTS "changedById" TEXT;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3),
                   ADD COLUMN IF NOT EXISTS "partnerId" TEXT,
                   ADD COLUMN IF NOT EXISTS "referralCode" TEXT;

-- schema.prisma declare ces deux colonnes obligatoires. On echoue FRANCHEMENT
-- si des lignes orphelines l'empechent, plutot que de laisser le schema diverger
-- en silence : le message dit quoi corriger.
DO $$
DECLARE orphelines INTEGER;
BEGIN
  SELECT count(*) INTO orphelines FROM "Document" WHERE "uploadedById" IS NULL;
  IF orphelines > 0 THEN
    RAISE EXCEPTION 'Document.uploadedById : % ligne(s) sans auteur. Renseignez-les avant de rejouer cette migration.', orphelines;
  END IF;
  ALTER TABLE "Document" ALTER COLUMN "uploadedById" SET NOT NULL;

  SELECT count(*) INTO orphelines FROM "StatusHistory" WHERE "changedById" IS NULL;
  IF orphelines > 0 THEN
    RAISE EXCEPTION 'StatusHistory.changedById : % ligne(s) sans auteur. Renseignez-les avant de rejouer cette migration.', orphelines;
  END IF;
  ALTER TABLE "StatusHistory" ALTER COLUMN "changedById" SET NOT NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Index
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "Application_callCenterId_idx" ON "Application"("callCenterId");
CREATE INDEX IF NOT EXISTS "Application_affiliateId_idx" ON "Application"("affiliateId");
CREATE INDEX IF NOT EXISTS "Document_deletedAt_idx" ON "Document"("deletedAt");
CREATE INDEX IF NOT EXISTS "Document_uploadedById_idx" ON "Document"("uploadedById");
CREATE INDEX IF NOT EXISTS "StatusHistory_changedById_idx" ON "StatusHistory"("changedById");
CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode");

-- ---------------------------------------------------------------------------
-- 5. Cles etrangeres (retirees puis recreees : « ADD CONSTRAINT » n'a pas de
--    variante IF NOT EXISTS)
-- ---------------------------------------------------------------------------
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_partnerId_fkey";
ALTER TABLE "User" ADD CONSTRAINT "User_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Application" DROP CONSTRAINT IF EXISTS "Application_affiliateId_fkey";
ALTER TABLE "Application" ADD CONSTRAINT "Application_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Application" DROP CONSTRAINT IF EXISTS "Application_callCenterId_fkey";
ALTER TABLE "Application" ADD CONSTRAINT "Application_callCenterId_fkey" FOREIGN KEY ("callCenterId") REFERENCES "CallCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
