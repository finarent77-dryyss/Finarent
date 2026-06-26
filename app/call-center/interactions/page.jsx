import { prisma } from '@/lib/prisma';
import { requireCallCenterAccess } from '@/lib/call-center-access';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Interactions | Centre d\'appels',
};

export default async function CallCenterInteractionsPage() {
  const user = await requireCallCenterAccess();

  const interactions = await prisma.callCenterInteraction.findMany({
    where: user.callCenterId
      ? { callCenterId: user.callCenterId }
      : user.isAdmin
        ? { callCenterId: { not: null } }
        : { agentId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 80,
    include: {
      prospect: { select: { id: true, name: true, phone: true } },
      agent: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-primary">Appels & SMS</h1>
      <div className="bg-white rounded-2xl border border-gray-200 divide-y">
        {interactions.map((i) => (
          <div key={i.id} className="p-4 text-sm">
            <div className="flex flex-wrap gap-2 items-center mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                i.provider === 'RINGOVER' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {i.provider}
              </span>
              <span className="font-bold">{i.channel}</span>
              <span className="text-gray-400 text-xs ml-auto">
                {(i.occurredAt || i.createdAt).toLocaleString('fr-FR')}
              </span>
            </div>
            <p>{i.summary || i.notes || '—'}</p>
            {i.prospect && (
              <p className="text-xs text-secondary mt-1">
                Prospect : {i.prospect.name || i.prospect.phone}
              </p>
            )}
          </div>
        ))}
        {!interactions.length && (
          <p className="p-8 text-center text-gray-400">Aucune interaction.</p>
        )}
      </div>
    </div>
  );
}
