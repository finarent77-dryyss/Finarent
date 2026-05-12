import type { MetadataRoute } from 'next';
// @ts-ignore — JS module
import { SIMULATORS } from '../lib/simulators/registry.js';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.AUTH0_BASE_URL || 'http://localhost:3000';
  const now = new Date();

  const staticPaths = [
    '',
    '/about',
    '/assurance',
    '/blog',
    '/comparateur',
    '/contact',
    '/faq',
    '/process',
    '/sectors',
    '/simulateurs',
    '/solutions',
    '/testimonials',
    '/why-leasing',
    '/legal',
    '/privacy',
    '/terms',
  ];

  const sectors = ['btp', 'medical', 'it', 'transport', 'industrie', 'services'];
  const solutions = ['credit-bail', 'loa', 'credit-pro', 'lld', 'leasing-ops'];

  return [
    ...staticPaths.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '' ? 1.0 : path === '/simulateurs' ? 0.9 : 0.7,
    })),
    ...sectors.map((slug) => ({
      url: `${baseUrl}/sectors/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...solutions.map((slug) => ({
      url: `${baseUrl}/solutions/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...SIMULATORS.map((s: { category: string; slug: string; available: boolean }) => ({
      url: `${baseUrl}/simulateurs/${s.category}/${s.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: s.available ? 0.8 : 0.4,
    })),
  ];
}
