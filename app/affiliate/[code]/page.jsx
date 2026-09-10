import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AffiliatePublicClient from './AffiliatePublicClient';

export const metadata = {
  title: 'Espace apporteur d\'affaires | Finarent',
  robots: { index: false, follow: false }, // pages perso non-indexables
};

/**
 * Vérifie côté serveur que le code d'apporteur correspond à une page publique
 * réellement exposée — constat PAGE-06 : un code inconnu répondait HTTP 200,
 * donc aucun outil de supervision ne pouvait repérer un lien d'affiliation mort.
 *
 * La règle de visibilité est celle de GET /api/affiliate/[code]/stats
 * (existence + `isActive` + `publicStatsEnabled`) : les deux doivent rester
 * alignées, la page n'étant que la façade de cette route.
 *
 * En cas d'indisponibilité de la base, on ne conclut pas à l'absence : la page
 * est rendue et le client affiche son écran « Page non disponible », comme
 * avant. Un incident d'infrastructure ne doit pas se traduire par un 404.
 */
async function pagePubliqueExiste(code) {
  try {
    const affiliate = await prisma.affiliate.findUnique({
      where: { code: code.toUpperCase() },
      select: { isActive: true, publicStatsEnabled: true },
    });
    if (!affiliate) return false;
    return affiliate.isActive === true && affiliate.publicStatsEnabled === true;
  } catch {
    return true;
  }
}

export default async function AffiliatePublicPage({ params }) {
  const { code } = await params;
  if (!(await pagePubliqueExiste(code))) notFound();
  return <AffiliatePublicClient code={code} />;
}
