'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { usePathname, useSearchParams } from 'next/navigation';
import { useConsent } from '@/lib/consent';

export default function PostHogProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const consent = useConsent();

  // Init PostHog uniquement si l'utilisateur a consenti aux analytics.
  // Si le consentement est révoqué après init, on opt-out via posthog.opt_out_capturing().
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || typeof window === 'undefined') return;

    if (consent.analytics) {
      if (!posthog.__loaded) {
        posthog.init(key, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
          person_profiles: 'identified_only',
          capture_pageview: false,
          respect_dnt: true,
          // Le consentement est validé par useConsent → on autorise l'envoi
          opt_out_capturing_by_default: false,
        });
      } else {
        posthog.opt_in_capturing();
      }
    } else if (posthog.__loaded) {
      // L'utilisateur a révoqué son consentement → on coupe la capture
      posthog.opt_out_capturing();
    }
  }, [consent.analytics]);

  // Capture des pageviews uniquement si analytics autorisé et lib initialisée
  useEffect(() => {
    if (!consent.analytics) return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || !posthog.__loaded) return;
    const url =
      window.location.origin +
      pathname +
      (searchParams?.toString() ? '?' + searchParams : '');
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams, consent.analytics]);

  return children;
}
