import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { brevoWebhookToken } from '@/lib/brevo/config.js';
import { safeEqual } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

function messageIdFrom(event) {
  return event['message-id'] || event.messageId || null;
}

function mapBrevoEvent(event) {
  const now = new Date();
  switch (event) {
    case 'request':
    case 'sent':
      return { status: 'SENT' };
    case 'delivered':
      return { status: 'DELIVERED', deliveredAt: now };
    case 'opened':
    case 'unique_opened':
      return { status: 'OPENED', openedAt: now };
    case 'hard_bounce':
    case 'soft_bounce':
    case 'blocked':
    case 'invalid_email':
      return { status: 'BOUNCED', failedAt: now, errorMessage: 'Bounce Brevo' };
    case 'spam':
    case 'complaint':
      return { status: 'COMPLAINED', failedAt: now, errorMessage: 'Signalement spam' };
    case 'error':
      return { status: 'FAILED', failedAt: now, errorMessage: 'Erreur Brevo' };
    default:
      return null;
  }
}

async function applyEmailLogUpdate(messageId, update) {
  await prisma.emailLog.updateMany({
    where: { brevoMessageId: messageId },
    data: update,
  });

  if (update.status === 'OPENED' || update.status === 'DELIVERED') {
    const log = await prisma.emailLog.findFirst({
      where: { brevoMessageId: messageId },
      select: { id: true, prospectId: true },
    });
    if (log?.prospectId) {
      await prisma.callCenterInteraction.updateMany({
        where: {
          provider: 'BREVO',
          externalId: messageId,
          prospectId: log.prospectId,
        },
        data: {
          status: update.status === 'OPENED' ? 'OPENED' : 'DELIVERED',
        },
      });
    }
  }
}

export async function POST(request) {
  const token = brevoWebhookToken();
  if (token) {
    // Priorité au header (non loggé dans les access logs) ; fallback query pour compat
    const url = new URL(request.url);
    const provided = request.headers.get('x-brevo-token')
      || url.searchParams.get('token')
      || '';
    if (!safeEqual(provided, token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const events = Array.isArray(payload) ? payload : [payload];
  let updated = 0;

  for (const ev of events) {
    const eventName = (ev.event || '').toLowerCase();
    const messageId = messageIdFrom(ev);
    if (!eventName || !messageId) continue;

    const update = mapBrevoEvent(eventName);
    if (!update) continue;

    if (ev.reason && update.status === 'BOUNCED') {
      update.errorMessage = String(ev.reason).slice(0, 500);
    }

    try {
      await applyEmailLogUpdate(messageId, update);
      updated += 1;
    } catch (err) {
      console.error('[brevo-webhook] DB update failed:', err);
    }
  }

  return NextResponse.json({ ok: true, updated });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'brevo-webhook' });
}
