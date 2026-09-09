/**
 * Initialisation de Sentry côté navigateur.
 *
 * Reprend le contenu de l'ancien `sentry.client.config.js`, supprimé au profit
 * de ce fichier : depuis `@sentry/nextjs` v9, `instrumentation-client.js` est
 * l'emplacement reconnu. Conserver les deux aurait initialisé Sentry deux fois.
 *
 * L'échantillonnage des traces est fixé à 10 %, conformément à l'action 2.2 du
 * plan de correction — de quoi observer sans consommer le quota.
 */

import * as Sentry from '@sentry/nextjs';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NODE_ENV,
  });
}

/** Suivi des changements de page côté client (navigation App Router). */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
