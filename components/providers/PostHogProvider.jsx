'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { usePathname, useSearchParams } from 'next/navigation';

export default function PostHogProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || typeof window === 'undefined') return;

    if (!posthog.__loaded) {
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false,
        respect_dnt: true,
      });
    }
  }, []);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || !posthog.__loaded) return;
    const url =
      window.location.origin +
      pathname +
      (searchParams?.toString() ? '?' + searchParams : '');
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return children;
}
