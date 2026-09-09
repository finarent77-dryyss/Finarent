import { prisma } from '@/lib/prisma';
import { archiverDocument, marquerTransmis } from './archive.js';
import { sendMail } from '../email/send.js';
import { templateDocumentGenere } from '../email/templates.js';

/**
 * Archive un document généré puis le transmet au client.
 *
 * C'est le point d'entrée unique à appeler depuis les routes qui produisent un
 * PDF. Il applique la règle métier demandée : tout document produit est
 * conservé côté admin ET envoyé par email — mais une seule fois.
 *
 * L'idempotence repose sur l'empreinte du contenu, pas sur un drapeau : un
 * admin qui rouvre une facture régénère un PDF au contenu identique, donc rien
 * ne repart. S'il corrige un montant, l'empreinte change, un nouvel exemplaire
 * est archivé et le client reçoit la version à jour. C'est exactement le
 * comportement attendu d'un document commercial.
 */

/**
 * @param {object} o
 * @param {Buffer} o.buffer            le PDF
 * @param {string} o.fileName
 * @param {string} o.kind              GeneratedDocumentKind
 * @param {string} [o.to]              destinataire ; sans lui, on archive seulement
 * @param {string} [o.reference]       numéro de dossier
 * @param {string} [o.numeroDocument]  numéro de facture / devis
 * @param {string} [o.montant]         déjà formaté pour l'affichage
 * @param {string} [o.messageComplementaire]
 * @param {string} [o.applicationId] @param {string} [o.invoiceId]
 * @param {string} [o.quoteId]       @param {string} [o.affiliateId]
 * @param {string} [o.userId]
 * @returns {Promise<{document: object, envoye: boolean, raison?: string}>}
 */
export async function archiverEtEnvoyerDocument({
  buffer,
  fileName,
  kind,
  to = null,
  reference = null,
  numeroDocument = null,
  montant = null,
  messageComplementaire = null,
  applicationId = null,
  invoiceId = null,
  quoteId = null,
  affiliateId = null,
  userId = null,
}) {
  const { document, nouveau } = await archiverDocument({
    prisma,
    buffer,
    fileName,
    kind,
    reference,
    applicationId,
    invoiceId,
    quoteId,
    affiliateId,
    userId,
    recipientEmail: to,
  });

  if (!to) return { document, envoye: false, raison: 'aucun destinataire' };
  if (!nouveau && document.emailSentAt) {
    return { document, envoye: false, raison: 'document identique déjà transmis' };
  }

  const { subject, html, text } = templateDocumentGenere({
    kind,
    reference,
    fileName,
    numeroDocument,
    montant,
    messageComplementaire,
  });

  const res = await sendMail({
    to,
    subject,
    html,
    text,
    attachments: [{ name: fileName, content: buffer }],
    log: {
      type: 'TRANSACTIONAL',
      source: 'DOCUMENT_' + kind,
      metadata: { reference, numeroDocument, documentId: document.id },
    },
  });

  if (res.sent) await marquerTransmis(prisma, document.id, res.emailLogId);
  return { document, envoye: res.sent, raison: res.sent ? undefined : res.error };
}

/**
 * Variante non bloquante, pour les routes qui doivent répondre immédiatement
 * (streaming d'un PDF au navigateur). L'archivage et l'envoi se poursuivent
 * en tâche de fond ; un échec est journalisé, jamais propagé à la réponse.
 */
export function archiverEtEnvoyerEnFond(options) {
  void archiverEtEnvoyerDocument(options).catch((e) =>
    console.error('[document] archivage/envoi échoué :', e.message),
  );
}
