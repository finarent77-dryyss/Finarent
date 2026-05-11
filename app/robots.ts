import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.AUTH0_BASE_URL || 'http://localhost:3000';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/espace', '/partner', '/insurer'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
