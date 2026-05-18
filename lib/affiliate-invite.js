/**
 * Helpers serveur pour l'envoi et le tracking des invitations affiliés.
 * Logique partagée entre /api/affiliate/[code]/invite (public) et
 * /api/admin/affiliates/[id]/invite (admin).
 */

import { prisma } from './prisma';
import { sendAffiliateInvite } from './email';
import { logRgpdAction } from './audit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valide une adresse email.
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length < 5 || trimmed.length > 200) return false;
  return EMAIL_RE.test(trimmed);
}

/**
 * Envoie une invitation single + crée le record AffiliateInvite.
 * Idempotent par (affiliateId, recipientEmail) sur les 7 derniers jours
 * pour éviter les doublons / spam.
 *
 * @param {object} opts
 * @param {object} opts.affiliate { id, code, name }
 * @param {string} opts.recipientEmail
 * @param {string} [opts.recipientName]
 * @param {string} [opts.message]
 * @param {'AFFILIATE_PAGE'|'ADMIN_SINGLE'|'ADMIN_BULK'} opts.source
 * @param {Request} [opts.request]  pour audit RGPD
 * @returns {Promise<{ok: boolean, invite?: any, error?: string, skipped?: boolean}>}
 */
export async function sendInvite({ affiliate, recipientEmail, recipientName, message, source, request }) {
  if (!affiliate?.id || !affiliate?.code || !affiliate?.name) {
    return { ok: false, error: 'affilié invalide' };
  }
  const email = String(recipientEmail || '').trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { ok: false, error: 'email destinataire invalide' };
  }

  // Anti-doublon : pas plus d'1 invite par (affilié, email) sur 7 jours
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent = await prisma.affiliateInvite.findFirst({
    where: {
      affiliateId: affiliate.id,
      recipientEmail: email,
      sentAt: { gt: sevenDaysAgo },
    },
    select: { id: true },
  });
  if (recent) {
    return { ok: true, skipped: true, error: 'Invitation déjà envoyée à cet email cette semaine' };
  }

  const cleanName = recipientName ? String(recipientName).trim().slice(0, 100) : null;
  const cleanMessage = message ? String(message).trim().slice(0, 500) : null;

  // Tentative d'envoi SMTP
  const result = await sendAffiliateInvite({
    to: email,
    recipientName: cleanName,
    affiliateName: affiliate.name,
    affiliateCode: affiliate.code,
    message: cleanMessage,
  });

  const invite = await prisma.affiliateInvite.create({
    data: {
      affiliateId: affiliate.id,
      recipientEmail: email,
      recipientName: cleanName,
      message: cleanMessage,
      source,
      status: result.sent ? 'SENT' : 'FAILED',
      failedReason: result.sent ? null : (result.error || result.reason || 'inconnu'),
    },
  });

  // Audit RGPD (échec silencieux)
  logRgpdAction({
    email,
    action: 'CONSENT_GRANT', // on considère l'envoi d'invite comme une action de traitement à tracer
    details: {
      type: 'affiliate_invite',
      affiliateCode: affiliate.code,
      source,
      status: invite.status,
    },
    request,
  }).catch(() => {});

  return { ok: result.sent, invite, error: result.sent ? null : invite.failedReason };
}

/**
 * Parse un CSV d'emails (1 par ligne, ou colonnes "email,name").
 * Tolère les BOM, les espaces et les séparateurs `;` ou `,`.
 * @param {string} csv
 * @returns {Array<{email: string, name?: string}>}
 */
export function parseInviteCsv(csv) {
  if (!csv || typeof csv !== 'string') return [];
  // Strip BOM
  const text = csv.replace(/^﻿/, '');
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const out = [];
  for (const line of lines) {
    const parts = line.split(/[,;]/).map((s) => s.trim());
    const email = parts[0];
    const name = parts[1] || undefined;
    if (!email) continue;
    // Skip header row
    if (email.toLowerCase() === 'email') continue;
    if (!isValidEmail(email)) continue;
    out.push({ email: email.toLowerCase(), name });
  }
  // Dédupe par email
  const seen = new Set();
  return out.filter((r) => {
    if (seen.has(r.email)) return false;
    seen.add(r.email);
    return true;
  });
}
