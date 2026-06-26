/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Mode standalone : requis pour Clever Cloud (serveur Node.js autonome)
  output: 'standalone',
  async redirects() {
    return [
      // Ancien /simulator → nouvelle architecture simulateurs
      { source: '/simulator', destination: '/simulateurs/credit-immobilier/mensualite', permanent: true },
    ];
  },
};

export default nextConfig;
