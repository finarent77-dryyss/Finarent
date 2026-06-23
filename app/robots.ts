import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/seo.js';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/espace',
          '/partner',
          '/insurer',
          '/affiliate',
          '/paiement-confirme',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
