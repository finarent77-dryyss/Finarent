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
-- Colonnes ajoutees en NULL : la table ne contient qu'une ligne et la route
-- fournit systematiquement une valeur a l'insertion.
-- SQL genere par "prisma migrate diff" contre la base de production.

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_userId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "email" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "reference" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Application_reference_key" ON "Application"("reference");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
