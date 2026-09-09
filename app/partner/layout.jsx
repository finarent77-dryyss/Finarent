import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { syncUser } from '@/lib/users';
import { prisma } from '@/lib/prisma';
import { partenaireRattache } from '@/lib/acces-dossier';
import PartnerSidebar from '@/components/partner/PartnerSidebar';

export default async function PartnerLayout({ children }) {
  const session = await getSession();
  if (!session?.user) {
    redirect('/api/auth/login?returnTo=/partner');
  }

  const dbUser = await syncUser(session.user);

  if (dbUser.role !== 'PARTNER' && dbUser.role !== 'ADMIN') {
    redirect('/espace');
  }

  // Même règle que `requirePartner` (lib/auth.ts) : un compte PARTNER sans
  // société de rattachement n'a accès à aucun dossier. Sans ce second contrôle,
  // la mise en place du garde côté API produisait une coquille d'interface où
  // chaque panneau échouait en 403 — aucune fuite de données, mais un espace
  // inutilisable et incompréhensible. Mieux vaut une redirection franche.
  if (!partenaireRattache(dbUser)) {
    redirect('/espace');
  }

  let partnerName = 'Partenaire';
  if (dbUser.partnerId) {
    const partner = await prisma.partner.findUnique({ where: { id: dbUser.partnerId }, select: { name: true } });
    if (partner) partnerName = partner.name;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PartnerSidebar email={session.user.email} partnerName={partnerName} />
      <main className="lg:ml-64 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
