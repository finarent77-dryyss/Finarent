import QuoteWizardPage from '@/components/quote/QuoteWizardPage';
import { pageMetadata } from '@/lib/seo';

// Composant serveur : seul un composant serveur peut exporter `metadata`.
// Les cinq tunnels de devis héritaient sinon du titre générique du site
// (constat PAGE-05). Le tunnel lui-même reste client, dans QuoteWizardPage.
export const metadata = pageMetadata({
  title: 'Devis assurance moto et 2-roues',
  description: 'Devis d\'assurance moto, scooter et 2-roues en ligne : cylindrée, usage, profil conducteur. Sans engagement.',
  path: '/assurance/moto/devis',
  keywords: ['devis assurance moto', 'assurance scooter', 'assurance 2-roues', 'Finarent'],
});

export default function MotoDevisPage() {
  return <QuoteWizardPage product="moto" />;
}
