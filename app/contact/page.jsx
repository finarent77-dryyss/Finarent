import ContactClient from '@/components/pages/ContactClient';

export const metadata = {
  title: 'Contact | Finarent',
  description: 'Contactez Finarent pour une demande de financement ou d\'assurance professionnelle. Réponse sous 48h.',
};

/**
 * Les paramètres d'URL (préremplissage depuis un simulateur) sont lus ici, côté
 * serveur, et passés en props. Auparavant ContactClient appelait
 * `useSearchParams()` derrière un `<Suspense>` : la page entière basculait alors
 * en rendu navigateur et son HTML ne contenait ni titre ni formulaire
 * (constat PAGE-01). La page devient dynamique, ce qui est cohérent : son
 * contenu dépend de la requête.
 */
export default async function ContactPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const params = {};
  for (const [cle, valeur] of Object.entries(sp)) {
    if (typeof valeur === 'string') params[cle] = valeur;
    else if (Array.isArray(valeur) && typeof valeur[0] === 'string') params[cle] = valeur[0];
  }
  return <ContactClient initialParams={params} />;
}
