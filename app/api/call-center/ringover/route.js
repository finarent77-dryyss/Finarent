import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loadCallCenterUser, hasCallCenterAccess, canManageProspect } from '@/lib/call-center-access';
import {
  initiateRingoverCallback,
  ringoverApiConfigured,
  sendRingoverSms,
} from '@/lib/ringover/api-client';
import { findRingoverUserByEmail, getRingoverTeamUsers, primaryRingoverNumber } from '@/lib/ringover/team-users';
import {
  getCallCenterRingoverNumbers,
  resolveRingoverSmsFromNumber,
} from '@/lib/ringover/center-numbers';
import { toRingoverNumber } from '@/lib/ringover/phone';

async function assertProspectAccess(prospectId, user) {
  const prospect = await prisma.prospect.findUnique({
    where: { id: prospectId },
    select: {
      id: true,
      phone: true,
      callCenterId: true,
      assignedAgentId: true,
    },
  });
  if (!prospect || !canManageProspect(user, prospect)) {
    throw new Error('Accès refusé à ce prospect.');
  }
  return prospect;
}

async function requireApiCallCenterUser() {
  const user = await loadCallCenterUser();
  if (!user || !hasCallCenterAccess(user)) return null;
  return user;
}

/** POST { action: 'call' | 'sms', prospectId, content?, fromNumber? } */
export async function POST(request) {
  const user = await requireApiCallCenterUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Non autorisé' }, { status: 401 });
  }

  if (!ringoverApiConfigured()) {
    return NextResponse.json({ ok: false, error: 'RINGOVER_API_KEY non configurée.' }, { status: 503 });
  }

  const body = await request.json();
  const { action, prospectId, content, fromNumber: fromChoice } = body;

  if (!prospectId) {
    return NextResponse.json({ ok: false, error: 'prospectId requis' }, { status: 400 });
  }

  try {
    const prospect = await assertProspectAccess(prospectId, user);

    if (action === 'call') {
      const toNumber = toRingoverNumber(prospect.phone);
      if (!toNumber) {
        return NextResponse.json({ ok: false, error: 'Numéro prospect invalide ou absent.' }, { status: 400 });
      }

      let fromNumber;
      if (user.email) {
        try {
          const ringoverUser = await findRingoverUserByEmail(user.email);
          if (!ringoverUser) {
            const teamUsers = await getRingoverTeamUsers();
            if (teamUsers.length > 0) {
              return NextResponse.json({
                ok: false,
                error: `Aucun compte Ringover pour ${user.email}. Même e-mail SL et Ringover requis.`,
              }, { status: 400 });
            }
          } else {
            fromNumber = primaryRingoverNumber(ringoverUser) ?? undefined;
            if (!fromNumber) {
              return NextResponse.json({
                ok: false,
                error: "Votre compte Ringover n'a pas de numéro assigné.",
              }, { status: 400 });
            }
          }
        } catch (lookupError) {
          console.warn('[ringover] lookup utilisateur échoué:', lookupError);
        }
      }

      await initiateRingoverCallback(toNumber, fromNumber ? { fromNumber } : {});

      await prisma.callCenterInteraction.create({
        data: {
          callCenterId: prospect.callCenterId,
          agentId: user.id,
          prospectId,
          channel: 'CALL',
          direction: 'OUTBOUND',
          provider: 'RINGOVER',
          summary: `Click-to-call lancé vers ${prospect.phone}`,
          metadata: { action: 'callback' },
          occurredAt: new Date(),
        },
      });

      return NextResponse.json({ ok: true });
    }

    if (action === 'sms') {
      if (!content?.trim()) {
        return NextResponse.json({ ok: false, error: 'Message SMS requis.' }, { status: 400 });
      }

      const callCenter = user.membership?.callCenter
        ?? (prospect.callCenterId
          ? await prisma.callCenter.findUnique({
              where: { id: prospect.callCenterId },
              select: { ringoverPhoneNumbers: true },
            })
          : null);

      const fromNumber = resolveRingoverSmsFromNumber(callCenter, fromChoice);
      if (!fromNumber) {
        return NextResponse.json({
          ok: false,
          error: 'Aucun numéro émetteur Ringover configuré pour ce centre.',
        }, { status: 400 });
      }

      const toIntl = toRingoverNumber(prospect.phone);
      if (!toIntl) {
        return NextResponse.json({ ok: false, error: 'Numéro prospect invalide.' }, { status: 400 });
      }

      await sendRingoverSms(fromNumber.replace(/\D/g, ''), String(toIntl), content.trim());

      await prisma.callCenterInteraction.create({
        data: {
          callCenterId: prospect.callCenterId,
          agentId: user.id,
          prospectId,
          channel: 'SMS',
          direction: 'OUTBOUND',
          provider: 'RINGOVER',
          summary: `SMS envoyé vers ${prospect.phone}`,
          notes: content.trim().slice(0, 480),
          occurredAt: new Date(),
        },
      });

      const { scheduleRingoverProspectSync } = await import('@/lib/ringover/sync-contact.js');
      const { scheduleProspectBrevoSync } = await import('@/lib/brevo/sync-prospect.js');
      scheduleRingoverProspectSync(prospectId);
      scheduleProspectBrevoSync(prospectId);

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: 'Action inconnue' }, { status: 400 });
  } catch (e) {
    console.error('[call-center/ringover]', e);
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : 'Échec Ringover',
    }, { status: 500 });
  }
}

/** GET — numéros SMS disponibles pour le centre de l'utilisateur */
export async function GET() {
  const user = await requireApiCallCenterUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const callCenter = user.membership?.callCenter;
  return NextResponse.json({
    ringoverApi: ringoverApiConfigured(),
    smsNumbers: getCallCenterRingoverNumbers(callCenter),
  });
}
