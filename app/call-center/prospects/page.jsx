import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireCallCenterAccess, callCenterProspectWhere } from '@/lib/call-center-access';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Prospects | Centre d\'appels',
};

const STATUS_LABELS = {
  NEW: 'Nouveau',
  CONTACTED: 'Contacté',
  QUALIFIED: 'Qualifié',
  CONVERTED: 'Converti',
  LOST: 'Perdu',
};

export default async function CallCenterProspectsPage({ searchParams }) {
  const user = await requireCallCenterAccess();
  const q = (await searchParams)?.q?.trim() || '';
  const where = {
    ...callCenterProspectWhere(user),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
            { company: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const prospects = await prisma.prospect.findMany({
    where,
    orderBy: { lastSeenAt: 'desc' },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      status: true,
      lastCallAt: true,
      lastCallOutcome: true,
      assignedAgent: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary">Prospects</h1>
          <p className="text-sm text-gray-500">{prospects.length} fiche(s)</p>
        </div>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher…"
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
          <button type="submit" className="px-4 py-2 bg-secondary text-white rounded-xl text-sm font-bold">
            Filtrer
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Contact</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Dernier appel</th>
              <th className="p-3">Agent</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {prospects.map((p) => (
              <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-3">
                  <p className="font-bold text-primary">{p.name || '—'}</p>
                  <p className="text-gray-500">{p.phone || p.email || '—'}</p>
                  {p.company && <p className="text-xs text-gray-400">{p.company}</p>}
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-700">
                    {STATUS_LABELS[p.status] || p.status}
                  </span>
                </td>
                <td className="p-3 text-gray-500 text-xs">
                  {p.lastCallAt
                    ? new Date(p.lastCallAt).toLocaleString('fr-FR')
                    : '—'}
                  {p.lastCallOutcome && <span className="block">{p.lastCallOutcome}</span>}
                </td>
                <td className="p-3 text-xs text-gray-500">
                  {p.assignedAgent?.name || p.assignedAgent?.email || '—'}
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/call-center/prospects/${p.id}`}
                    className="text-secondary font-bold hover:underline"
                  >
                    Ouvrir
                  </Link>
                </td>
              </tr>
            ))}
            {!prospects.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  Aucun prospect pour votre périmètre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
