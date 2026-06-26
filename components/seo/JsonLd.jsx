import { SITE_URL } from '@/lib/seo';

const OFFER_CATALOG = {
  '@type': 'OfferCatalog',
  name: 'Services Finarent',
  itemListElement: [
    {
      '@type': 'OfferCatalog',
      name: 'Financement professionnel',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Crédit-bail' }, url: `${SITE_URL}/solutions/credit-bail` },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'LOA' }, url: `${SITE_URL}/solutions/loa` },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'LLD' }, url: `${SITE_URL}/solutions/lld` },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Crédit professionnel' }, url: `${SITE_URL}/solutions/credit-pro` },
      ],
    },
    {
      '@type': 'OfferCatalog',
      name: 'Assurance professionnelle',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Assurance entreprise' }, url: `${SITE_URL}/assurance` },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Simulateurs' }, url: `${SITE_URL}/simulateurs` },
      ],
    },
  ],
};

export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['FinancialService', 'LocalBusiness', 'Organization'],
    name: 'Finarent',
    alternateName: 'Finarent — Courtier financement & assurance pro',
    url: SITE_URL,
    logo: `${SITE_URL}/finarent-logo.jpg`,
    image: `${SITE_URL}/hero_business_team_premium_v2_1772271137874.png`,
    telephone: '+33123456789',
    email: 'contact@finarent.fr',
    description:
      'Courtier en financement professionnel et assurance pour TPE/PME. Crédit-bail, LOA, LLD, RC Pro. Réponse sous 48h.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'FR',
    },
    areaServed: 'France',
    hasOfferCatalog: OFFER_CATALOG,
    priceRange: '€€',
    currenciesAccepted: 'EUR',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebSiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Finarent',
    url: SITE_URL,
    inLanguage: 'fr-FR',
    publisher: { '@type': 'Organization', name: 'Finarent', url: SITE_URL },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/faq?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FAQJsonLd({ items }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
