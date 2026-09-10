-- Restaure les colonnes de la table "Application" disparues de la base.
--
-- La migration d'origine (20260226120000_init_v2) les creait bien :
--   "reference" TEXT NOT NULL, "userId" TEXT (nullable),
--   "email", "phone", "firstName", "lastName"
-- Elles ont ensuite disparu de la base ET de schema.prisma — signature d'un
-- "prisma db push" passe sur un schema ampute.
--
-- Consequence constatee en test : POST /api/financement echouait en 500 sur
-- findUnique({ where: { reference } }), et n'aurait de toute facon pas pu
-- ecrire email/phone/firstName/lastName. Le formulaire public de demande de
-- financement etait donc inoperant de bout en bout. Les memes champs sont lus
-- par l'admin (liste, kanban), l'espace client et les emails de confirmation.
--
-- Colonnes ajoutees en NULL : la route fournit systematiquement une valeur a
-- l'insertion.
--
-- IDEMPOTENCE — ajoutee le 10 septembre 2026.
-- Cette migration repare l'etat d'une base AMPUTEE. Sur une base neuve, batie
-- par init_v2, ces colonnes existent deja : le "ADD COLUMN" sec echouait alors
-- en 42701 ("column already exists") et cassait tout rejeu de la chaine depuis
-- zero — donc tout environnement de recette et toute restauration de
-- sauvegarde. Le meme fichier doit valoir pour les deux etats de base : reparer
-- ce qui manque, ne rien faire sur ce qui est deja sain.

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT IF EXISTS "Application_userId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "email" TEXT,
ADD COLUMN IF NOT EXISTS "firstName" TEXT,
ADD COLUMN IF NOT EXISTS "lastName" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "reference" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Application_reference_key" ON "Application"("reference");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
