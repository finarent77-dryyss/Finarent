import { prisma } from '@/lib/prisma';
import { brevoSenderName } from '@/lib/brevo/config.js';
import { sendMail } from './send.js';
import { templateProspection } from './templates.js';

function baseUrl() {
  return process.env.APP_BASE_URL || 'https://finarent.com';
}

/**
 * Envoi email prospection centre d'appels avec tracking + logs CRM.
 *
 * Le message rédigé par l'agent est encapsulé dans le template de prospection
 * (charte Finarent + bloc de suivi + désabonnement) : l'agent maîtrise le
 * texte, jamais la mise en forme ni les mentions obligatoires.
 */
export async function sendCallCenterOutboundEmail(input) {
  const email = input.recipientEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Adresse email invalide.');
  }

  const shareUrl = input.trackingShareUrl || `${baseUrl()}/?ref=${input.trackingCode}`;
  const { subject, html, text } = templateProspection({
    to: email,
    recipientName: input.recipientName,
    subject: input.subject,
    messageHtml: input.messageHtml,
    trackingCode: input.trackingCode,
    trackingUrl: shareUrl,
    baseUrl: baseUrl(),
  });

  const result = await sendMail({
    to: email,
    subject,
    html,
    text,
    commercial: true,
    fromName: brevoSenderName(),
    tags: ['call-center', 'outbound'],
    log: {
      type: 'OUTBOUND_CALL_CENTER',
      recipientName: input.recipientName || null,
      senderUserId: input.senderUserId,
      callCenterId: input.callCenterId || null,
      prospectId: input.prospectId || null,
      source: 'CALL_CENTER',
      metadata: {
        trackingCode: input.trackingCode,
        trackingShareUrl: shareUrl,
      },
    },
  });

  if (!result.sent) {
    throw new Error(result.error || 'Échec d\'envoi email');
  }

  if (input.prospectId) {
    await prisma.callCenterInteraction.create({
      data: {
        prospectId: input.prospectId,
        agentId: input.senderUserId,
        callCenterId: input.callCenterId || null,
        provider: result.provider,
        externalId: result.messageId,
        channel: 'EMAIL',
        direction: 'OUTBOUND',
        status: 'SENT',
        subject,
        summary: input.messageHtml.replace(/<[^>]+>/g, ' ').slice(0, 500),
        metadata: { emailLogId: result.emailLogId, recipientEmail: email },
        occurredAt: new Date(),
      },
    });
  }

  return { emailLogId: result.emailLogId, brevoMessageId: result.messageId };
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
