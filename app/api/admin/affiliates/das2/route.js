import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/users';
import { logAffiliateAction } from '@/lib/affiliate-fiscal.js';

export async function GET(request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const adminAccess = await isAdmin(session.user);
  if (!adminAccess) return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });

  const url = new URL(request.url);
  const year = parseInt(url.searchParams.get('year') || String(new Date().getFullYear()), 10);
  const threshold = parseFloat(url.searchParams.get('threshold') || '1200');

  const invoices = await prisma.affiliateInvoice.findMany({
    where: {
      issuedAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
      status: { in: ['ISSUED', 'SENT'] },
    },
    include: {
      affiliate: {
        select: {
          code: true,
          legalName: true,
          name: true,
          siret: true,
          fiscalAddress: true,
          fiscalPostalCode: true,
          fiscalCity: true,
          fiscalStatus: true,
        },
      },
    },
  });

  const byAffiliate = new Map();
  for (const inv of invoices) {
    const key = inv.affiliateId;
    const prev = byAffiliate.get(key) || { affiliate: inv.affiliate, totalHT: 0, count: 0 };
    prev.totalHT += inv.amountHT;
    prev.count += 1;
    byAffiliate.set(key, prev);
  }

  const rows = [];
  rows.push(['Code', 'Nom légal', 'SIRET', 'Adresse', 'CP', 'Ville', 'Statut fiscal', 'Total HT année', 'Nb factures'].join(';'));

  for (const [, data] of byAffiliate) {
    if (data.totalHT < threshold) continue;
    const a = data.affiliate;
    rows.push([
      a.code,
      a.legalName || a.name,
      a.siret || '',
      a.fiscalAddress || '',
      a.fiscalPostalCode || '',
      a.fiscalCity || '',
      a.fiscalStatus || '',
      data.totalHT.toFixed(2),
      data.count,
    ].join(';'));
  }

  const csv = `\uFEFF${rows.join('\n')}`;
  const dbUser = await prisma.user.findUnique({
    where: { auth0Id: session.user.sub },
    select: { id: true },
  });

  await logAffiliateAction({
    actorId: dbUser?.id,
    entityType: 'EXPORT',
    entityId: `DAS2-${year}`,
    action: 'DAS2_EXPORT',
    after: { year, threshold, rowCount: rows.length - 1 },
  });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="DAS2_FINARENT_${year}.csv"`,
    },
  });
}
