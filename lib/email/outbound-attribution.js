import { prisma } from '@/lib/prisma';
import { sendBrevoTransactionalEmail } from '@/lib/brevo/send-transactional.js';
import { isBrevoReady } from '@/lib/brevo/client.js';
import { renderEmail, escapeHtml } from '@/lib/branding.js';
import { COMPANY_INFO } from '@/lib/invoicing/company.js';

function baseUrl() {
  return process.env.APP_BASE_URL || 'https://finarent.fr';
}

function buildTrackingBlock(shareUrl, code) {
  return `
    <div style="margin-top:24px;padding:20px;background:#f2f5f4;border-radius:12px;border:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0 0 12px;font-size:14px;color:#404040;">Simulez votre financement avec Finarent</p>
      <a href="${shareUrl}" style="display:inline-block;padding:12px 24px;background:#58B794;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;">
        Découvrir Finarent
      </a>
      <p style="margin:12px 0 0;font-size:11px;color:#737D8C;">
        Code de suivi : <strong>${escapeHtml(code)}</strong>
      </p>
    </div>`;
}

async function dispatchCallCenterEmail(opts) {
  if (!isBrevoReady()) {
    return {
      success: false,
      provider: 'BREVO',
      error: 'Service email indisponible (Brevo non configuré).',
    };
  }
  const res = await sendBrevoTransactionalEmail({
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    tags: ['call-center', 'outbound'],
  });
  return {
    success: res.success,
    provider: 'BREVO',
    externalId: res.messageId,
    error: res.error,
  };
}

/**
 * Envoi email prospection centre d'appels avec tracking + logs CRM.
 */
export async function sendCallCenterOutboundEmail(input) {
  const email = input.recipientEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Adresse email invalide.');
  }

  const shareUrl = input.trackingShareUrl || `${baseUrl()}/?ref=${input.trackingCode}`;
  const bodyInner = `
    ${input.recipientName ? `<p>Bonjour ${escapeHtml(input.recipientName)},</p>` : '<p>Bonjour,</p>'}
    ${input.messageHtml}
    ${buildTrackingBlock(shareUrl, input.trackingCode)}`;

  const html = renderEmail({
    title: input.subject,
    preheader: input.subject,
    bodyHtml: bodyInner,
    baseUrl: baseUrl(),
  });

  const result = await dispatchCallCenterEmail({
    to: email,
    subject: input.subject,
    html,
  });

  if (!result.success) {
    throw new Error(result.error || 'Échec d\'envoi email');
  }

  const log = await prisma.emailLog.create({
    data: {
      type: 'OUTBOUND_CALL_CENTER',
      subject: input.subject,
      recipientEmail: email,
      recipientName: input.recipientName || null,
      status: result.externalId ? 'SENT' : 'FAILED',
      brevoMessageId: result.externalId,
      senderUserId: input.senderUserId,
      callCenterId: input.callCenterId || null,
      prospectId: input.prospectId || null,
      source: 'CALL_CENTER',
      metadata: {
        trackingCode: input.trackingCode,
        trackingShareUrl: shareUrl,
        emailProvider: result.provider,
      },
    },
  });

  if (input.prospectId) {
    await prisma.callCenterInteraction.create({
      data: {
        prospectId: input.prospectId,
        agentId: input.senderUserId,
        callCenterId: input.callCenterId || null,
        provider: 'BREVO',
        externalId: result.externalId,
        channel: 'EMAIL',
        direction: 'OUTBOUND',
        status: 'SENT',
        subject: input.subject,
        summary: input.messageHtml.replace(/<[^>]+>/g, ' ').slice(0, 500),
        metadata: { emailLogId: log.id, recipientEmail: email },
        occurredAt: new Date(),
      },
    });
  }

  return { emailLogId: log.id, brevoMessageId: result.externalId };
}

export async function getCallCenterOutboundEmailStats(filters = {}) {
  const where = { type: 'OUTBOUND_CALL_CENTER' };
  if (filters.callCenterId) where.callCenterId = filters.callCenterId;
  if (filters.senderUserId) where.senderUserId = filters.senderUserId;

  const [total, opened, logs] = await Promise.all([
    prisma.emailLog.count({ where }),
    prisma.emailLog.count({ where: { ...where, status: 'OPENED' } }),
    prisma.emailLog.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      take: 50,
      select: {
        id: true,
        subject: true,
        recipientEmail: true,
        recipientName: true,
        status: true,
        sentAt: true,
        openedAt: true,
        prospectId: true,
      },
    }),
  ]);

  const converted = await prisma.prospect.count({
    where: {
      ...(filters.callCenterId ? { callCenterId: filters.callCenterId } : {}),
      status: 'CONVERTED',
    },
  });

  return { total, opened, converted, logs };
}

export async function getLastProspectionEmailsByProspectIds(prospectIds) {
  const map = new Map();
  if (!prospectIds.length) return map;

  const logs = await prisma.emailLog.findMany({
    where: {
      prospectId: { in: prospectIds },
      type: 'OUTBOUND_CALL_CENTER',
    },
    orderBy: { sentAt: 'desc' },
    select: { prospectId: true, sentAt: true },
  });

  for (const log of logs) {
    if (log.prospectId && !map.has(log.prospectId)) {
      map.set(log.prospectId, log.sentAt);
    }
  }
  return map;
}
