import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendInvite, parseInviteCsv } from '@/lib/affiliate-invite';

/**
 * POST /api/admin/affiliates/[id]/invite
 * Envoi par l'admin d'invitation(s) au nom d'un affilié.
 *
 * Body single : { recipientEmail, recipientName?, message? }
 * Body bulk   : { csv: string, message?: string }
 *
 * Le bulk traite jusqu'à 200 destinataires par appel (au-delà → 400).
 */
export async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();

  const affiliate = await prisma.affiliate.findUnique({
    where: { id },
    select: { id: true, code: true, name: true, isActive: true },
  });
  if (!affiliate) {
    return NextResponse.json({ error: 'Affilié introuvable' }, { status: 404 });
  }
  if (!affiliate.isActive) {
    return NextResponse.json({ error: 'Affilié inactif' }, { status: 400 });
  }

  // ─── Mode BULK (CSV) ──────────────────────────
  if (body.csv) {
    const recipients = parseInviteCsv(body.csv);
    if (recipients.length === 0) {
      return NextResponse.json({ error: 'CSV vide ou invalide' }, { status: 400 });
    }
    if (recipients.length > 200) {
      return NextResponse.json({ error: 'Max 200 destinataires par envoi' }, { status: 400 });
    }

    const results = { sent: 0, skipped: 0, failed: 0, details: [] };
    for (const r of recipients) {
      const res = await sendInvite({
        affiliate,
        recipientEmail: r.email,
        recipientName: r.name,
        message: body.message,
        source: 'ADMIN_BULK',
        request,
      });
      if (res.skipped) results.skipped++;
      else if (res.ok) results.sent++;
      else results.failed++;
      results.details.push({ email: r.email, status: res.skipped ? 'skipped' : res.ok ? 'sent' : 'failed', error: res.error });
    }

    return NextResponse.json({ success: true, ...results });
  }

  // ─── Mode SINGLE ──────────────────────────────
  const result = await sendInvite({
    affiliate,
    recipientEmail: body.recipientEmail,
    recipientName: body.recipientName,
    message: body.message,
    source: 'ADMIN_SINGLE',
    request,
  });

  if (!result.ok && !result.skipped) {
    return NextResponse.json({ error: result.error || 'Échec d\'envoi' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    skipped: !!result.skipped,
    invite: result.invite,
  });
}

/**
 * GET /api/admin/affiliates/[id]/invite
 * Liste les invitations envoyées pour cet affilié.
 */
export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const invites = await prisma.affiliateInvite.findMany({
    where: { affiliateId: id },
    orderBy: { sentAt: 'desc' },
    take: 200,
  });

  return NextResponse.json(invites);
}
