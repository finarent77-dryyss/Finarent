import { prisma } from '@/lib/prisma';
import { requireCallCenterManager } from '@/lib/call-center-access';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Équipe | Centre d\'appels',
};

export default async function CallCenterTeamPage() {
  const user = await requireCallCenterManager();
  if (!user.callCenterId) {
    return (
      <p className="text-gray-500">Sélectionnez un centre depuis l&apos;admin pour gérer l&apos;équipe.</p>
    );
  }

  const members = await prisma.callCenterMember.findMany({
    where: { callCenterId: user.callCenterId, isActive: true },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
  });

  const stats = await prisma.prospect.groupBy({
    by: ['assignedAgentId'],
    where: { callCenterId: user.callCenterId, assignedAgentId: { not: null } },
    _count: { id: true },
  });
  const countByAgent = Object.fromEntries(
    stats.map((s) => [s.assignedAgentId, s._count.id]),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-primary">Équipe</h1>
        <p className="text-sm text-gray-500">{user.membership?.callCenter?.name}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Membre</th>
              <th className="p-3">Rôle</th>
              <th className="p-3">Prospects assignés</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t border-gray-100">
                <td className="p-3">
                  <p className="font-bold">{m.user.name || m.user.email}</p>
                  <p className="text-gray-500 text-xs">{m.user.email}</p>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    m.role === 'MANAGER' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-700'
                  }`}>
                    {m.role === 'MANAGER' ? 'Responsable' : 'Agent'}
                  </span>
                </td>
                <td className="p-3 font-bold">{countByAgent[m.userId] ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Ajout / retrait de membres :{' '}
        <a href={`/admin/call-centers/${user.callCenterId}`} className="text-secondary font-bold hover:underline">
          Admin centres d&apos;appel
        </a>
      </p>
    </div>
  );
}
