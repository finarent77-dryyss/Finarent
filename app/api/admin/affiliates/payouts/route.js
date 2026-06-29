import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/users';
import {
  listAffiliatesReadyForPayout,
  createAffiliatePayout,
  validateAffiliateCommission,
} from '@/lib/affiliate-payouts.js';

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const adminAccess = await isAdmin(session.user);
  if (!adminAccess) return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });

  const [ready, payouts] = await Promise.all([
    listAffiliatesReadyForPayout(),
    prisma.affiliatePayout.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        affiliate: { select: { code: true, name: true, legalName: true, email: true } },
        invoice: { select: { id: true, invoiceNumber: true, amountTTC: true } },
        _count: { select: { commissions: true } },
      },
    }),
  ]);

  return NextResponse.json({ ready, payouts });
}

export async function POST(request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const adminAccess = await isAdmin(session.user);
  if (!adminAccess) return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });

  const dbUser = await prisma.user.findUnique({
    where: { auth0Id: session.user.sub },
    select: { id: true },
  });

  const body = await request.json();
  const { action, affiliateId, commissionId, commissionIds } = body;

  try {
    if (action === 'validate' && commissionId) {
      const updated = await validateAffiliateCommission(commissionId, dbUser?.id);
      return NextResponse.json({ ok: true, commission: updated });
    }

    if (action === 'validate_bulk' && Array.isArray(commissionIds)) {
      const results = [];
      for (const id of commissionIds) {
        try {
          results.push(await validateAffiliateCommission(id, dbUser?.id));
        } catch (e) {
          results.push({ id, error: e.message });
        }
      }
      return NextResponse.json({ ok: true, results });
    }

    if (action === 'payout' && affiliateId) {
      const result = await createAffiliatePayout(affiliateId, dbUser?.id);
      return NextResponse.json({ ok: true, ...result });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Erreur' }, { status: 400 });
  }
}
