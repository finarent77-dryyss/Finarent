import { brevoConfigured } from './config.js';

const BREVO_API = 'https://api.brevo.com/v3';

export class BrevoApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'BrevoApiError';
    this.status = status;
  }
}

export async function brevoApi(path, init) {
  const key = process.env.BREVO_API_KEY?.trim();
  if (!key) throw new BrevoApiError(0, 'BREVO_API_KEY non configurée.');

  const res = await fetch(`${BREVO_API}${path}`, {
    ...init,
    headers: {
      'api-key': key,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init?.headers,
    },
  });

  const text = await res.text().catch(() => '');
  if (!res.ok) {
    throw new BrevoApiError(res.status, text.slice(0, 400) || `HTTP ${res.status}`);
  }

  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export function isBrevoReady() {
  return brevoConfigured();
}
