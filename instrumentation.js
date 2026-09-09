/**
 * Point d'entrée d'instrumentation Next.js — chargement de Sentry côté serveur.
 *
 * Constat du 9 septembre 2026, au-delà de l'audit : les trois fichiers
 * `sentry.*.config.js` existaient, correctement écrits, mais **rien ne les
 * chargeait**. Depuis `@sentry/nextjs` v8, le chargement automatique de
 * `sentry.server.config.js` a disparu au profit de ce fichier, et le greffon de
 * compilation ne s'active que si `next.config.js` est enveloppé par
 * `withSentryConfig()` — ce qui n'était pas le cas non plus.
 *
 * Conséquence : le diagnostic « il manque la clé Sentry » était incomplet. La
 * poser n'aurait rien remonté du tout. Les deux câblages manquants sont ajoutés
 * ici et dans `next.config.js`.
 *
 * Sans `NEXT_PUBLIC_SENTRY_DSN`, `Sentry.init()` n'est pas appelé : l'ensemble
 * reste silencieux et sans effet, ce qui est le comportement voulu tant que le
 * projet Sentry n'est pas ouvert.
 */

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config.js');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config.js');
  }
}

/**
 * Remontée des erreurs survenant pendant le rendu serveur (React Server
 * Components, routes d'API, génération de pages). Sans ce point d'accroche,
 * Next 15 attrape ces erreurs et les journalise sans les transmettre à Sentry.
 */
export const onRequestError = Sentry.captureRequestError;
