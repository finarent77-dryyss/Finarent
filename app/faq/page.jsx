import FAQClient from './FAQClient';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'FAQ financement & assurance professionnels',
  description:
    'Réponses sur le crédit-bail, la LOA, la LLD, l\'assurance RC Pro, les délais et le processus de demande Finarent.',
  path: '/faq',
});

export default function FAQPage() {
  return <FAQClient />;
}
