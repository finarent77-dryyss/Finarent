-- Index de cles etrangeres absents des bases reelles.
--
-- CONSTAT (10 septembre 2026)
-- « init_v2 » cree bien ces index, mais aucune base ne les porte : la base de
-- production comme celle de developpement ont ete baties par « prisma db push »,
-- puis leurs migrations marquees appliquees sans avoir jamais ete executees.
-- L'historique disait donc qu'elles existaient ; la base disait le contraire.
--
-- CONSEQUENCE
-- Sans index sur "Application"."userId", tout affichage de l'espace client
-- parcourt la table entiere. Meme chose pour la messagerie ("Message"."applicationId",
-- "senderId"), les offres, et le filtrage par statut du back-office. Invisible
-- tant que les volumes sont faibles, penalisant des qu'ils montent.
--
-- Ces index sont declares dans schema.prisma depuis ce jour : sans cette
-- migration, ils y figureraient sans jamais exister en base.
--
-- « CREATE INDEX » pose un verrou en ecriture sur la table le temps de la
-- construction. Les volumes actuels le rendent instantane ; sur une base
-- volumineuse, il faudrait passer par CREATE INDEX CONCURRENTLY, hors
-- transaction, donc hors migration Prisma.

CREATE INDEX IF NOT EXISTS "Application_userId_idx"      ON "Application"("userId");
CREATE INDEX IF NOT EXISTS "Application_status_idx"      ON "Application"("status");
CREATE INDEX IF NOT EXISTS "Application_partnerId_idx"   ON "Application"("partnerId");
CREATE INDEX IF NOT EXISTS "Document_applicationId_idx"  ON "Document"("applicationId");
CREATE INDEX IF NOT EXISTS "Message_applicationId_idx"   ON "Message"("applicationId");
CREATE INDEX IF NOT EXISTS "Message_senderId_idx"        ON "Message"("senderId");
CREATE INDEX IF NOT EXISTS "Offer_applicationId_idx"     ON "Offer"("applicationId");
CREATE INDEX IF NOT EXISTS "Offer_partnerId_idx"         ON "Offer"("partnerId");
CREATE INDEX IF NOT EXISTS "Offer_status_idx"            ON "Offer"("status");
