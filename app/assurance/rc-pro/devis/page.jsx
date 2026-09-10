import QuoteWizardPage from '@/components/quote/QuoteWizardPage';
import { pageMetadata } from '@/lib/seo';

// Composant serveur : seul un composant serveur peut exporter `metadata`.
// Les cinq tunnels de devis héritaient sinon du titre générique du site
// (constat PAGE-05). Le tunnel lui-même reste client, dans QuoteWizardPage.
export const metadata = pageMetadata({
  title: 'Devis RC Pro',
  description: 'Devis de responsabilité civile professionnelle en ligne : secteur d\'activité, chiffre d\'affaires, effectif. Sans engagement.',
  path: '/assurance/rc-pro/devis',
  keywords: ['devis RC Pro', 'responsabilité civile professionnelle', 'assurance professionnelle', 'Finarent'],
});

export default function RcProDevisPage() {
  return <QuoteWizardPage product="rc-pro" />;
}
