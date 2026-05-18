'use client';

// Tracker côté client — envoie une fois par session/mount + params stables.
// Utilisé par ConversionCTA et les écrans de résultat wizard.

let inflight = new Map();

export async function trackProspectEvent({ simulatorSlug, category, params, result, url }) {
  if (typeof window === 'undefined' || !simulatorSlug) return;

  // Dédup par slug + JSON params dans le mount courant
  const key = `${simulatorSlug}:${JSON.stringify(params || {})}`;
  if (inflight.has(key)) return inflight.get(key);

  const attribution = readAttribution();

  const promise = fetch('/api/prospects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      simulatorSlug,
      category: category || null,
      params: params || {},
      result: result || null,
      url: url || (typeof location !== 'undefined' ? location.href : null),
      source: attribution.utmSource || attribution.referrer || null,
      ...attribution,
    }),
    credentials: 'include',
  }).then((r) => r.ok ? r.json() : null).catch(() => null);

  inflight.set(key, promise);
  return promise;
}

const STORAGE_KEY = 'finarent:attrib';

// Capture & persiste l'attribution au premier hit (first-touch).
export function captureAttribution() {
  if (typeof window === 'undefined') return null;
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return JSON.parse(existing);

    const p = new URLSearchParams(location.search);
    const ref = document.referrer || null;
    const isInternal = ref && ref.startsWith(location.origin);
    const attrib = {
      utmSource: p.get('utm_source') || null,
      utmMedium: p.get('utm_medium') || null,
      utmCampaign: p.get('utm_campaign') || null,
      utmTerm: p.get('utm_term') || null,
      utmContent: p.get('utm_content') || null,
      referrer: isInternal ? null : ref,
      landingPage: location.href,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attrib));
    return attrib;
  } catch {
    return null;
  }
}

function readAttribution() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return captureAttribution() || {};
  } catch {
    return {};
  }
}
