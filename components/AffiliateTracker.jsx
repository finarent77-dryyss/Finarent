'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const SESSION_KEY = 'finarent_affiliate_tracked';

/**
 * Monté dans le root layout. Capture le param `?ref=CODE` à l'arrivée d'un
 * visiteur, pose le cookie via POST /api/affiliate/track, et log le clic.
 *
 * Anti-doublon : utilise sessionStorage pour ne tracker qu'une fois par session
 * (même si l'utilisateur navigue avec le param dans plusieurs URL).
 */
export default function AffiliateTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const code = searchParams.get('ref');
    if (!code) return;

    const sessionKey = `${SESSION_KEY}:${code}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');

    fetch('/api/affiliate/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        landingPath: pathname,
        referer: document.referrer || null,
      }),
      // fire-and-forget, on n'attend pas la réponse
      keepalive: true,
    }).catch(() => {
      // échec silencieux pour ne pas casser l'expérience visiteur
    });
  }, [pathname, searchParams]);

  return null;
}
