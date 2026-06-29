import { NextResponse } from 'next/server';
import { loadCallCenterUser, hasCallCenterAccess } from '@/lib/call-center-access';
import {
  sendCallCenterOutboundEmail,
  getCallCenterOutboundEmailStats,
} from '@/lib/email/outbound-attribution.js';
import { prisma } from '@/lib/prisma';

async function requireUser() {
  const user = await loadCallCenterUser();
  if (!user || !hasCallCenterAccess(user)) return null;
  return user;
}

function trackingCode(user) {
  const centerCode = user.membership?.callCenter?.code;
  return centerCode || `CC-${user.id?.slice(0, 8) || 'AGENT'}`;
}

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const stats = await getCallCenterOutboundEmailStats({
    callCenterId: user.callCenterId,
    senderUserId: user.id,
  });

  return NextResponse.json(stats);
}

export async function POST(request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await request.json();
  const { action } = body;

  if (action === 'send') {
    const { recipientEmail, recipientName, subject, messageHtml, prospectId } = body;
    if (!recipientEmail || !subject || !messageHtml) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    if (prospectId) {
      const prospect = await prisma.prospect.findUnique({
        where: { id: prospectId },
        select: { id: true, callCenterId: true, assignedAgentId: true },
      });
      if (!prospect) {
        return NextResponse.json({ error: 'Prospect introuvable' }, { status: 404 });
      }
    }

    try {
      const code = trackingCode(user);
      const baseUrl = process.env.APP_BASE_URL || 'https://finarent.fr';
      const result = await sendCallCenterOutboundEmail({
        senderUserId: user.id,
        recipientEmail,
        recipientName,
        subject,
        messageHtml,
        prospectId: prospectId || null,
        callCenterId: user.callCenterId || null,
        trackingCode: code,
        trackingShareUrl: `${baseUrl}/?ref=${code}`,
      });
      return NextResponse.json({ ok: true, ...result });
    } catch (e) {
      return NextResponse.json({ error: e.message || 'Échec envoi' }, { status: 500 });
    }
  }

  if (action === 'bulk') {
    const { prospectIds, subject, messageHtml } = body;
    if (!Array.isArray(prospectIds) || !prospectIds.length || !subject || !messageHtml) {
      return NextResponse.json({ error: 'Paramètres bulk invalides' }, { status: 400 });
    }
    if (prospectIds.length > 25) {
      return NextResponse.json({ error: 'Maximum 25 prospects par envoi groupé' }, { status: 400 });
    }

    const prospects = await prisma.prospect.findMany({
      where: { id: { in: prospectIds }, email: { not: null } },
      select: { id: true, email: true, name: true },
    });

    const code = trackingCode(user);
    const baseUrl = process.env.APP_BASE_URL || 'https://finarent.fr';
    const results = { sent: 0, failed: 0, errors: [] };

    for (let i = 0; i < prospects.length; i++) {
      const p = prospects[i];
      try {
        await sendCallCenterOutboundEmail({
          senderUserId: user.id,
          recipientEmail: p.email,
          recipientName: p.name,
          subject,
          messageHtml,
          prospectId: p.id,
          callCenterId: user.callCenterId || null,
          trackingCode: code,
          trackingShareUrl: `${baseUrl}/?ref=${code}`,
        });
        results.sent += 1;
      } catch (e) {
        results.failed += 1;
        results.errors.push({ prospectId: p.id, error: e.message });
      }
      if (i < prospects.length - 1) {
        await new Promise((r) => setTimeout(r, 650));
      }
    }

    return NextResponse.json({ ok: true, ...results });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
