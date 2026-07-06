import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAdminActivity } from '@/lib/admin-activity-log';
import { decryptString } from '@/lib/crypto.js';

/**
 * GET /api/admin/call-centers/[id]/commissions/export?status=PENDING
 * Export CSV des commissions d'un centre, pour préparer les virements.
 * Inclut l'IBAN du centre (utile pour les centres EXTERNAL). BOM UTF-8.
 */
export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // PENDING | PAID | CANCELLED | (vide = toutes)

  const center = await prisma.callCenter.findUnique({ where: { id } });
  if (!center) return NextResponse.json({ error: 'Centre introuvable' }, { status: 404 });

  // IBAN déchiffré pour le fichier de virement (admin uniquement)
  const centerIban = center.iban ? decryptString(center.iban) : null;

  const where = { callCenterId: id };
  if (status && ['PENDING', 'PAID', 'CANCELLED'].includes(status)) where.status = status;

  const commissions = await prisma.callCenterCommission.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      application: { select: { companyName: true, productType: true, amount: true } },
    },
  });

  const lines = [];
  lines.push(`# Versements — ${center.name} (${center.code})`);
  lines.push(`# Type: ${center.type} · IBAN: ${centerIban || '—'}`);
  lines.push(`# Exporté le: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('date,beneficiaire,iban,dossier,produit,montantFinance,typeCommission,taux,montantCommission,statut,payeLe');

  let total = 0;
  for (const c of commissions) {
    if (c.status === 'PENDING' || c.status === 'PAID') total += c.amount;
    lines.push(csvRow([
      c.createdAt.toISOString(),
      center.name,
      centerIban,
      c.application?.companyName,
      c.application?.productType,
      c.application?.amount,
      c.type,
      c.rate,
      c.amount.toFixed(2),
      c.status,
      c.paidAt?.toISOString(),
    ]));
  }
  lines.push('');
  lines.push(csvRow(['', '', '', '', '', '', '', 'TOTAL', total.toFixed(2), '', '']));

  const csv = '\uFEFF' + lines.join('\r\n');
  const filename = `finarent-virements-${center.code}-${new Date().toISOString().slice(0, 10)}.csv`;

  await logAdminActivity({
    actorId: auth.dbUser?.id,
    module: 'exports',
    action: 'EXPORT',
    entityType: 'CallCenterCommission',
    entityId: id,
    summary: `Export virements — centre ${center.name} (${commissions.length} commission(s))`,
    details: { rowCount: commissions.length, status, total },
    request,
  });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

function csvRow(values) {
  return values.map(csvCell).join(',');
}

function csvCell(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
