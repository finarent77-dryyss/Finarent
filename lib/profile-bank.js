import { decryptString, maskIban } from './crypto.js';

/**
 * Vue des coordonnées bancaires sûre à envoyer au navigateur.
 * L'IBAN stocké est chiffré : on ne renvoie qu'une version masquée
 * (FR76 **** **** 123), suffisante pour que le client reconnaisse son compte.
 * Serveur uniquement — importe lib/crypto.js (node:crypto).
 *
 * @param {{ iban?: string|null, bic?: string|null, bankHolder?: string|null, bankUpdatedAt?: Date|null }} dbUser
 */
export function serializeBank(dbUser) {
  let ibanMasked = null;
  let bic = null;
  try {
    ibanMasked = dbUser.iban ? maskIban(decryptString(dbUser.iban)) : null;
    bic = dbUser.bic ? decryptString(dbUser.bic) : null;
  } catch (err) {
    // Clé de chiffrement absente ou invalide : n'expose rien plutôt que de casser la page.
    console.error('[profile-bank] déchiffrement impossible:', err.message);
  }
  return {
    hasIban: Boolean(dbUser.iban),
    ibanMasked,
    bic,
    holder: dbUser.bankHolder || null,
    updatedAt: dbUser.bankUpdatedAt ? new Date(dbUser.bankUpdatedAt).toISOString() : null,
  };
}
