'use client';

// Tracker côté client — envoie une fois par session/mount + params stables.
// Utilisé par ConversionCTA et les écrans de résultat wizard.

let inflight = new Map();

export async function trackProspectEvent({ simulatorSlug, category, params, result, url }) {
  if (typeof window === 'undefined' || !simulatorSlug) return;

  // Dédup par slug + JSON params dans le mount courant
  const key = `${simulatorSlug}:${JSON.stringify(params || {})}`;
  if (inflight.has(key)) return inflight.get(key);

  const promise = fetch('/api/prospects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      simulatorSlug,
      category: category || null,
      params: params || {},
      result: result || null,
      url: url || (typeof location !== 'undefined' ? location.href : null),
      source: getUtmSource(),
    }),
    credentials: 'include',
  }).then((r) => r.ok ? r.json() : null).catch(() => null);

  inflight.set(key, promise);
  return promise;
}

function getUtmSource() {
  if (typeof window === 'undefined') return null;
  try {
    const p = new URLSearchParams(location.search);
    return p.get('utm_source') || document.referrer || null;
  } catch {
    return null;
  }
}
