import nodemailer from 'nodemailer';
import {
  renderEmail,
  emailButton,
  emailInfoCard,
  escapeHtml,
  COMPANY_INFO,
} from './branding.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  transporter = nodemailer.createTransport({
    host,
    port: parseInt(port || '587', 10),
    secure: port === '465',
    auth: { user, pass },
  });
  return transporter;
}

function isEmailConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function fromAddress() {
  const sender = process.env.SMTP_FROM || process.env.SMTP_USER;
  return sender ? `"${COMPANY_INFO.name}" <${sender}>` : sender;
}

function baseUrl() {
  return process.env.APP_BASE_URL || 'https://finarent.fr';
}

/**
 * Envoi d'email de confirmation au client après soumission
 */
export async function sendConfirmationDemande({ to, reference, companyName }) {
  if (!isEmailConfigured()) return { sent: false, reason: 'SMTP non configuré' };
  const trans = getTransporter();
  if (!trans) return { sent: false, reason: 'Transporter non configuré' };

  const url = baseUrl();
  const body = `
  <h1>Votre demande est enregistrée</h1>
  <p>Bonjour,</p>
  <p>Nous accusons réception de votre demande de financement. Notre équipe étudie votre dossier et reviendra vers vous sous <strong>48 heures ouvrées</strong>.</p>
  ${emailInfoCard([
    ['Référence', reference],
    ['Entreprise', companyName],
  ])}
  ${emailButton(`${url}/espace`, 'Suivre mon dossier')}
  <p style="font-size:13px;color:#737D8C;">Une question ? Répondez simplement à cet email ou appelez-nous au ${escapeHtml(COMPANY_INFO.phone)}.</p>
  <p>L'équipe ${escapeHtml(COMPANY_INFO.name)}</p>`;

  const html = renderEmail({
    title: `Demande ${reference} enregistrée — Finarent`,
    preheader: `Référence ${reference} · réponse sous 48 h ouvrées`,
    bodyHtml: body,
    baseUrl: url,
  });

  try {
    await trans.sendMail({
      from: fromAddress(),
      to,
      subject: `Demande ${reference} enregistrée — Finarent`,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error('sendConfirmationDemande error:', err);
    return { sent: false, error: err.message };
  }
}

/**
 * Alerte admin : nouvelle demande reçue
 */
export async function sendAlerteAdmin({ reference, companyName, productType, amount, email }) {
  if (!isEmailConfigured()) return { sent: false, reason: 'SMTP non configuré' };
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (!adminEmail) return { sent: false, reason: 'ADMIN_EMAIL non configuré' };

  const trans = getTransporter();
  if (!trans) return { sent: false, reason: 'Transporter non configuré' };

  const url = baseUrl();
  const body = `
  <h1>Nouvelle demande à traiter</h1>
  <p>Un prospect vient de soumettre une demande sur le site Finarent.</p>
  ${emailInfoCard([
    ['Référence', reference],
    ['Entreprise', companyName],
    ['Type', productType],
    ['Montant', amount || '—'],
    ['Contact', email],
  ])}
  ${emailButton(`${url}/admin/demandes`, 'Ouvrir le dossier')}`;

  const html = renderEmail({
    title: `Nouvelle demande ${reference}`,
    preheader: `${companyName} — ${productType}`,
    bodyHtml: body,
    baseUrl: url,
  });

  try {
    await trans.sendMail({
      from: fromAddress(),
      to: adminEmail,
      subject: `[Finarent] Nouvelle demande ${reference} — ${companyName}`,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error('sendAlerteAdmin error:', err);
    return { sent: false, error: err.message };
  }
}

/**
 * Notification client : document reçu et enregistré
 */
export async function sendDocumentReceived({ to, fileName, documentType, reference }) {
  if (!isEmailConfigured()) return { sent: false, reason: 'SMTP non configuré' };
  const trans = getTransporter();
  if (!trans) return { sent: false, reason: 'Transporter non configuré' };

  const url = baseUrl();
  const body = `
  <h1>Document bien reçu</h1>
  <p>Bonjour,</p>
  <p>Nous confirmons la bonne réception du document suivant pour votre dossier <strong>${escapeHtml(reference)}</strong> :</p>
  ${emailInfoCard([
    ['Nom du fichier', fileName],
    ['Type', documentType],
  ])}
  <p>Votre conseiller le consultera dans les meilleurs délais et vous notifiera si d'autres pièces sont nécessaires.</p>
  ${emailButton(`${url}/espace`, 'Voir mon dossier')}
  <p>L'équipe ${escapeHtml(COMPANY_INFO.name)}</p>`;

  const html = renderEmail({
    title: `Document reçu — Dossier ${reference}`,
    preheader: `Document ${fileName} bien reçu`,
    bodyHtml: body,
    baseUrl: url,
  });

  try {
    await trans.sendMail({
      from: fromAddress(),
      to,
      subject: `Document reçu — Dossier ${reference} — Finarent`,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error('sendDocumentReceived error:', err);
    return { sent: false, error: err.message };
  }
}

/**
 * Relance documents manquants (utilisé par cron)
 */
export async function sendDocumentsMissing({ to, reference, missingDocs = [] }) {
  if (!isEmailConfigured()) return { sent: false, reason: 'SMTP non configuré' };
  const trans = getTransporter();
  if (!trans) return { sent: false, reason: 'Transporter non configuré' };

  const url = baseUrl();
  const list = missingDocs.length
    ? `<ul style="margin:0 0 16px;padding-left:20px;color:#10253C;">${missingDocs.map((d) => `<li style="padding:3px 0;">${escapeHtml(d)}</li>`).join('')}</ul>`
    : '<p>Le détail des pièces manquantes est disponible dans votre espace.</p>';

  const body = `
  <h1>Pièces complémentaires nécessaires</h1>
  <p>Bonjour,</p>
  <p>Pour finaliser l'instruction de votre dossier <strong>${escapeHtml(reference)}</strong>, il nous manque les éléments suivants :</p>
  ${list}
  ${emailButton(`${url}/espace`, 'Téléverser mes documents')}
  <p>Dès réception, notre équipe poursuit l'analyse sous 48 h.</p>
  <p>L'équipe ${escapeHtml(COMPANY_INFO.name)}</p>`;

  const html = renderEmail({
    title: `Documents manquants — Dossier ${reference}`,
    preheader: `Quelques pièces à téléverser pour finaliser votre dossier`,
    bodyHtml: body,
    baseUrl: url,
  });

  try {
    await trans.sendMail({
      from: fromAddress(),
      to,
      subject: `Action requise — Documents manquants — Dossier ${reference}`,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error('sendDocumentsMissing error:', err);
    return { sent: false, error: err.message };
  }
}

/**
 * Email d'invitation/parrainage envoyé au nom d'un affilié.
 * Le lien intègre automatiquement le code de tracking.
 */
export async function sendAffiliateInvite({ to, recipientName, affiliateName, affiliateCode, message }) {
  if (!isEmailConfigured()) return { sent: false, reason: 'SMTP non configuré' };
  const trans = getTransporter();
  if (!trans) return { sent: false, reason: 'Transporter non configuré' };

  const url = baseUrl();
  const trackingUrl = `${url}/?ref=${encodeURIComponent(affiliateCode)}`;
  const greeting = recipientName ? `Bonjour ${escapeHtml(recipientName)},` : 'Bonjour,';
  const personalMessage = message
    ? `<div class="fn-quote">${escapeHtml(message)}</div>`
    : '';

  const body = `
  <h1>${escapeHtml(affiliateName)} vous recommande Finarent</h1>
  <p>${greeting}</p>
  <p><strong>${escapeHtml(affiliateName)}</strong> pense que Finarent pourrait vous être utile pour vos projets de financement professionnel ou d'assurance pro.</p>
  ${personalMessage}
  <p>${escapeHtml(COMPANY_INFO.name)} est un courtier indépendant qui compare 100+ partenaires bancaires et assureurs pour vous proposer la meilleure offre. <strong>Réponse sous 48 h, sans frais</strong>, financements de 3 000 € à 500 000 €.</p>
  ${emailButton(trackingUrl, 'Découvrir Finarent')}
  <p style="font-size:12px;color:#737D8C;margin-top:24px;">Vous recevez ce message parce que ${escapeHtml(affiliateName)} a estimé que nos services pouvaient vous être utiles. Si ce n'est pas le cas, ignorez-le simplement — cet email ne sera pas relancé automatiquement.</p>`;

  const html = renderEmail({
    title: `${affiliateName} vous recommande Finarent`,
    preheader: `Recommandation personnelle de ${affiliateName}`,
    bodyHtml: body,
    baseUrl: url,
  });

  try {
    await trans.sendMail({
      from: fromAddress(),
      to,
      replyTo: process.env.SMTP_FROM || process.env.SMTP_USER, // pas l'email perso de l'affilié pour éviter doxxing
      subject: `${affiliateName} vous recommande Finarent`,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error('sendAffiliateInvite error:', err);
    return { sent: false, error: err.message };
  }
}
