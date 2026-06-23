import ComparateurClient from './ComparateurClient';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Comparateur crédit-bail, LOA & crédit pro',
  description:
    'Comparez les solutions de financement professionnel Finarent : crédit-bail, LOA, LLD et crédit pro selon votre secteur et votre besoin.',
  path: '/comparateur',
});

export default function ComparateurPage() {
  return <ComparateurClient />;
}
