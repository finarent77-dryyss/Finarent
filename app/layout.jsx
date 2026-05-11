import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/ui/CookieBanner';
import FloatingContactCTA from '@/components/ui/FloatingContactCTA';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { LanguageProvider } from '@/lib/i18n';
import PostHogProvider from '@/components/providers/PostHogProvider';
import './globals.css';

export const metadata = {
  metadataBase: new URL(process.env.AUTH0_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'Finassur | Financement & Assurance Professionnel',
    template: '%s | Finassur',
  },
  description: 'Finassur accompagne les entreprises dans leur financement professionnel (crédit-bail, LOA, leasing) et leur assurance (RC Pro, flotte, multirisque). De 3 000€ à 2 M€, réponse en 48h.',
  keywords: ['financement professionnel', 'crédit-bail', 'leasing', 'LOA', 'assurance pro', 'RC Pro', 'courtier financement', 'PME'],
  applicationName: 'Finassur',
  authors: [{ name: 'Finassur' }],
  icons: {
    icon: [
      { url: '/finarent-logo.jpg', type: 'image/jpeg' },
    ],
    shortcut: '/finarent-logo.jpg',
    apple: '/finarent-logo.jpg',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Finassur',
    title: 'Finassur | Financement & Assurance Professionnel',
    description: 'Crédit-bail, leasing, assurance pro. Réponse en 48h. 1200+ entreprises accompagnées, 98% d\'accords.',
    images: [{ url: '/hero_business_team_premium_v2_1772271137874.png', width: 1200, height: 630, alt: 'Finassur — Financement professionnel' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finassur | Financement & Assurance Professionnel',
    description: 'Crédit-bail, leasing, assurance pro. Réponse en 48h.',
    images: ['/hero_business_team_premium_v2_1772271137874.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <UserProvider>
          <LanguageProvider>
            <Suspense fallback={null}>
              <PostHogProvider>
                <div className="min-h-screen flex flex-col">
                  <div id="site-header">
                    <Header />
                  </div>
                  <main className="flex-grow">{children}</main>
                  <footer id="site-footer">
                    <Footer />
                  </footer>
                </div>
                <CookieBanner />
                <FloatingContactCTA />
              </PostHogProvider>
            </Suspense>
          </LanguageProvider>
        </UserProvider>
      </body>
    </html>
  );
}
