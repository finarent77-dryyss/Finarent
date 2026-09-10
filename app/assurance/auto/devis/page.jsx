import QuoteWizardPage from '@/components/quote/QuoteWizardPage';
import { pageMetadata } from '@/lib/seo';

// Composant serveur : seul un composant serveur peut exporter `metadata`.
// Les cinq tunnels de devis héritaient sinon du titre générique du site
// (constat PAGE-05). Le tunnel lui-même reste client, dans QuoteWizardPage.
export const metadata = pageMetadata({
  title: 'Devis assurance auto',
  description: 'Obtenez votre devis d\'assurance auto en quelques questions : marque, mise en circulation, usage et profil conducteur. Sans engagement.',
  path: '/assurance/auto/devis',
  keywords: ['devis assurance auto', 'assurance voiture', 'Finarent'],
});

export default function AutoDevisPage() {
  return <QuoteWizardPage product="auto" />;
}
