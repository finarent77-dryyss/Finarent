import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MANDATE_VERSION, MANDATE_TEXT } from '@/lib/affiliate-mandate.js';
import { isValidIban, isValidSiret, logAffiliateAction } from '@/lib/affiliate-fiscal.js';

export async function GET(request, { params }) {
  const { code } = await params;
  const affiliate = await prisma.affiliate.findUnique({
    where: { code: code.toUpperCase() },
    select: {
      id: true,
      code: true,
      name: true,
      isActive: true,
      onboardingCompletedAt: true,
      mandateSignedAt: true,
      fiscalStatus: true,
      legalName: true,
      siret: true,
      iban: true,
      payoutMinAmount: true,
    },
  });

  if (!affiliate || !affiliate.isActive) {
    return NextResponse.json({ error: 'Affilié introuvable' }, { status: 404 });
  }

  return NextResponse.json({
    affiliate,
    mandateText: MANDATE_TEXT,
    mandateVersion: MANDATE_VERSION,
    completed: Boolean(affiliate.onboardingCompletedAt && affiliate.mandateSignedAt),
  });
}

export async function POST(request, { params }) {
  const { code } = await params;
  const affiliate = await prisma.affiliate.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!affiliate || !affiliate.isActive) {
    return NextResponse.json({ error: 'Affilié introuvable' }, { status: 404 });
  }

  const body = await request.json();
  const {
    fiscalStatus,
    legalName,
    siret,
    tvaNumber,
    tvaApplicable,
    fiscalAddress,
    fiscalPostalCode,
    fiscalCity,
    fiscalCountry,
    iban,
    bic,
    payoutHolder,
    acceptMandate,
  } = body;

  if (!acceptMandate) {
    return NextResponse.json({ error: 'Vous devez accepter le mandat de facturation' }, { status: 400 });
  }
  if (!fiscalStatus || !legalName?.trim()) {
    return NextResponse.json({ error: 'Statut fiscal et nom légal requis' }, { status: 400 });
  }
  if (!iban || !isValidIban(iban)) {
    return NextResponse.json({ error: 'IBAN invalide' }, { status: 400 });
  }
  if ((fiscalStatus === 'MICRO' || fiscalStatus === 'SOCIETE') && siret && !isValidSiret(siret)) {
    return NextResponse.json({ error: 'SIRET invalide' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || null;

  const updated = await prisma.affiliate.update({
    where: { id: affiliate.id },
    data: {
      fiscalStatus,
      legalName: legalName.trim(),
      siret: siret?.replace(/\s/g, '') || null,
      tvaNumber: tvaNumber?.trim() || null,
      tvaApplicable: Boolean(tvaApplicable),
      fiscalAddress: fiscalAddress?.trim() || null,
      fiscalPostalCode: fiscalPostalCode?.trim() || null,
      fiscalCity: fiscalCity?.trim() || null,
      fiscalCountry: fiscalCountry?.trim() || 'France',
      iban: iban.replace(/\s/g, '').toUpperCase(),
      bic: bic?.trim()?.toUpperCase() || null,
      payoutHolder: payoutHolder?.trim() || legalName.trim(),
      mandateSignedAt: new Date(),
      mandateSignedIp: ip,
      mandateVersion: MANDATE_VERSION,
      onboardingCompletedAt: new Date(),
    },
  });

  await logAffiliateAction({
    affiliateId: affiliate.id,
    entityType: 'AFFILIATE',
    entityId: affiliate.id,
    action: 'ONBOARDING_COMPLETED',
    after: { fiscalStatus, legalName: updated.legalName },
  });

  return NextResponse.json({ ok: true, affiliate: updated });
}
