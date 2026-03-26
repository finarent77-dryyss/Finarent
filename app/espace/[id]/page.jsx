import { getSession } from '@auth0/nextjs-auth0';
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
      documents: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!application || application.userId !== dbUser?.id) {
    notFound();
  }

  const dossier = {
    ...application,
    status: STATUS_TO_LEGACY[application.status] || application.status,
    amount: application.amount != null ? `${application.amount.toLocaleString()}€` : null,
    documents: (application.documents || []).map((d) => ({
      ...d,
      path: d.fileUrl,
      originalName: d.fileName,
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
