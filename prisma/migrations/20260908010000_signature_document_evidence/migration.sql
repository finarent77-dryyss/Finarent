-- Signature électronique simple : compléter les éléments de preuve.
--
-- La table SignatureRequest existait déjà (portée de SL Formations) avec
-- l'identité du signataire, l'horodatage, l'adresse IP et le navigateur.
-- Il lui manquait l'essentiel pour être opposable : de quoi prouver QUELLE
-- version du document a été signée. Identité + horodatage sans empreinte du
-- document ne permettent pas d'écarter la contestation « ce n'est pas ce que
-- j'ai signé ».
--
--   documentHash : empreinte SHA-256 du PDF présenté au signataire
--   documentPath : chemin du PDF figé, signature incluse, conservé en archive
--   consentText  : texte de consentement exact affiché au moment de signer

ALTER TABLE "SignatureRequest" ADD COLUMN IF NOT EXISTS "documentHash" TEXT;
ALTER TABLE "SignatureRequest" ADD COLUMN IF NOT EXISTS "documentPath" TEXT;
ALTER TABLE "SignatureRequest" ADD COLUMN IF NOT EXISTS "consentText"  TEXT;
