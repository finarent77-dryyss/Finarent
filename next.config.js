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

export default nextConfig;
