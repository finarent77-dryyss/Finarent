import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';
import { logAdminActivity } from '@/lib/admin-activity-log';
import { ribValide } from '@/lib/invoicing/company.js';
import {
  ID_COORDONNEES_BANCAIRES,
  lireCoordonneesBancaires,
  validerCoordonneesBancaires,
} from '@/lib/invoicing/banque.js';

/**
 * Coordonnées bancaires de Finarent — Admin › Paramètres.
 *
 * GET : valeurs en vigueur (base, sinon gabarit) et verdict de la garde.
 * PUT : enregistre après contrôle de l'IBAN (clé mod 97) et du BIC. Chaque
 *       modification est journalisée : ce compte reçoit les paiements clients.
 */

function presenter(coordonnees) {
  return { ...coordonnees, valide: ribValide(coordonnees.iban, coordonnees.bic) };
}

export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  return NextResponse.json(presenter(await lireCoordonneesBancaires()));
}

export async function PUT(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const body = await lireCorpsJson(request);
  if (!body) return reponseCorpsInvalide();

  const { erreurs, donnees } = validerCoordonneesBancaires(body);
  if (erreurs) return NextResponse.json({ errors: erreurs }, { status: 400 });

  try {
    await prisma.companyBankDetails.upsert({
      where: { id: ID_COORDONNEES_BANCAIRES },
      create: { id: ID_COORDONNEES_BANCAIRES, ...donnees, updatedById: auth.dbUser.id },
      update: { ...donnees, updatedById: auth.dbUser.id },
    });
  } catch (err) {
    return reponseErreurPrisma(err, { contexte: 'PUT /api/admin/settings/bank' });
  }

  await logAdminActivity({
    actorId: auth.dbUser.id,
    module: 'settings',
    action: 'BANK_DETAILS_UPDATED',
    summary: `Coordonnées bancaires Finarent modifiées (${donnees.bankName}, IBAN ${donnees.iban.slice(0, 4)}…${donnees.iban.slice(-4)})`,
    entityType: 'CompanyBankDetails',
    entityId: ID_COORDONNEES_BANCAIRES,
    request,
  });

  return NextResponse.json(presenter(await lireCoordonneesBancaires()));
}
