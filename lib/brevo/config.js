export function brevoConfigured() {
  return Boolean(process.env.BREVO_API_KEY?.trim());
}

export function brevoMarketingEnabled() {
  return brevoConfigured();
}

export function marketingListId() {
  const raw = process.env.BREVO_MARKETING_LIST_ID?.trim();
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

export function brevoSenderEmail() {
  return (
    process.env.BREVO_SENDER_EMAIL?.trim()
    || process.env.SMTP_FROM?.trim()
    || process.env.SMTP_USER?.trim()
    || 'ne-pas-repondre@finarent.fr'
  );
}

export function brevoSenderName() {
  return process.env.BREVO_SENDER_NAME?.trim() || 'Finarent — Centre d\'appels';
}

export function brevoWebhookToken() {
  return process.env.BREVO_WEBHOOK_TOKEN?.trim() || null;
}
