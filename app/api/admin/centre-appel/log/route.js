import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

function buildLogEntry({ outcome, comment, callbackAt, durationSec, agent }) {
  const stamp = new Date().toISOString();
  const lines = [
    `[APPEL ${stamp}] ${OUTCOMES[outcome]?.label || outcome}`,
    agent ? `Agent: ${agent}` : null,
    durationSec ? `Durée: ${Math.round(durationSec)}s` : null,
    callbackAt ? `[RAPPEL ${new Date(callbackAt).toISOString()}]` : null,
    comment ? `→ ${comment}` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  const { kind, id, outcome, comment, callbackAt, durationSec, statusOverride } = body;

  if (!kind || !id || !outcome) {
    return NextResponse.json({ error: 'Type, identifiant et issue de l\'appel sont requis' }, { status: 400 });
  }
  if (!OUTCOMES[outcome]) {
    return NextResponse.json({ error: 'Issue d\'appel invalide' }, { status: 400 });
  }

  const agent = auth.dbUser?.email || auth.dbUser?.name || null;
  const logBlock = buildLogEntry({ outcome, comment, callbackAt, durationSec, agent });

  if (kind === 'prospect') {
    const current = await prisma.prospect.findUnique({
      where: { id },
      select: { notes: true, status: true },
    });
    if (!current) return NextResponse.json({ error: 'Prospect introuvable' }, { status: 404 });

    const nextStatus = statusOverride || OUTCOMES[outcome].nextProspect || current.status;
    const newNotes = [logBlock, current.notes].filter(Boolean).join('\n\n---\n\n');

    const updated = await prisma.prospect.update({
      where: { id },
      data: {
        notes: newNotes,
        status: nextStatus,
        callAttempts: { increment: 1 },
        lastCallAt: new Date(),
        lastCallOutcome: OUTCOME_TO_INTERACTION[outcome] || null,
      },
    });
    await logInteraction({
      agentUserId: auth.dbUser?.id,
      kind: 'prospect',
      refId: id,
      outcome,
      comment,
      callbackAt,
      durationSec,
    });
    return NextResponse.json({ ok: true, kind: 'prospect', item: updated });
  }

  if (kind === 'demande') {
    const current = await prisma.application.findUnique({
      where: { id },
      select: { adminNotes: true, status: true },
    });
    if (!current) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });

    const nextStatus = statusOverride || APP_NEXT_STATUS[outcome] || current.status;
    const newNotes = [logBlock, current.adminNotes].filter(Boolean).join('\n\n---\n\n');

    const updated = await prisma.application.update({
      where: { id },
      data: { adminNotes: newNotes, status: nextStatus },
    });
    await logInteraction({
      agentUserId: auth.dbUser?.id,
      kind: 'demande',
      refId: id,
      outcome,
      comment,
      callbackAt,
      durationSec,
    });
    return NextResponse.json({ ok: true, kind: 'demande', item: updated });
  }

  return NextResponse.json({ error: 'Le type doit être prospect ou demande' }, { status: 400 });
}
