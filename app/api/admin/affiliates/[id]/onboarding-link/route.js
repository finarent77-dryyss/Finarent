import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const TTL_DAYS = 14;

/**
 * POST /api/admin/affiliates/[id]/onboarding-link
 * Génère (ou régénère) un jeton d'onboarding secret à usage unique et renvoie
 * l'URL sécurisée à transmettre à l'affilié. Le jeton est distinct du `code`
 * public (utilisé dans les liens ?ref=) : il seul autorise la saisie des
 * coordonnées bancaires.
 */
export async function POST(_request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const affiliate = await prisma.affiliate.findUnique({
    where: { id },
    select: { id: true, code: true, isActive: true },
  });
  if (!affiliate) {
    return NextResponse.json({ error: 'Affilié introuvable' }, { status: 404 });
  }
  if (!affiliate.isActive) {
    return NextResponse.json({ error: 'Affilié inactif' }, { status: 400 });
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.affiliate.update({
    where: { id },
    data: { onboardingToken: token, onboardingTokenExpiresAt: expiresAt },
  });

  const base = process.env.APP_BASE_URL || 'https://finarent.com';
  const url = `${base}/affiliate/${affiliate.code}/onboarding?token=${token}`;

  return NextResponse.json({ ok: true, url, expiresAt });
}
