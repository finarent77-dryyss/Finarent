/**
 * Emails applicatifs Finarent.
 *
 * Ce module ne contient plus ni HTML ni transport : il se contente de choisir
 * le template (`lib/email/templates.js`) et de déléguer l'envoi au dispatcher
 * (`lib/email/send.js`, Brevo puis repli SMTP). Toute la mise en forme vit
 * dans la charte `lib/email/charter.js`.
 */

import { sendMail, isMailConfigured } from './email/send.js';
import {
  templateConfirmationDemande,
  templateAlerteAdmin,
  templateDocumentRecu,
  templateDocumentsManquants,
  templateInvitationAffilie,
  templateStatutDemande,
} from './email/templates.js';

function baseUrl() {
  return process.env.APP_BASE_URL || 'https://finarent.com';
}

export { isMailConfigured };

/** Confirmation client après soumission d'une demande de financement. */
export async function sendConfirmationDemande({ to, reference, companyName }) {
  const { subject, html, text } = templateConfirmationDemande({
    reference,
    companyName,
    baseUrl: baseUrl(),
  });
  return sendMail({
    to,
    subject,
    html,
    text,
    log: { type: 'TRANSACTIONAL', source: 'DEMANDE_CONFIRMATION', metadata: { reference } },
  });
}

/** Alerte interne : nouvelle demande reçue. */
export async function sendAlerteAdmin({ reference, companyName, productType, amount, email }) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!adminEmail) return { sent: false, error: 'ADMIN_EMAIL non configuré' };

  const { subject, html, text } = templateAlerteAdmin({
    reference,
    companyName,
    productType,
    amount,
    email,
    baseUrl: baseUrl(),
  });
  return sendMail({
    to: adminEmail,
    subject,
    html,
    text,
    replyTo: email,
    log: { type: 'TRANSACTIONAL', source: 'ALERTE_ADMIN', metadata: { reference } },
  });
}

/** Notification client : document reçu et enregistré. */
export async function sendDocumentReceived({ to, fileName, documentType, reference }) {
  const { subject, html, text } = templateDocumentRecu({
    reference,
    fileName,
    documentType,
    baseUrl: baseUrl(),
  });
  return sendMail({
    to,
    subject,
    html,
    text,
    log: { type: 'TRANSACTIONAL', source: 'DOCUMENT_RECU', metadata: { reference, fileName } },
  });
}

/** Relance documents manquants (déclenchée par le cron de relance). */
export async function sendDocumentsMissing({ to, reference, missingDocs = [] }) {
  const { subject, html, text } = templateDocumentsManquants({
    reference,
    missingDocs,
    baseUrl: baseUrl(),
  });
  return sendMail({
    to,
    subject,
    html,
    text,
    log: { type: 'TRANSACTIONAL', source: 'DOCUMENTS_MANQUANTS', metadata: { reference, missingDocs } },
  });
}

/**
 * Invitation / parrainage envoyée au nom d'un affilié.
 *
 * `replyTo` reste l'adresse Finarent et jamais celle de l'affilié : son email
 * personnel n'a pas à être exposé au destinataire.
 */
export async function sendAffiliateInvite({ to, recipientName, affiliateName, affiliateCode, message, affiliateId }) {
  const { subject, html, text } = templateInvitationAffilie({
    to,
    recipientName,
    affiliateName,
    affiliateCode,
    message,
    baseUrl: baseUrl(),
  });
  return sendMail({
    to,
    subject,
    html,
    text,
    commercial: true,
    log: {
      type: 'OUTBOUND_AFFILIATE',
      source: 'AFFILIATE_INVITE',
      recipientName: recipientName || null,
      affiliateId: affiliateId || null,
      metadata: { affiliateCode },
    },
  });
}

/**
 * Notification client à chaque étape du dossier (devis envoyé, contrat à
 * signer, financement accordé, refus…).
 *
 * Renvoie `{ skipped: true }` sans rien envoyer quand le statut ne justifie
 * pas de message — c'est le template qui en décide, pas l'appelant.
 */
export async function sendStatutDemande({ to, statut, reference, companyName, amount }) {
  if (!to) return { sent: false, error: 'Aucune adresse sur le dossier' };

  const message = templateStatutDemande({
    statut,
    reference,
    companyName,
    amount,
    baseUrl: baseUrl(),
  });
  if (!message) return { sent: false, skipped: true };

  return sendMail({
    to,
    subject: message.subject,
    html: message.html,
    text: message.text,
    log: {
      type: 'TRANSACTIONAL',
      source: 'STATUT_DEMANDE',
      metadata: { reference, statut },
    },
  });
}
