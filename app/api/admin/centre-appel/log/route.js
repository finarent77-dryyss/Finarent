import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { protect, reveal } from '@/lib/sensitive';
import { lireNotesAdmin } from '@/lib/notes-admin';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';

const OUTCOMES = {
  reached: { label: 'Décroché', nextProspect: 'CONTACTED' },
  voicemail: { label: 'Répondeur', nextProspect: 'CONTACTED' },
  no_answer: { label: 'Pas de réponse', nextProspect: null },
  callback: { label: 'À rappeler', nextProspect: 'CONTACTED' },
  qualified: { label: 'Qualifié', nextProspect: 'QUALIFIED' },
  converted: { label: 'Converti', nextProspect: 'CONVERTED' },
  refused: { label: 'Refus / pas intéressé', nextProspect: 'LOST' },
};

const APP_NEXT_STATUS = {
  reached: 'REVIEWING',
  voicemail: 'REVIEWING',
  callback: 'REVIEWING',
  qualified: 'REVIEWING',
  converted: 'QUOTE_SENT',
  refused: 'REJECTED',
};

// Mappe l'issue legacy vers l'enum outcome de CallCenterInteraction
const OUTCOME_TO_INTERACTION = {
  reached: 'ANSWERED',
  voicemail: 'VOICEMAIL',
  no_answer: 'MISSED',
  callback: 'CALLBACK',
  qualified: 'INTERESTED',
  converted: 'INTERESTED',
  refused: 'NOT_INTERESTED',
};

// Statuts acceptés pour `statusOverride`, calqués sur les énumérations Prisma
// ProspectStatus et ApplicationStatus. Sans cette liste, une valeur libre
// partait directement dans `prisma.*.update` et faisait lever Prisma (500).
const PROSPECT_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
const APPLICATION_STATUSES = [
  'PENDING', 'REVIEWING', 'DOCUMENTS_NEEDED', 'QUOTE_SENT', 'QUOTE_ACCEPTED',
  'PENDING_SIGNATURE', 'SIGNED', 'TRANSMITTED', 'APPROVED', 'REJECTED', 'COMPLETED',
];

/**
 * Crée une CallCenterInteraction reliée à l'agent (admin courant) et, si
 * l'agent est membre d'un centre, au centre correspondant. Best-effort :
 * une erreur ici ne doit jamais casser le log d'appel principal.
 */
async function logInteraction({ agentUserId, kind, refId, outcome, comment, callbackAt, durationSec }) {
  try {
    let callCenterId = null;
    if (agentUserId) {
      const membership = await prisma.callCenterMember.findFirst({
        where: { userId: agentUserId, isActive: true },
        orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
        select: { callCenterId: true },
      });
      callCenterId = membership?.callCenterId || null;
    }

    await prisma.callCenterInteraction.create({
      data: {
        callCenterId,
        agentId: agentUserId || null,
        prospectId: kind === 'prospect' ? refId : null,
        applicationId: kind === 'demande' ? refId : null,
        channel: 'CALL',
        direction: 'OUTBOUND',
        outcome: OUTCOME_TO_INTERACTION[outcome] || null,
        durationSec: durationSec ? Math.round(durationSec) : null,
        notes: comment ? String(comment).slice(0, 1000) : null,
        callbackAt: callbackAt ? new Date(callbackAt) : null,
        provider: 'MANUAL',
        occurredAt: new Date(),
      },
    });
  } catch (err) {
    console.error('logInteraction (CallCenterInteraction) error:', err);
  }
}

/**
 * @param {{ outcome: string, comment?: string, callbackAt: Date | null,
 *           durationSec?: number, agent?: string | null }} params
 */
