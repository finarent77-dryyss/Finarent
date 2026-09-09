const RINGOVER_API_BASE = 'https://public-api.ringover.com/v2';

// Délai d'expiration réseau, sur le modèle de lib/auth0-management.js.
// Sans lui, un appel Ringover qui ne répond pas bloque indéfiniment son
// appelant — et la synchronisation de contacts en enchaîne des centaines.
const DELAI_RESEAU_MS = 15_000;

export function ringoverApiConfigured() {
  return Boolean(process.env.RINGOVER_API_KEY?.trim());
}

export function ringoverSmsFromNumber() {
  const raw = process.env.RINGOVER_SMS_FROM_NUMBER?.trim();
  return raw || null;
}

function formatRingoverApiError(status, path, body) {
  const detail = body ? ` — ${body.slice(0, 240)}` : '';
  if (status === 401 && path.includes('/callback')) {
    return (
      'Ringover refuse le click-to-call (401). Activez « Appels en écriture » (Calls Write) ' +
      'et le mode Monitoring sur la clé API Ringover.'
    );
  }
  if (status === 401) {
    return `Ringover API 401 — clé invalide ou permission insuffisante${detail}`;
  }
  return `Ringover API ${status}${detail}`;
}

export async function ringoverApi(path, init) {
  const key = process.env.RINGOVER_API_KEY?.trim();
  if (!key) {
    throw new Error('RINGOVER_API_KEY non configurée sur le serveur.');
  }

  let res;
  try {
    res = await fetch(`${RINGOVER_API_BASE}${path}`, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(DELAI_RESEAU_MS),
      headers: {
        Authorization: key,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  } catch (erreur) {
    if (erreur?.name === 'TimeoutError' || erreur?.name === 'AbortError') {
      throw new Error(`Ringover injoignable : délai de ${DELAI_RESEAU_MS / 1000} s dépassé sur ${path}`);
    }
    throw erreur;
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(formatRingoverApiError(res.status, path, body));
  }

  if (res.status === 204) return {};
  const text = await res.text();
  if (!text) return {};
  return JSON.parse(text);
}

/** Callback : sonne l'agent Ringover puis appelle le prospect. */
export async function initiateRingoverCallback(toNumber, options = {}) {
  const payload = {
    to_number: toNumber,
    device: options.device ?? 'ALL',
    timeout: 45,
    clir: false,
  };
  if (options.fromNumber) {
    payload.from_number = options.fromNumber;
  }
  return ringoverApi('/callback', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sendRingoverSms(fromNumber, toNumber, content) {
  return ringoverApi('/push/sms', {
    method: 'POST',
    body: JSON.stringify({
      from_number: fromNumber,
      to_number: toNumber,
      content,
      archived_auto: false,
    }),
  });
}
