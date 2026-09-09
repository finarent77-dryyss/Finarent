import nodemailer from 'nodemailer';
import { COMPANY_INFO } from '../invoicing/company.js';
import { brevoApi } from '../brevo/client.js';
import { brevoConfigured, brevoSenderEmail } from '../brevo/config.js';
import { unsubscribeHeaders } from './unsubscribe.js';
import { mailingToText } from './charter.js';

/**
 * Point d'envoi unique de tous les emails Finarent.
 *
 * Ordre des canaux :
 *   1. API Brevo (`/smtp/email`) — canal nominal choisi par le client.
 *      Donne le messageId nécessaire au suivi (webhook ouvertures / bounces).
 *   2. SMTP (nodemailer) — repli si Brevo n'est pas configuré, ou si l'API
 *      refuse l'envoi (typiquement : IP non autorisée côté Brevo). Sans ce
 *      repli, une restriction d'IP suffirait à couper toute la messagerie.
 *
 * Tout passage ici est tracé dans `EmailLog`, y compris les échecs : un email
 * qui ne part pas doit être visible dans l'admin, pas seulement dans les logs
 * serveur d'un conteneur redéployé depuis.
 */

/**
 * Client Prisma chargé à la demande.
 *
 * Ce module doit rester importable hors du runtime Next — les scripts de
 * recette (`scripts/test-live.js`) l'utilisent, et là ni l'alias `@/` ni les
 * fichiers .ts ne se résolvent. Sous Next on réutilise le singleton de
 * `lib/prisma.ts` ; ailleurs on retombe sur un client dédié.
 */
let clientPrisma = null;
async function db() {
  if (clientPrisma) return clientPrisma;
  try {
    ({ prisma: clientPrisma } = await import('@/lib/prisma'));
  } catch {
    const { PrismaClient } = await import('@prisma/client');
    clientPrisma = new PrismaClient();
  }
  return clientPrisma;
}

let transporter = null;

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (transporter) return transporter;
  if (!smtpConfigured()) return null;
  const port = process.env.SMTP_PORT;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(port || '587', 10),
    secure: port === '465',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

/** Un canal d'envoi au moins est-il disponible ? */
export function isMailConfigured() {
  return brevoConfigured() || smtpConfigured();
}

function expediteur({ fromName, fromEmail }) {
  return {
    name: fromName || COMPANY_INFO.name,
    email:
      fromEmail
      || brevoSenderEmail()
      || process.env.SMTP_FROM
      || process.env.SMTP_USER
      || COMPANY_INFO.email,
  };
}

/**
 * Plafond des pièces jointes.
 *
 * Brevo refuse au-delà de ~10 Mo, et la plupart des messageries plafonnent à
 * 25 Mo une fois l'encodage base64 appliqué (+33 % de volume). On coupe à 8 Mo
 * de contenu brut : au-delà, mieux vaut un email qui part sans pièce jointe,
 * avec le lien vers l'espace client, qu'un email qui n'part pas du tout.
 */
const TAILLE_MAX_PJ = 8 * 1024 * 1024;

/**
 * Normalise les pièces jointes et écarte celles qui feraient échouer l'envoi.
 * @param {Array<{name: string, content: Buffer}>} pieces
 */
function preparerPiecesJointes(pieces, sujet) {
  if (!pieces?.length) return [];
  const total = pieces.reduce((n, p) => n + (p.content?.length || 0), 0);
  if (total > TAILLE_MAX_PJ) {
    console.error(
      `[email] "${sujet}" — pièces jointes ignorées : ${Math.round(total / 1024 / 1024)} Mo dépassent la limite.`,
    );
    return [];
  }
  return pieces.filter((p) => p?.name && p.content?.length);
}

async function envoyerViaBrevo({ to, subject, html, text, from, replyTo, tags, headers, pieces }) {
  const res = await brevoApi('/smtp/email', {
    method: 'POST',
    body: JSON.stringify({
      sender: from,
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
      replyTo: { email: replyTo || COMPANY_INFO.email },
      ...(tags?.length ? { tags } : {}),
      ...(headers && Object.keys(headers).length ? { headers } : {}),
      ...(pieces.length
        ? { attachment: pieces.map((p) => ({ name: p.name, content: p.content.toString('base64') })) }
        : {}),
    }),
  });
  if (!res.messageId) throw new Error('Brevo n\'a pas renvoyé de messageId.');
  return res.messageId;
}

async function envoyerViaSmtp({ to, subject, html, text, from, replyTo, headers, pieces }) {
  const trans = getTransporter();
  if (!trans) throw new Error('SMTP non configuré');
  const info = await trans.sendMail({
    from: `"${from.name}" <${from.email}>`,
    to,
    replyTo: replyTo || COMPANY_INFO.email,
    subject,
    html,
    text,
    headers,
    ...(pieces.length
      ? { attachments: pieces.map((p) => ({ filename: p.name, content: p.content })) }
      : {}),
  });
  return info.messageId || null;
}

