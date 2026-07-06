import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MANDATE_VERSION, MANDATE_TEXT } from '@/lib/affiliate-mandate.js';
import { isValidIban, isValidSiret, logAffiliateAction } from '@/lib/affiliate-fiscal.js';
import { encryptString, decryptString, maskIban } from '@/lib/crypto.js';
import { safeEqual } from '@/lib/cron-auth';

/**
 * Résout un affilié à partir de son code ET d'un jeton d'onboarding secret.
 * Le `code` seul (public, présent dans les liens ?ref=) ne suffit JAMAIS :
 * seul le jeton — transmis par l'admin, à usage unique, expirant — autorise
 * l'accès aux coordonnées bancaires.
 */
async function resolveByToken(code, token) {
  if (!token || typeof token !== 'string') return null;
  const affiliate = await prisma.affiliate.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!affiliate || !affiliate.isActive) return null;
  if (!affiliate.onboardingToken || !affiliate.onboardingTokenExpiresAt) return null;
  if (affiliate.onboardingTokenExpiresAt < new Date()) return null;
  if (!safeEqual(token, affiliate.onboardingToken)) return null;
  return affiliate;
}

export async function GET(request, { params }) {
  const { code } = await params;
  const token = new URL(request.url).searchParams.get('token');
  const affiliate = await resolveByToken(code, token);

  if (!affiliate) {
    return NextResponse.json({ error: "Lien d'onboarding invalide ou expiré" }, { status: 403 });
  }

  return NextResponse.json({
    affiliate: {
      code: affiliate.code,
      name: affiliate.name,
      fiscalStatus: affiliate.fiscalStatus,
      legalName: affiliate.legalName,
      // IBAN jamais renvoyé en clair — seulement une version masquée si déjà présent
      ibanMasked: affiliate.iban ? maskIban(decryptString(affiliate.iban)) : null,
    },
    mandateText: MANDATE_TEXT,
    mandateVersion: MANDATE_VERSION,
    completed: Boolean(affiliate.onboardingCompletedAt && affiliate.mandateSignedAt),
  });
}

export async function POST(request, { params }) {
  const { code } = await params;
  const body = await request.json();

  const affiliate = await resolveByToken(code, body?.token);
  if (!affiliate) {
    return NextResponse.json({ error: "Lien d'onboarding invalide ou expiré" }, { status: 403 });
  }

  // Interdit l'écrasement d'un onboarding déjà validé (anti-détournement d'IBAN)
  if (affiliate.onboardingCompletedAt) {
    return NextResponse.json(
      { error: 'Onboarding déjà complété. Contactez Finarent pour toute modification.' },
      { status: 409 },
    );
  }

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

  await prisma.affiliate.update({
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
      // Coordonnées bancaires chiffrées (AES-256-GCM) avant stockage
      iban: encryptString(iban.replace(/\s/g, '').toUpperCase()),
      bic: bic?.trim() ? encryptString(bic.trim().toUpperCase()) : null,
      payoutHolder: payoutHolder?.trim() || legalName.trim(),
      mandateSignedAt: new Date(),
      mandateSignedIp: ip,
      mandateVersion: MANDATE_VERSION,
      onboardingCompletedAt: new Date(),
      // Jeton à usage unique : invalidé après complétion
      onboardingToken: null,
      onboardingTokenExpiresAt: null,
    },
  });

  await logAffiliateAction({
    affiliateId: affiliate.id,
    entityType: 'AFFILIATE',
    entityId: affiliate.id,
    action: 'ONBOARDING_COMPLETED',
    after: { fiscalStatus, legalName: legalName.trim() },
  });

  return NextResponse.json({ ok: true });
}
