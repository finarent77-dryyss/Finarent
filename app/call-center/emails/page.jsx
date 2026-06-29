import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireCallCenterAccess, callCenterProspectWhere } from '@/lib/call-center-access';
import { getCallCenterOutboundEmailStats, getLastProspectionEmailsByProspectIds } from '@/lib/email/outbound-attribution.js';
import { isBrevoReady } from '@/lib/brevo/client.js';
import OutboundEmailForm from '@/components/call-center/OutboundEmailForm';
import BulkProspectEmailPanel from '@/components/call-center/BulkProspectEmailPanel';
import RingoverBanner from '@/components/admin/RingoverBanner';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Emails prospection | Centre d\'appels Finarent',
};

export default async function CallCenterEmailsPage() {
  const user = await requireCallCenterAccess();
  const where = callCenterProspectWhere(user);

  const stats = await getCallCenterOutboundEmailStats({
    callCenterId: user.callCenterId,
    senderUserId: user.id,
  });

  const prospects = await prisma.prospect.findMany({
    where: { ...where, email: { not: null } },
    select: { id: true, name: true, email: true, company: true },
    orderBy: { updatedAt: 'desc' },
    take: 500,
  });

  const lastEmailMap = await getLastProspectionEmailsByProspectIds(prospects.map((p) => p.id));
  const prospectsForBulk = prospects.map((p) => ({
    ...p,
    lastProspectionEmailAt: lastEmailMap.get(p.id) ?? null,
  }));

  return (
    <div className="space-y-6">
      <RingoverBanner />
      <Link href="/call-center" className="text-sm font-semibold text-gray-500 hover:text-primary">
        ← Tableau de bord
      </Link>

      <div>
        <h1 className="text-3xl font-black text-primary tracking-tight">Emails sortants</h1>
        <p className="text-sm text-gray-500 mt-1">
          Prospection via Brevo {isBrevoReady() ? '(actif)' : '(non configuré — ajoutez BREVO_API_KEY)'}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Envoyés', value: stats.total },
          { label: 'Ouverts', value: stats.opened },
          { label: 'Convertis', value: stats.converted },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-400">{k.label}</p>
            <p className="text-3xl font-black text-primary mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <BulkProspectEmailPanel prospects={prospectsForBulk} />
      <div>
        <h2 className="text-lg font-bold text-primary mb-3">Envoi unitaire</h2>
        <OutboundEmailForm />
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b font-bold text-primary">Historique</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Destinataire</th>
                <th className="px-5 py-3">Objet</th>
                <th className="px-5 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {stats.logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-50">
                  <td className="px-5 py-3">{new Date(log.sentAt).toLocaleString('fr-FR')}</td>
                  <td className="px-5 py-3">{log.recipientEmail}</td>
                  <td className="px-5 py-3">{log.subject}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100">{log.status}</span>
                  </td>
                </tr>
              ))}
              {!stats.logs.length && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-400">Aucun email envoyé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
