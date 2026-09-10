import QuoteWizardPage from '@/components/quote/QuoteWizardPage';
import { pageMetadata } from '@/lib/seo';

// Composant serveur : seul un composant serveur peut exporter `metadata`.
// Les cinq tunnels de devis héritaient sinon du titre générique du site
// (constat PAGE-05). Le tunnel lui-même reste client, dans QuoteWizardPage.
export const metadata = pageMetadata({
  title: 'Devis mutuelle santé',
  description: 'Devis de mutuelle santé et prévoyance en ligne : bénéficiaires, niveau de garanties, budget. Sans engagement.',
  path: '/assurance/sante/devis',
  keywords: ['devis mutuelle santé', 'complémentaire santé', 'prévoyance', 'Finarent'],
});

export default function SanteDevisPage() {
  return <QuoteWizardPage product="sante" />;
}