async function tracer(donnees) {
  try {
    const p = await db();
    await p.emailLog.create({ data: donnees });
  } catch (e) {
    // Ne jamais faire échouer un envoi réussi à cause du journal.
    console.error('[email] journalisation impossible :', e.message);
  }
}

/**
 * Envoie un email et le journalise.
 *
 * @param {object}  o
 * @param {string}  o.to
 * @param {string}  o.subject
 * @param {string}  o.html
 * @param {string}  [o.text]        généré depuis le HTML si absent
 * @param {boolean} [o.commercial]  true = prospection / newsletter / campagne :
 *                                  ajoute les en-têtes List-Unsubscribe
 * @param {string}  [o.replyTo]
 * @param {string}  [o.fromName]
 * @param {string}  [o.fromEmail]
 * @param {string[]}[o.tags]
 * @param {object}  [o.headers]
 * @param {Array<{name: string, content: Buffer}>} [o.attachments]
 *                                  écartées d'office au-delà de 8 Mo cumulés
 * @param {object}  [o.log]         champs additionnels d'EmailLog
 *                                  (type, source, prospectId, senderUserId…)
 * @returns {Promise<{sent: boolean, provider?: string, messageId?: string|null, error?: string, emailLogId?: string}>}
 */
export async function sendMail({
  to,
  subject,
  html,
  text,
  commercial = false,
  replyTo,
  fromName,
  fromEmail,
  tags,
  headers = {},
  attachments = [],
  log = {},
}) {
  const dest = String(to || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dest)) {
    return { sent: false, error: 'Adresse email invalide' };
  }

  const corpsTexte = text || mailingToText(html);
  const from = expediteur({ fromName, fromEmail });
  const entetes = commercial ? { ...unsubscribeHeaders(dest), ...headers } : headers;
  const pieces = preparerPiecesJointes(attachments, subject);
  const commun = { to: dest, subject, html, text: corpsTexte, from, replyTo, tags, headers: entetes, pieces };

  const champsLog = {
    type: log.type || 'TRANSACTIONAL',
    subject,
    recipientEmail: dest,
    recipientName: log.recipientName || null,
    senderUserId: log.senderUserId || null,
    affiliateId: log.affiliateId || null,
    callCenterId: log.callCenterId || null,
    prospectId: log.prospectId || null,
    source: log.source || null,
  };

  const erreurs = [];

  // 1. Canal nominal : API Brevo
  if (brevoConfigured()) {
    try {
      const messageId = await envoyerViaBrevo(commun);
      const entree = await (await db()).emailLog
        .create({
          data: {
            ...champsLog,
            status: 'SENT',
            brevoMessageId: messageId,
            metadata: { ...(log.metadata || {}), provider: 'BREVO', commercial },
          },
        })
        .catch((e) => {
          console.error('[email] journalisation impossible :', e.message);
          return null;
        });
      return { sent: true, provider: 'BREVO', messageId, emailLogId: entree?.id };
    } catch (e) {
      const brut = e?.message || 'Erreur Brevo';
      const bas = brut.toLowerCase();
      const indice = bas.includes('ip') && /authoriz|whitelist|401|403/.test(bas)
        ? 'IP non autorisée côté Brevo (Security → Authorized IPs).'
        : brut.slice(0, 240);
      console.error('[email] Brevo a refusé l\'envoi :', indice);
      erreurs.push(`Brevo : ${indice}`);
    }
  }

  // 2. Repli SMTP
  if (smtpConfigured()) {
    try {
      const messageId = await envoyerViaSmtp(commun);
      const entree = await (await db()).emailLog
        .create({
          data: {
            ...champsLog,
            status: 'SENT',
            brevoMessageId: messageId,
            metadata: { ...(log.metadata || {}), provider: 'SMTP', commercial, fallback: erreurs.length > 0 },
          },
        })
        .catch(() => null);
      return { sent: true, provider: 'SMTP', messageId, emailLogId: entree?.id };
    } catch (e) {
      erreurs.push(`SMTP : ${(e?.message || '').slice(0, 240)}`);
    }
  }

  const raison = erreurs.length
    ? erreurs.join(' | ')
    : 'Aucun canal email configuré (BREVO_API_KEY ou SMTP_HOST/USER/PASS).';

  console.error(`[email] "${subject}" non envoyé à ${dest} — ${raison}`);
  await tracer({
    ...champsLog,
    status: 'FAILED',
    failedAt: new Date(),
    errorMessage: raison.slice(0, 500),
    metadata: { ...(log.metadata || {}), commercial },
  });

  return { sent: false, error: raison };
}
