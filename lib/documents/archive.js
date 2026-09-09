import { uploadFile } from '../storage.js';
import { empreinteDocument } from '../signature.js';

/**
 * Archivage des documents générés par l'application.
 *
 * Avant ce module, chaque PDF (facture, devis, contrat, récapitulatif) était
 * fabriqué à la volée puis streamé au navigateur. Rien n'était conservé :
 * impossible de rejouer ce qui avait été transmis à un client, ni de prouver
 * qu'il l'avait reçu. Or un courtier doit pouvoir produire, des années après,
 * la pièce exacte qu'il a envoyée.
 *
 * Deux garanties portées ici :
 *
 *   1. Tout document généré est écrit dans le stockage objet et référencé en
 *      base (`GeneratedDocument`), rangé sous le numéro de dossier.
 *   2. L'empreinte SHA-256 du contenu sert de garde-fou : régénérer un PDF
 *      identique ne crée pas de doublon et ne redéclenche pas d'email. Sans
 *      cela, un admin qui ouvre trois fois une facture enverrait trois emails
 *      au client.
 */

/**
 * Emplacement de rangement dans le stockage objet.
 *
 * On préfère le numéro de dossier à l'identifiant technique : les fichiers
 * d'un même dossier se retrouvent groupés, lisibles depuis la console Cellar.
 * `uploadFile` refuse tout ce qui sort de [A-Za-z0-9_-], ce que respectent nos
 * références (FIN-2026-00412) comme les cuid.
 */
function emplacement({ reference, applicationId, invoiceId, quoteId, affiliateId }) {
  const brut = reference || applicationId || invoiceId || quoteId || affiliateId || 'divers';
  const nettoye = String(brut).replace(/[^a-zA-Z0-9_-]/g, '-');
  return nettoye || 'divers';
}

/**
 * Écrit un document dans le stockage et le référence en base.
 *
 * @param {object} o
 * @param {Buffer} o.buffer
 * @param {string} o.fileName
 * @param {string} o.kind            GeneratedDocumentKind
 * @param {string} [o.reference]     numéro de dossier
 * @param {string} [o.mimeType]
 * @param {string} [o.applicationId]
 * @param {string} [o.invoiceId]
 * @param {string} [o.quoteId]
 * @param {string} [o.affiliateId]
 * @param {string} [o.userId]
 * @param {string} [o.recipientEmail]
 * @param {import('@prisma/client').PrismaClient} o.prisma
 * @returns {Promise<{document: object, nouveau: boolean}>}
 *          `nouveau` vaut false si un document au contenu identique était déjà
 *          archivé pour la même entité — l'appelant s'abstient alors de
 *          renvoyer un email.
 */
export async function archiverDocument({
  prisma,
  buffer,
  fileName,
  kind,
  reference = null,
  mimeType = 'application/pdf',
  applicationId = null,
  invoiceId = null,
  quoteId = null,
  affiliateId = null,
  userId = null,
  recipientEmail = null,
}) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('archiverDocument : buffer vide');
  }

  const checksum = empreinteDocument(buffer);

  // Même contenu, même rattachement : on ne duplique pas.
  const existant = await prisma.generatedDocument.findFirst({
    where: { checksum, applicationId, invoiceId, quoteId, affiliateId },
    orderBy: { createdAt: 'desc' },
  });
  if (existant) return { document: existant, nouveau: false };

  const { path } = await uploadFile(buffer, fileName, mimeType, emplacement({
    reference, applicationId, invoiceId, quoteId, affiliateId,
  }));

  const document = await prisma.generatedDocument.create({
    data: {
      kind,
      reference,
      fileName,
      filePath: path,
      fileSize: buffer.length,
      mimeType,
      checksum,
      applicationId,
      invoiceId,
      quoteId,
      affiliateId,
      userId,
      recipientEmail,
    },
  });

  return { document, nouveau: true };
}

/** Marque un document comme transmis, après envoi effectif de l'email. */
export async function marquerTransmis(prisma, documentId, emailLogId) {
  return prisma.generatedDocument.update({
    where: { id: documentId },
    data: { emailSentAt: new Date(), emailLogId: emailLogId || null },
  });
}
