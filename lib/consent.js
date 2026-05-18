/**
 * Helpers de consentement RGPD côté client.
 * Permet aux composants analytics/marketing de savoir s'ils peuvent s'activer.
 *
 * Format stocké en localStorage sous la clé `finarent_cookie_consent` :
 *   {
 *     version: 1,
 *     essential: true,    // toujours true (légitime)
 *     analytics: false,   // PostHog, Sentry analytics
 *     marketing: false,   // remarketing, pixels publicitaires
 *     date: ISO string
 *   }
 */

export const CONSENT_KEY = 'finarent_cookie_consent';
export const CONSENT_VERSION = 1;
export const CONSENT_CHANGE_EVENT = 'finarent:consent-changed';

export const DEFAULT_CONSENT = {
  version: CONSENT_VERSION,
  essential: true,
  analytics: false,
  marketing: false,
  date: null,
};

/**
 * Lit le consentement depuis localStorage. Retourne DEFAULT_CONSENT si absent.
 * Safe SSR : retourne DEFAULT_CONSENT si window indisponible.
 */
export function getConsent() {
  if (typeof window === 'undefined') return DEFAULT_CONSENT;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return { ...DEFAULT_CONSENT };
    const parsed = JSON.parse(raw);
    // Compat ancien format (string "all" | "essential")
    if (typeof parsed.type === 'string') {
      return {
        ...DEFAULT_CONSENT,
        analytics: parsed.type === 'all',
        marketing: parsed.type === 'all',
        date: parsed.date || null,
      };
    }
    if (parsed.version !== CONSENT_VERSION) {
      return { ...DEFAULT_CONSENT };
    }
    return { ...DEFAULT_CONSENT, ...parsed };
  } catch {
    return { ...DEFAULT_CONSENT };
  }
}

/**
 * Persiste un nouveau consentement et émet un event custom pour que
 * les composants analytics/marketing puissent réagir sans reload.
 */
export function setConsent(partial) {
  if (typeof window === 'undefined') return;
  const next = {
    ...getConsent(),
    ...partial,
    version: CONSENT_VERSION,
    essential: true,
    date: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: next }));
  return next;
}

/**
 * Helper : a-t-on déjà demandé son avis à l'utilisateur ?
 */
export function hasGivenConsent() {
  return getConsent().date !== null;
}

/**
 * Hook React : retourne le consentement courant et écoute les changements.
 */
import { useEffect, useState } from 'react';

export function useConsent() {
  const [consent, setConsentState] = useState(() => DEFAULT_CONSENT);

  useEffect(() => {
    setConsentState(getConsent());
    const onChange = (e) => setConsentState(e.detail);
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, []);

  return consent;
}
