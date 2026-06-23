import HomeClient from '@/components/pages/HomeClient';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Financement professionnel — Crédit-bail, LOA & assurance pro',
  description:
    'Finarent accompagne les TPE/PME : crédit-bail, LOA, LLD, crédit pro et assurance RC Pro. De 3 000 € à 2 M€, réponse sous 48h. Simulez votre projet en ligne.',
  path: '/',
});

export default function Home() {
  return <HomeClient />;
}
