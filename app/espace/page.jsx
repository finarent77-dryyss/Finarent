import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { syncUser } from '@/lib/users';
import { STATUS_TO_LEGACY } from '@/lib/statusMap';
import DashboardClient from '@/components/espace/DashboardClient';
import EspaceLoginClient from '@/components/espace/EspaceLoginClient';

export default async function EspacePage() {
  const session = await getSession();

  if (!session?.user) {
    return <EspaceLoginClient />;
  }

  const dbUser = await syncUser(session.user);

  // Redirection automatique selon le rôle
  if (dbUser.role === 'ADMIN') redirect('/admin');
  if (dbUser.role === 'PARTNER') redirect('/partner');
  if (dbUser.role === 'INSURER') redirect('/insurer');
  
  // Récupérer les demandes (applications) de l'utilisateur
  const applications = await prisma.application.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
    include: { documents: true }
  });

  const demandes = applications.map((a) => ({
    ...a,
    status: STATUS_TO_LEGACY[a.status] || a.status,
    amount: a.amount != null ? `${a.amount.toLocaleString()}€` : a.amount,
    documents: (a.documents || []).map((d) => ({ ...d, path: d.fileUrl, originalName: d.fileName })),
  }));

  return <DashboardClient user={session.user} dbUser={dbUser} initialDemandes={demandes} />;
}
