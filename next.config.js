/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Ancien /simulator → nouvelle architecture simulateurs
      { source: '/simulator', destination: '/simulateurs/credit-immobilier/mensualite', permanent: true },
    ];
  },
};

export default nextConfig;