function buildLogEntry({ outcome, comment, callbackAt, durationSec, agent }) {
  const stamp = new Date().toISOString();
  const lines = [
    `[APPEL ${stamp}] ${OUTCOMES[outcome]?.label || outcome}`,
    agent ? `Agent: ${agent}` : null,
    durationSec ? `Durée: ${Math.round(durationSec)}s` : null,
    callbackAt ? `[RAPPEL ${callbackAt.toISOString()}]` : null,
    comment ? `→ ${comment}` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const body = await lireCorpsJson(request);
  if (!body) return reponseCorpsInvalide();

  const { kind, id, outcome, comment, callbackAt, durationSec, statusOverride } = body;

  if (!kind || !id || !outcome) {
    return NextResponse.json({ error: 'Type, identifiant et issue de l\'appel sont requis' }, { status: 400 });
  }
  if (!OUTCOMES[outcome]) {
    return NextResponse.json({ error: 'Issue d\'appel invalide' }, { status: 400 });
  }

  // Une date de rappel non parsable faisait lever `toISOString()` avant la
  // moindre écriture : on la valide ici, une bonne fois pour les deux branches.
  let dateRappel = null;
  if (callbackAt !== undefined && callbackAt !== null && callbackAt !== '') {
    const candidate = new Date(callbackAt);
    if (Number.isNaN(candidate.getTime())) {
      return NextResponse.json({ error: 'Date de rappel invalide' }, { status: 400 });
    }
    dateRappel = candidate;
  }

  const agent = auth.dbUser?.email || auth.dbUser?.name || null;
  const logBlock = buildLogEntry({ outcome, comment, callbackAt: dateRappel, durationSec, agent });

  if (kind === 'prospect') {
    if (statusOverride !== undefined && statusOverride !== null && !PROSPECT_STATUSES.includes(statusOverride)) {
      return NextResponse.json({ error: 'Statut prospect invalide' }, { status: 400 });
    }

    const current = await prisma.prospect.findUnique({
      where: { id },
      select: { notes: true, status: true },
    });
    if (!current) return NextResponse.json({ error: 'Prospect introuvable' }, { status: 404 });

    const nextStatus = statusOverride || OUTCOMES[outcome].nextProspect || current.status;
    // `Prospect.notes` n'est pas un champ chiffré : concaténation directe.
    const newNotes = [logBlock, current.notes].filter(Boolean).join('\n\n---\n\n');

    let updated;
    try {
      updated = await prisma.prospect.update({
        where: { id },
        data: {
          notes: newNotes,
          status: nextStatus,
          callAttempts: { increment: 1 },
          lastCallAt: new Date(),
          lastCallOutcome: OUTCOME_TO_INTERACTION[outcome] || null,
        },
      });
    } catch (err) {
      return reponseErreurPrisma(err, {
        contexte: 'POST /api/admin/centre-appel/log (prospect)',
        introuvable: 'Prospect introuvable',
      });
    }

    await logInteraction({
      agentUserId: auth.dbUser?.id,
      kind: 'prospect',
      refId: id,
      outcome,
      comment,
      callbackAt: dateRappel,
      durationSec,
    });
    return NextResponse.json({ ok: true, kind: 'prospect', item: updated });
  }

  if (kind === 'demande') {
    if (statusOverride !== undefined && statusOverride !== null && !APPLICATION_STATUSES.includes(statusOverride)) {
      return NextResponse.json({ error: 'Statut de demande invalide' }, { status: 400 });
    }

    const current = await prisma.application.findUnique({
      where: { id },
      select: { adminNotes: true, status: true },
    });
    if (!current) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });

    const nextStatus = statusOverride || APP_NEXT_STATUS[outcome] || current.status;

    // `Application.adminNotes` est un champ chiffré (lib/sensitive.js) : on le
    // déchiffre avant de concaténer, puis on rechiffre l'ensemble via
    // `protect()`. Concaténer du clair et du chiffré, comme le faisait cette
    // route, rendait l'historique définitivement illisible (constat ADM1-02).
    const notesActuelles = lireNotesAdmin(current.adminNotes);
    const newNotes = [logBlock, notesActuelles].filter(Boolean).join('\n\n---\n\n');

    let updated;
    try {
      updated = await prisma.application.update({
        where: { id },
        data: protect('Application', { adminNotes: newNotes, status: nextStatus }),
      });
    } catch (err) {
      return reponseErreurPrisma(err, {
        contexte: 'POST /api/admin/centre-appel/log (demande)',
        introuvable: 'Demande introuvable',
      });
    }

    await logInteraction({
      agentUserId: auth.dbUser?.id,
      kind: 'demande',
      refId: id,
      outcome,
      comment,
      callbackAt: dateRappel,
      durationSec,
    });
    // Réponse déchiffrée, comme `demandes/[id]` PATCH : l'appelant ne doit
    // jamais recevoir la forme `v1:…` stockée en base.
    return NextResponse.json({ ok: true, kind: 'demande', item: reveal('Application', updated) });
  }

  return NextResponse.json({ error: 'Le type doit être prospect ou demande' }, { status: 400 });
}
