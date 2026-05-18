import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/affiliates/[id]/export
 * Export CSV complet de l'historique d'un affilié.
 * Concatène : clics + leads + dossiers + commissions + invitations.
 *
 * Format : section par section avec en-tête.
 */
export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const affiliate = await prisma.affiliate.findUnique({ where: { id } });
  if (!affiliate) {
    return NextResponse.json({ error: 'Affilié introuvable' }, { status: 404 });
  }

  const [clicks, prospects, applications, commissions, invites] = await Promise.all([
    prisma.affiliateClick.findMany({ where: { affiliateId: id }, orderBy: { createdAt: 'desc' } }),
    prisma.prospect.findMany({
      where: { affiliateId: id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, company: true, status: true, createdAt: true },
    }),
    prisma.application.findMany({
      where: { affiliateId: id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, companyName: true, productType: true, amount: true, status: true, createdAt: true },
    }),
    prisma.affiliateCommission.findMany({
      where: { affiliateId: id },
      orderBy: { createdAt: 'desc' },
      include: { application: { select: { companyName: true } } },
    }),
    prisma.affiliateInvite.findMany({ where: { affiliateId: id }, orderBy: { sentAt: 'desc' } }),
  ]);

  const sections = [];

  // Header
  sections.push(`# Export Finarent — Affilié: ${affiliate.name} (${affiliate.code})`);
  sections.push(`# Email: ${affiliate.email}`);
  sections.push(`# Exporté le: ${new Date().toISOString()}`);
  sections.push('');

  // Clics
  sections.push('## CLICS');
  sections.push('date,landingPath,referer,ip,userAgent');
  for (const c of clicks) {
    sections.push(csvRow([c.createdAt.toISOString(), c.landingPath, c.referer, c.ip, c.userAgent]));
  }
  sections.push('');

  // Leads
  sections.push('## LEADS');
  sections.push('date,name,email,company,status');
  for (const p of prospects) {
    sections.push(csvRow([p.createdAt.toISOString(), p.name, p.email, p.company, p.status]));
  }
  sections.push('');

  // Dossiers
  sections.push('## DOSSIERS');
  sections.push('date,companyName,productType,amount,status');
  for (const a of applications) {
    sections.push(csvRow([a.createdAt.toISOString(), a.companyName, a.productType, a.amount, a.status]));
  }
  sections.push('');

  // Commissions
  sections.push('## COMMISSIONS');
  sections.push('date,dossier,type,taux,montant,statut,paidAt');
  for (const c of commissions) {
    sections.push(
      csvRow([
        c.createdAt.toISOString(),
        c.application?.companyName,
        c.type,
        c.rate,
        c.amount,
        c.status,
        c.paidAt?.toISOString(),
      ]),
    );
  }
  sections.push('');

  // Invitations
  sections.push('## INVITATIONS');
  sections.push('date,email,name,source,status,failedReason');
  for (const i of invites) {
    sections.push(
      csvRow([i.sentAt.toISOString(), i.recipientEmail, i.recipientName, i.source, i.status, i.failedReason]),
    );
  }

  const csv = sections.join('\n');
  const filename = `finarent-affiliate-${affiliate.code}-${new Date().toISOString().slice(0, 10)}.csv`;

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
  // Échapper guillemets + entourer si contient virgule, guillemet ou retour ligne
  if (/[",\n;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
