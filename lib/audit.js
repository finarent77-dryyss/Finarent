/**
 * Helpers d'audit RGPD : log centralisé pour DocumentAccess et RgpdAction.
 * Toutes les actions sensibles passent par ici pour garantir la traçabilité
 * exigée par le RGPD (article 30 — registre des traitements).
 */

import { prisma } from './prisma';
import { ipClientOuNull } from './ip-client';

/**
 * Extrait l'IP et le User-Agent d'une requête Next.
 * Tolère l'absence de headers (cron, tests).
 * @param {Request} request
 * @returns {{ ip: string|null, userAgent: string|null }}
 */
export function extractRequestContext(request) {
  if (!request || !request.headers) return { ip: null, userAgent: null };
  // Corrigé le 10 septembre 2026 : la première entrée de « X-Forwarded-For »
  // est écrite par l'appelant, pas par le proxy. Un registre RGPD qui consigne
  // une adresse choisie par la personne tracée ne trace rien.
  const ip = ipClientOuNull(request);
  const userAgent = request.headers.get('user-agent') || null;
  return { ip, userAgent };
}

/**
 * Log un accès document (UPLOAD | VIEW | DOWNLOAD | DELETE).
 * Échec silencieux : l'audit ne doit jamais casser la requête métier.
 */
export async function logDocumentAccess({ documentId, accessedById, action, request }) {
  try {
    if (!documentId || !accessedById || !action) return null;
    const { ip, userAgent } = extractRequestContext(request);
    return await prisma.documentAccess.create({
      data: { documentId, accessedById, action, ip, userAgent },
    });
  } catch (err) {
    console.error('[audit] logDocumentAccess failed:', err.message);
    return null;
  }
}

/**
 * Log une action RGPD utilisateur (EXPORT | DELETE_ACCOUNT | RECTIFY | CONSENT_*).
 * Échec silencieux.
 */
export async function logRgpdAction({ userId, email, action, details, request }) {
  try {
    if (!action) return null;
    const { ip, userAgent } = extractRequestContext(request);
    return await prisma.rgpdAction.create({
      data: {
        userId: userId || null,
        email: email || null,
        action,
        details: details || null,
        ip,
        userAgent,
      },
    });
  } catch (err) {
    console.error('[audit] logRgpdAction failed:', err.message);
    return null;
  }
}
