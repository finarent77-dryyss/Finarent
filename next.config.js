import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
/**
 * Le build tourne-t-il sur Clever Cloud ? La plateforme injecte `CC_APP_ID`.
 *
 * Le déploiement du 10 septembre 2026 a échoué sur
 * « Next.js build worker exited with code: null and signal: SIGKILL » : pas un
 * plantage de Next, mais le noyau qui tue le processus faute de mémoire.
 * L'instance de build dispose d'environ 2 Go (Clever Cloud y impose
 * `--max-old-space-size=1262`).
 *
 * La coupure est survenue pendant « Creating an optimized production build »,
 * donc dans la phase webpack — avant toute génération de page. C'est
 * `webpackMemoryOptimizations` qui vise ce point précis. `cpus` est conservé
 * par prudence : la génération statique des ~165 pages, dont les 41
 * simulateurs, n'a jamais été atteinte lors de cet échec, on ne sait donc pas
 * si elle tenait dans l'enveloppe.
 *
 * Augmenter `--max-old-space-size` ne servirait à rien : c'est le conteneur qui
 * plafonne, V8 se ferait tuer plus tard mais tout autant.
 *
 * Le bridage est donc conditionnel plutôt que permanent : ralentir le build de
 * chaque développeur et celui de l'intégration continue pour une contrainte
 * d'hébergement serait payer partout le prix d'un problème qui n'existe qu'à un
 * seul endroit.
 */
const buildContraintEnMemoire = Boolean(process.env.CC_APP_ID);

const nextConfig = {
  reactStrictMode: true,

  ...(buildContraintEnMemoire
    ? {
        experimental: {
          // Génération statique séquentielle : chaque worker charge sa propre
          // copie du runtime React et du graphe de modules.
          //
          // Mesuré en local (10/09/2026) : compilation de 25 s à 76 s avec ce
          // bridage. Le surcoût réel sur Clever Cloud sera nettement moindre —
          // l'écart mesuré ici vient du grand nombre de cœurs du poste de
          // développement, alors que l'instance de build en compte deux ou
          // trois : y brider à un seul worker ne divise pas le parallélisme
          // dans les mêmes proportions.
          //
          // Si le temps de build devient gênant, passer à 2 avant de renoncer
          // au bridage : c'est le premier palier à tester.
          cpus: 1,
          // Libère les structures intermédiaires de webpack au fil de la
          // compilation au lieu de les conserver jusqu'à la fin.
          webpackMemoryOptimizations: true,
        },
      }
    : {}),

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
