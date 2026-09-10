import { getSession } from '@auth0/nextjs-auth0';
import { offreVisibleParLeClient } from '@/lib/acces-dossier';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { syncUser } from '@/lib/users';
import DossierDetailClient from '@/components/espace/DossierDetailClient';

const STATUS_TO_LEGACY = {
  PENDING: 'en_attente',
  REVIEWING: 'en_cours',
  DOCUMENTS_NEEDED: 'documents_manquants',
  QUOTE_SENT: 'devis_envoye',
  QUOTE_ACCEPTED: 'devis_accepte',
  PENDING_SIGNATURE: 'signature_en_attente',
  SIGNED: 'signe',
  TRANSMITTED: 'transmis',
  APPROVED: 'validee',
  REJECTED: 'refusee',
  COMPLETED: 'finalise',
};

export default async function DossierDetailPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) {
    const EspaceLoginPrompt = (await import('@/components/espace/EspaceLoginPrompt')).default;
    return <EspaceLoginPrompt returnTo={`/espace/${id}`} />;
  }

  const dbUser = await syncUser(session.user);

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      documents: { where: { deletedAt: null } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
      // Les offres n'étaient pas chargées : le client ne voyait donc jamais ce
      // qui lui était proposé, alors que c'est l'objet même de la plateforme.
      offers: {
        orderBy: { createdAt: 'desc' },
        include: { partner: { select: { name: true } } },
      },
    },
  });

  if (!application || application.userId !== dbUser?.id) {
    notFound();
  }

  const dossier = {
    ...application,
    status: STATUS_TO_LEGACY[application.status] || application.status,
    amount: application.amount != null ? `${application.amount.toLocaleString()}€` : null,
    rawAmount: application.amount,
    duration: application.duration,
    documents: (application.documents || []).map((d) => ({
      ...d,
      path: d.fileUrl,
      originalName: d.fileName,
    })),
    // Ne remonte au navigateur que ce que l'écran affiche, et seulement les
    // offres réellement transmises : un brouillon n'existe pas pour le client.
    offers: (application.offers || [])
      .filter(offreVisibleParLeClient)
      .map((o) => ({
        id: o.id,
        amount: o.amount,
        durationMonths: o.durationMonths,
        monthlyPayment: o.monthlyPayment,
        rate: o.rate,
        totalCost: o.totalCost,
        status: o.status,
        partnerName: o.partner?.name || null,
        expiresAt: o.expiresAt ? o.expiresAt.toISOString() : null,
        sentAt: o.sentAt ? o.sentAt.toISOString() : null,
        acceptedAt: o.acceptedAt ? o.acceptedAt.toISOString() : null,
        signedAt: o.signedAt ? o.signedAt.toISOString() : null,
      })),
    statusHistory: (application.statusHistory || []).map(h => ({
      ...h,
      fromStatus: STATUS_TO_LEGACY[h.fromStatus] || h.fromStatus,
      toStatus: STATUS_TO_LEGACY[h.toStatus] || h.toStatus,
      createdAt: h.createdAt.toISOString(),
    })),
  };

  return (
    <DossierDetailClient
      dossier={dossier}
      user={{ ...session.user, id: dbUser.id }}
    />
  );
}
