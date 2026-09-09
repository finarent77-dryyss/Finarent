/**
 * Validation des coordonnées bancaires saisies par un client (RIB).
 *
 * Contrôle strict — longueur attendue par pays + clé de contrôle mod 97
 * (norme ISO 13616) — parce qu'un IBAN saisi à la main sert ensuite à un
 * prélèvement ou à un virement : une erreur de frappe coûte un rejet bancaire.
 * (lib/affiliate-fiscal.js garde son contrôle de format simple pour les
 * affiliés, dont l'IBAN est ressaisi par l'admin avant tout versement.)
 */

/** Longueur totale de l'IBAN par pays (zone SEPA + principaux voisins). */
const IBAN_LENGTHS = {
  AD: 24, AT: 20, BE: 16, BG: 22, CH: 21, CY: 28, CZ: 24, DE: 22, DK: 18,
  EE: 20, ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27,
  HR: 21, HU: 28, IE: 22, IS: 26, IT: 27, LI: 21, LT: 20, LU: 20, LV: 21,
  MC: 27, MT: 31, NL: 18, NO: 15, PL: 28, PT: 25, RO: 24, SE: 24, SI: 19,
  SK: 24, SM: 27, VA: 22,
};

/** Retire espaces et tirets, passe en majuscules. */
export function normalizeIban(value) {
  return (value || '').replace(/[\s-]/g, '').toUpperCase();
}

/** Regroupe par blocs de 4 pour l'affichage : "FR7612345678901234567890123". */
export function formatIban(value) {
  return normalizeIban(value).replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Valide un IBAN : format, longueur du pays si connue, puis clé mod 97.
 * @param {string | null | undefined} value
 * @returns {boolean}
 */
export function isValidIban(value) {
  const iban = normalizeIban(value);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false;

  const expectedLength = IBAN_LENGTHS[iban.slice(0, 2)];
  if (expectedLength && iban.length !== expectedLength) return false;

  // Clé de contrôle ISO 13616 : les 4 premiers caractères passent à la fin,
  // chaque lettre devient sa position + 9 (A→10 … Z→35), le reste mod 97 doit valoir 1.
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const code = char.charCodeAt(0);
    const digit = code >= 65 ? code - 55 : code - 48;
    remainder = (remainder * (digit > 9 ? 100 : 10) + digit) % 97;
  }
  return remainder === 1;
}

/** Retire les espaces d'un BIC et passe en majuscules. */
export function normalizeBic(value) {
  return (value || '').replace(/\s/g, '').toUpperCase();
}

/**
 * Valide un BIC / SWIFT : 8 ou 11 caractères (banque, pays, localité, agence).
 * @param {string | null | undefined} value
 * @returns {boolean}
 */
export function isValidBic(value) {
  const bic = normalizeBic(value);
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic);
}
