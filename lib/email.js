import nodemailer from 'nodemailer';

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

/**
 * Envoi d'email de confirmation au client après soumission
 */
export async function sendConfirmationDemande({ to, reference, companyName }) {
  if (!isEmailConfigured()) return { sent: false, reason: 'SMTP non configuré' };
  const trans = getTransporter();
  if (!trans) return { sent: false, reason: 'Transporter non configuré' };

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;line-height:1.6}</style></head>
<body>
  <h2 style="color:#0A2540;">Finarent</h2>
  <p>Bonjour,</p>
  <p>Nous avons bien reçu votre demande de financement.</p>
  <p><strong>Référence :</strong> ${reference}</p>
  <p><strong>Entreprise :</strong> ${companyName}</p>
  <p>Notre équipe étudie votre dossier et vous recontactera sous 48h ouvrées.</p>
  <p>Vous pouvez suivre l'avancement de votre demande dans votre <a href="${process.env.APP_BASE_URL || 'http://localhost:3000'}/espace">espace client</a>.</p>
  <p>Cordialement,<br>L'équipe Finarent</p>
</body>
</html>`;

  try {
    await trans.sendMail({
      from,
      to,
      subject: `Demande ${reference} enregistrée - Finarent`,
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

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;line-height:1.6}</style></head>
<body>
  <h2 style="color:#0A2540;">Nouvelle demande Finarent</h2>
  <p><strong>Référence :</strong> ${reference}</p>
  <p><strong>Entreprise :</strong> ${companyName}</p>
  <p><strong>Type :</strong> ${productType}</p>
  <p><strong>Montant :</strong> ${amount || '-'}</p>
  <p><strong>Contact :</strong> ${email}</p>
  <p><a href="${baseUrl}/admin/demandes" style="display:inline-block;padding:12px 24px;background:#6366F1;color:white;text-decoration:none;border-radius:8px;">Voir le dossier</a></p>
</body>
</html>`;

  try {
    await trans.sendMail({
      from,
      to: adminEmail,
      subject: `[Finarent] Nouvelle demande ${reference} - ${companyName}`,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error('sendAlerteAdmin error:', err);
    return { sent: false, error: err.message };
  }
}
