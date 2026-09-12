import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  loadCallCenterUser,
  hasCallCenterAccess,
  canManageProspect,
} from '@/lib/call-center-access';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';

const VALID_STATUS = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
const VALID_OUTCOME = ['NO_ANSWER', 'CALLBACK', 'INTERESTED', 'NOT_INTERESTED', 'ANSWERED', 'VOICEMAIL'];

/**
 * PATCH /api/call-center/prospects/[id]
 * Permet à un agent/manager de centre d'appel de faire évoluer un prospect
 * qu'il gère : statut, notes, résultat d'appel. Cloisonné via canManageProspect.
 */
export async function PATCH(request, { params }) {
  const user = await loadCallCenterUser();
  if (!user || !hasCallCenterAccess(user)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;

  // Cette route est le geste le plus courant de l'espace agent : ouvrir une
  // fiche et la faire évoluer. Elle avait échappé à la passe de durcissement —
  // `request.json()` levait sur un corps vide ou tronqué, et aucun `try` ne
  // couvrait les appels Prisma. Les deux sortaient en 500 nu, sans rien dire.
  try {
    const prospect = await prisma.prospect.findUnique({
      where: { id },
      select: { id: true, callCenterId: true, assignedAgentId: true },
    });
    if (!prospect) {
      return NextResponse.json({ error: 'Prospect introuvable' }, { status: 404 });
    }
    if (!canManageProspect(user, prospect)) {
      return NextResponse.json({ error: 'Accès à ce prospect refusé' }, { status: 403 });
    }

    const body = await lireCorpsJson(request);
    if (!body) return reponseCorpsInvalide();

    const data = {};

    if (body.status !== undefined) {
      if (!VALID_STATUS.includes(body.status)) {
        return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
      }
      data.status = body.status;
    }

    if (body.notes !== undefined) {
      data.notes = typeof body.notes === 'string' ? body.notes.slice(0, 5000) : null;
    }

    if (body.lastCallOutcome !== undefined) {
      if (body.lastCallOutcome && !VALID_OUTCOME.includes(body.lastCallOutcome)) {
        return NextResponse.json({ error: 'Résultat d\'appel invalide' }, { status: 400 });
      }
      data.lastCallOutcome = body.lastCallOutcome || null;
      data.lastCallAt = new Date();
      data.callAttempts = { increment: 1 };
    }

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: 'Aucune modification' }, { status: 400 });
    }

    const updated = await prisma.prospect.update({
      where: { id },
      data,
      select: { id: true, status: true, notes: true, lastCallOutcome: true, callAttempts: true },
    });

    return NextResponse.json({ ok: true, prospect: updated });
  } catch (err) {
    return reponseErreurPrisma(err, { contexte: 'PATCH /api/call-center/prospects/[id]' });
  }
}
