import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/seo.js';
import { ESPACES_CONNECTES } from '../lib/routes-privees.js';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          ...ESPACES_CONNECTES,
          '/api',
          '/affiliate',
          '/paiement-confirme',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
