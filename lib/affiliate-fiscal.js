import { prisma } from '@/lib/prisma';

export async function logAffiliateAction(input) {
  try {
    await prisma.affiliateAuditLog.create({
      data: {
        affiliateId: input.affiliateId || null,
        actorId: input.actorId || null,
        entityType: input.entityType,
        entityId: input.entityId || null,
        action: input.action,
        reason: input.reason || null,
        before: input.before ?? undefined,
        after: input.after ?? undefined,
      },
    });
  } catch (e) {
    console.error('[affiliate-audit] log failed:', e);
  }
}

/** Valide un IBAN basique (longueur + caractères). */
export function isValidIban(iban) {
  const clean = (iban || '').replace(/\s/g, '').toUpperCase();
  return /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(clean);
}

/** Valide un SIRET (14 chiffres + Luhn). */
export function isValidSiret(siret) {
  const clean = (siret || '').replace(/\s/g, '');
  if (!/^\d{14}$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(clean[i], 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function affiliateDisplayName(affiliate) {
  return affiliate.legalName?.trim() || affiliate.name?.trim() || affiliate.code;
}

export function computeAffiliatePayoutTTC(amountHT, tvaApplicable) {
  const vatRate = tvaApplicable ? 20 : 0;
  const vatAmount = Math.round(amountHT * (vatRate / 100) * 100) / 100;
  const amountTTC = Math.round((amountHT + vatAmount) * 100) / 100;
  return { vatRate, vatAmount, amountTTC };
}
