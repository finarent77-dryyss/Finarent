import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { protect } from '@/lib/sensitive';
import { normalizeIban, normalizeBic, isValidIban, isValidBic } from '@/lib/bank.js';
import { serializeBank } from '@/lib/profile-bank.js';
import { logRgpdAction } from '@/lib/audit';

/**
 * Coordonnées bancaires du client (RIB).
 * L'IBAN est chiffré en base et n'est JAMAIS renvoyé en clair : le client ne
 * reçoit qu'une version masquée (FR76 **** **** 123) pour vérifier sa saisie.
 */

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  return NextResponse.json(serializeBank(auth.dbUser));
}

export async function PUT(request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const iban = normalizeIban(body.iban);
  if (!iban) {
    return NextResponse.json({ error: "L'IBAN est obligatoire" }, { status: 400 });
  }
  if (!isValidIban(iban)) {
    return NextResponse.json(
      { error: "IBAN invalide : vérifiez le numéro saisi (clé de contrôle incorrecte)" },
      { status: 400 },
    );
  }

  const bic = normalizeBic(body.bic);
  if (bic && !isValidBic(bic)) {
    return NextResponse.json({ error: 'BIC invalide (8 ou 11 caractères)' }, { status: 400 });
  }

  const holder = typeof body.holder === 'string' ? body.holder.trim() : '';

  const user = await prisma.user.update({
    where: { id: auth.dbUser.id },
    // protect() chiffre iban/bic (AES-256-GCM) d'après lib/sensitive.js
    data: protect('User', {
      iban,
      bic: bic || null,
      bankHolder: holder || auth.dbUser.name || null,
      bankUpdatedAt: new Date(),
    }),
  });

  // Audit RGPD : rectification de données (art. 16). Le numéro n'est jamais journalisé.
  await logRgpdAction({
    userId: auth.dbUser.id,
    email: auth.dbUser.email,
    action: 'RECTIFY',
    details: { fields: ['iban', 'bic', 'bankHolder'] },
    request,
  });

  return NextResponse.json(serializeBank(user));
}

export async function DELETE(request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const user = await prisma.user.update({
    where: { id: auth.dbUser.id },
    data: { iban: null, bic: null, bankHolder: null, bankUpdatedAt: null },
  });

  await logRgpdAction({
    userId: auth.dbUser.id,
    email: auth.dbUser.email,
    action: 'RECTIFY',
    details: { fields: ['iban', 'bic', 'bankHolder'], removed: true },
    request,
  });

  return NextResponse.json(serializeBank(user));
}
