/**
 * Helpers serveur pour le système d'affiliation.
 * Lecture/écriture du cookie `finarent_affiliate` côté API/Server Components.
 */

import { cookies } from 'next/headers';
import { prisma } from './prisma';

export const COOKIE_NAME = 'finarent_affiliate';
export const COOKIE_MAX_AGE = 90 * 24 * 60 * 60; // 90 jours en secondes

/**
 * Lit le code affilié depuis le cookie (server-side).
 * @returns {Promise<string | null>}
 */
export async function getAffiliateCodeFromCookie() {
  try {
    const store = await cookies();
    const c = store.get(COOKIE_NAME);
    return c?.value || null;
  } catch {
    return null;
  }
}

/**
 * Résout un code affilié en `affiliateId` Prisma, ou null si invalide/inactif.
 * @param {string | null | undefined} code
 * @returns {Promise<string | null>}
 */
export async function resolveAffiliateId(code) {
  if (!code) return null;
  try {
    const affiliate = await prisma.affiliate.findUnique({
      where: { code },
      select: { id: true, isActive: true },
    });
    if (!affiliate || !affiliate.isActive) return null;
    return affiliate.id;
  } catch {
    return null;
  }
}

/**
 * Combo : lit cookie + résout en affiliateId. Pratique dans les routes
 * de création de Prospect / Application.
 * @returns {Promise<string | null>}
 */
export async function currentAffiliateId() {
  const code = await getAffiliateCodeFromCookie();
  return resolveAffiliateId(code);
}

/**
 * Calcule le montant d'une commission à partir des paramètres de l'affilié
 * et du montant financé. Retourne 0 si calcul impossible.
 * @param {{ type: 'FIXED' | 'PERCENT', value: number }} config
 * @param {number | null | undefined} financedAmount
 * @returns {number}
 */
export function computeCommission(config, financedAmount) {
  if (!config || typeof config.value !== 'number') return 0;
  if (config.type === 'FIXED') return Math.max(0, config.value);
  if (config.type === 'PERCENT') {
    const amt = Number(financedAmount) || 0;
    return Math.max(0, (amt * config.value) / 100);
  }
  return 0;
}
