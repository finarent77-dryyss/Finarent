/** Configuration SEO centralisée — même pattern que SL Formations (lib/seo.ts). */

export const SITE_NAME = 'Finarent';

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH0_BASE_URL;
  if (!explicit) return 'http://localhost:3000';
  return explicit.replace(/\/$/, '');
}

export const SITE_URL = getSiteUrl();

export const LOCAL_KEYWORDS = [
  'financement professionnel',
  'crédit-bail',
  'leasing',
  'LOA',
  'LLD',
  'assurance pro',
  'RC Pro',
  'courtier financement',
  'PME',
  'TPE',
];

export function canonical(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

/**
 * Helper métadonnées par page (title, description, OG, Twitter, canonical).
 * @param {{ title: string; description: string; path: string; keywords?: string[]; ogImage?: string; noIndex?: boolean }} opts
 */
export function pageMetadata(opts) {
  const url = canonical(opts.path);
  const ogTitle = opts.title.includes(SITE_NAME) ? opts.title : `${opts.title} | ${SITE_NAME}`;

  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords ?? LOCAL_KEYWORDS,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      locale: 'fr_FR',
      type: 'website',
      images: [{ url: opts.ogImage ?? '/hero_business_team_premium_v2_1772271137874.png', alt: opts.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: opts.description,
      images: [opts.ogImage ?? '/hero_business_team_premium_v2_1772271137874.png'],
    },
    ...(opts.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
