import { prepareEmailContent } from '@/lib/email/prepare-content.js';
import { brevoApi } from './client.js';
import { brevoSenderEmail, brevoSenderName } from './config.js';
import { COMPANY_INFO } from '@/lib/invoicing/company.js';

/**
 * Envoi transactionnel Brevo — centre d'appels (prospection).
 */
export async function sendBrevoTransactionalEmail(opts) {
  const email = opts.to.trim().toLowerCase();
  if (!email.includes('@')) {
    return { success: false, error: 'Destinataire invalide.' };
  }

  const { html, text } = prepareEmailContent(opts.html);

  try {
    const res = await brevoApi('/smtp/email', {
      method: 'POST',
      body: JSON.stringify({
        sender: { name: brevoSenderName(), email: brevoSenderEmail() },
        to: [{ email }],
        subject: opts.subject,
        htmlContent: html,
        textContent: text,
        replyTo: { email: opts.replyTo || COMPANY_INFO.email },
        tags: opts.tags,
      }),
    });

    const messageId = res.messageId;
    if (!messageId) {
      return { success: false, error: 'Brevo n\'a pas renvoyé de messageId.' };
    }
    return { success: true, messageId };
  } catch (e) {
    const raw = e instanceof Error ? e.message : 'Erreur Brevo';
    console.error('[brevo] send failed:', raw);
    const lower = raw.toLowerCase();
    if (
      lower.includes('ip')
      && (lower.includes('authoriz') || lower.includes('whitelist') || lower.includes('403') || lower.includes('401'))
    ) {
      return {
        success: false,
        error: 'Brevo a refusé l\'envoi : IP non autorisée. Ajoutez-la dans Brevo (Security → Authorized IPs).',
      };
    }
    return { success: false, error: raw.slice(0, 280) || 'Erreur Brevo' };
  }
}
