import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Mode standalone : requis pour Clever Cloud (serveur Node.js autonome)
  output: 'standalone',
  async redirects() {
    // Domaine canonique : finarent.com. Les autres domaines (.org, .fr, www)
    // servent la même app sur Clever Cloud → 301 pour ne pas diviser le SEO.
    const secondaryHosts = [
      'finarent.org',
      'www.finarent.org',
      'finarent.fr',
      'www.finarent.fr',
      'www.finarent.com',
    ];
    return [
      ...secondaryHosts.map((host) => ({
        source: '/:path*',
        has: [{ type: 'host', value: host }],
        destination: 'https://finarent.com/:path*',
        permanent: true,
      })),
      // Ancien /simulator → nouvelle architecture simulateurs
      { source: '/simulator', destination: '/simulateurs/credit-immobilier/mensualite', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

/**
 * Enveloppe Sentry — ajoutée le 9 septembre 2026.
 *
 * Les fichiers `instrumentation.js` et `instrumentation-client.js` suffisent à
 * faire remonter les erreurs : Next 15.3+ les charge nativement. `withSentryConfig`
 * n'apporte que le téléversement des cartes de source (traces lisibles au lieu de
 * code minifié) et le marquage des versions.
 *
 * Elle n'est donc appliquée que si un jeton d'envoi existe. Sans jeton, le greffon
 * de compilation n'aurait rien à faire, et l'étape « build » de l'intégration
 * continue — désormais bloquante — n'a aucune raison de porter ce poids.
 * Poser `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` et `SENTRY_PROJECT` suffit à l'activer.
 */
let configurationExportee = nextConfig;

if (process.env.SENTRY_AUTH_TOKEN) {
  configurationExportee = withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    disableLogger: true,
    telemetry: false,
  });
}

export default configurationExportee;
