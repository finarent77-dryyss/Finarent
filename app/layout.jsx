import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PublicBgEffect from '@/components/layout/PublicBgEffect';
import AffiliateTracker from '@/components/AffiliateTracker';
import CookieBanner from '@/components/ui/CookieBanner';
import FloatingContactCTA from '@/components/ui/FloatingContactCTA';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { LanguageProvider } from '@/lib/i18n';
import PostHogProvider from '@/components/providers/PostHogProvider';
import AttributionCapture from '@/components/providers/AttributionCapture';
import ClarityTracker from '@/components/providers/ClarityTracker';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';
import { SITE_URL } from '@/lib/seo';
import './globals.css';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Finarent | Financement & Assurance Professionnel',
    template: '%s | Finarent',
  },
  description: 'Finarent accompagne les entreprises dans leur financement professionnel (crédit-bail, LOA, leasing) et leur assurance (RC Pro, flotte, multirisque). De 3 000€ à 2 M€, réponse en 48h.',
  keywords: ['financement professionnel', 'crédit-bail', 'leasing', 'LOA', 'assurance pro', 'RC Pro', 'courtier financement', 'PME'],
  applicationName: 'Finarent',
  authors: [{ name: 'Finarent' }],
  icons: {
    icon: [
      { url: '/finarent-pastille.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/icon-192.png',
    apple: '/icon-192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Finarent',
    title: 'Finarent | Financement & Assurance Professionnel',
    description: 'Crédit-bail, leasing, assurance pro. Réponse en 48h. 120+ entreprises accompagnées, 88% d\'accords.',
    images: [{ url: '/hero_business_team_premium_v2_1772271137874.png', width: 1200, height: 630, alt: 'Finarent — Financement professionnel' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finarent | Financement & Assurance Professionnel',
    description: 'Crédit-bail, leasing, assurance pro. Réponse en 48h.',
    images: ['/hero_business_team_premium_v2_1772271137874.png'],
  },
  robots: { index: true, follow: true },
  verification: {
    google: 'AX2Gwgw9dAs7ADPJY0JU9pbbNMxNfyPaOGX3N7QRnPw',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        {/* reCAPTCHA v3 : sans ce script, window.grecaptcha n'existe pas et aucun
            formulaire public ne peut produire de jeton valide. */}
        {RECAPTCHA_SITE_KEY ? (
          <script
            src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
            async
            defer
          />
        ) : null}
      </head>
      <body>
        <UserProvider>
          <LanguageProvider>
            {/* Frontière Suspense réduite aux seuls composants qui lisent les
                paramètres d'URL (`useSearchParams`) : le suivi d'audience PostHog
                et le suivi d'apporteur d'affaires.

                Elle englobait auparavant Header, <main>{children}</main> et Footer.
                Or `useSearchParams()` fait basculer la frontière Suspense la plus
                proche sur son `fallback` au prérendu : toute page ainsi englobée
                était servie vide (marqueur BAILOUT_TO_CLIENT_SIDE_RENDERING), et
                comme la coquille partait déjà en HTTP 200, `notFound()` et
                `redirect()` des pages ne pouvaient plus fixer le code de réponse.
                Ne jamais réélargir cette frontière au contenu de page. */}
            <Suspense fallback={null}>
              <PostHogProvider />
              <AffiliateTracker />
            </Suspense>
            <PublicBgEffect />
            <AttributionCapture />
            <ClarityTracker />
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
          </LanguageProvider>
        </UserProvider>
      </body>
    </html>
  );
}
