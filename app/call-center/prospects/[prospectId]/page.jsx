import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireCallCenterAccess, canManageProspect } from '@/lib/call-center-access';
import { ringoverApiConfigured } from '@/lib/ringover/api-client';
import { getCallCenterRingoverNumbers } from '@/lib/ringover/center-numbers';
import RingoverProspectActions from '@/components/call-center/RingoverProspectActions';

export const dynamic = 'force-dynamic';

export default async function CallCenterProspectDetailPage({ params }) {
  const user = await requireCallCenterAccess();
  const { prospectId } = await params;

  const prospect = await prisma.prospect.findUnique({
    where: { id: prospectId },
    include: {
      callCenter: { select: { id: true, name: true, ringoverPhoneNumbers: true } },
      assignedAgent: { select: { id: true, name: true, email: true } },
      callCenterInteractions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { agent: { select: { name: true, email: true } } },
      },
    },
  });

  if (!prospect || !canManageProspect(user, prospect)) {
    notFound();
  }

  const smsNumbers = getCallCenterRingoverNumbers(prospect.callCenter);

  return (
    <div className="space-y-6">
      <Link href="/call-center/prospects" className="text-sm text-gray-500 hover:text-primary">
        ← Retour aux prospects
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h1 className="text-2xl font-black text-primary">{prospect.name || 'Prospect'}</h1>
        <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs uppercase font-bold">Téléphone</p>
            <p className="font-semibold">{prospect.phone || '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase font-bold">E-mail</p>
            <p className="font-semibold">{prospect.email || '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase font-bold">Entreprise</p>
            <p className="font-semibold">{prospect.company || '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase font-bold">Centre</p>
            <p className="font-semibold">{prospect.callCenter?.name || '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase font-bold">Agent assigné</p>
            <p className="font-semibold">
              {prospect.assignedAgent?.name || prospect.assignedAgent?.email || '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase font-bold">Statut</p>
            <p className="font-semibold">{prospect.status}</p>
          </div>
        </div>
        {prospect.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
            {prospect.notes}
          </div>
        )}
      </div>

      <RingoverProspectActions
        prospectId={prospect.id}
        phone={prospect.phone}
        ringoverApi={ringoverApiConfigured()}
        smsNumbers={smsNumbers}
      />

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-primary mb-4">Interactions récentes</h2>
        <ul className="space-y-3">
          {prospect.callCenterInteractions.map((i) => (
            <li key={i.id} className="border border-gray-100 rounded-xl p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700">
                  {i.provider}
                </span>
                <span className="text-gray-500">{i.channel}</span>
                <span className="text-gray-400 text-xs ml-auto">
                  {(i.occurredAt || i.createdAt).toLocaleString('fr-FR')}
                </span>
              </div>
              <p>{i.summary || i.notes || '—'}</p>
              {i.agent && (
                <p className="text-xs text-gray-400 mt-1">
                  {i.agent.name || i.agent.email}
                </p>
              )}
            </li>
          ))}
          {!prospect.callCenterInteractions.length && (
            <li className="text-gray-400 text-sm">Aucune interaction enregistrée.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
