import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireCallCenterAccess, callCenterProspectWhere } from '@/lib/call-center-access';
import { ringoverApiConfigured } from '@/lib/ringover/api-client';
import RingoverBanner from '@/components/admin/RingoverBanner';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Centre d'appels | Finarent",
};

export default async function CallCenterDashboardPage() {
  const user = await requireCallCenterAccess();
  const where = callCenterProspectWhere(user);

  const [totalProspects, contacted, interactions, centerName] = await Promise.all([
    prisma.prospect.count({ where }),
    prisma.prospect.count({ where: { ...where, status: { not: 'NEW' } } }),
    prisma.callCenterInteraction.count({
      where: user.callCenterId
        ? { callCenterId: user.callCenterId }
        : { callCenterId: { not: null } },
    }),
    user.membership?.callCenter?.name ?? 'Tous les centres',
  ]);

  return (
    <div className="space-y-6">
      <RingoverBanner />
      <div>
        <h1 className="text-3xl font-black text-primary tracking-tight">
          Centre d&apos;appels
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {centerName} · {user.isManager ? 'Vue responsable' : 'Vos prospects assignés'}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Prospects', value: totalProspects, icon: 'fa-users', href: '/call-center/prospects' },
          { label: 'Contactés', value: contacted, icon: 'fa-phone' },
          { label: 'Interactions', value: interactions, icon: 'fa-comments' },
          { label: 'Ringover', value: ringoverApiConfigured() ? 'Actif' : 'Non config.', icon: 'fa-plug' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-400">{card.label}</p>
            <p className="text-3xl font-black text-primary mt-1">{card.value}</p>
            {card.href && (
              <Link href={card.href} className="text-xs font-bold text-secondary mt-2 inline-block hover:underline">
                Voir →
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-primary mb-3">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/call-center/prospects" className="px-4 py-2 bg-secondary text-white rounded-xl text-sm font-bold">
            Mes prospects
          </Link>
          <Link href="/call-center/interactions" className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold">
            Historique appels
          </Link>
          {user.isManager && (
            <Link href="/call-center/team" className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold">
              Équipe
            </Link>
          )}
          <Link href="/admin/centre-appel" className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">
            File d&apos;appels
          </Link>
        </div>
      </div>
    </div>
  );
}
