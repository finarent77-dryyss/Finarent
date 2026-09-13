import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { syncUser } from '@/lib/users';
import { stripSensitive } from '@/lib/sensitive';
import { STATUS_TO_LEGACY } from '@/lib/statusMap';
import { peutRattacherDossiersAnonymes } from '@/lib/acces-dossier';
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
  
  // Rattacher les demandes déposées sans compte depuis le formulaire /contact.
  //
  // L'API `/api/applications` le faisait déjà, mais cette page lit la base
  // directement et ne l'appelle pas : une demande envoyée depuis /contact, puis
  // consultée ici, n'apparaissait jamais dans « Mes dossiers » — retour client
  // du 13 septembre 2026. Même garde que l'API : le rattachement n'a lieu que si
  // Auth0 atteste la possession de l'adresse (`email_verified`), sans quoi
  // ouvrir un compte avec l'adresse d'un tiers suffirait à lire son dossier.
  if (peutRattacherDossiersAnonymes(session.user, dbUser)) {
    await prisma.application.updateMany({
      where: { email: dbUser.email, userId: null },
      data: { userId: dbUser.id },
    });
  }

  // Récupérer les demandes (applications) de l'utilisateur
  const applications = await prisma.application.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
    include: { documents: { where: { deletedAt: null } } }
  });

  const demandes = applications.map((a) => ({
    ...a,
    status: STATUS_TO_LEGACY[a.status] || a.status,
    amount: a.amount != null ? `${a.amount.toLocaleString()}€` : a.amount,
    documents: (a.documents || []).map((d) => ({ ...d, path: d.fileUrl, originalName: d.fileName })),
  }));

  return <DashboardClient user={session.user} dbUser={stripSensitive('User', dbUser)} initialDemandes={demandes} />;
}
