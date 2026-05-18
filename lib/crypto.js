/**
 * Chiffrement applicatif AES-256-GCM pour les champs sensibles Finarent.
 *
 * Pourquoi GCM : authenticated encryption (intégrité + confidentialité).
 * Format de sortie : "v1:<iv-base64>:<authTag-base64>:<ciphertext-base64>".
 * Préfixe "v1:" pour permettre une rotation de clé future sans casser les anciens enregistrements.
 *
 * Clé : variable d'env ENCRYPTION_KEY (32 octets, base64). Générer avec :
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 *
 * Cas d'usage :
 *  - encryptString / decryptString : pour les colonnes texte (IBAN, SIRET stocké, etc.)
 *  - encryptJson / decryptJson : pour les colonnes JSON (quoteDetails, conditions, signatureData)
 *  - isEncrypted : pour la lecture des données legacy non-chiffrées (migration progressive)
 */

import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12; // recommandé pour GCM
const KEY_VERSION = 'v1';

let cachedKey = null;

function getKey() {
  if (cachedKey) return cachedKey;
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      'ENCRYPTION_KEY manquante. Générer avec : node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))" et ajouter dans .env.local',
    );
  }
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error(`ENCRYPTION_KEY doit être 32 octets en base64, reçu ${key.length} octets.`);
  }
  cachedKey = key;
  return key;
}

/**
 * Chiffre une chaîne UTF-8 avec AES-256-GCM.
 * @param {string | null | undefined} plaintext
 * @returns {string | null} format "v1:<iv>:<tag>:<ciphertext>" ou null si input null/undefined
 */
export function encryptString(plaintext) {
  if (plaintext === null || plaintext === undefined) return null;
  if (typeof plaintext !== 'string') {
    throw new TypeError('encryptString attend une string');
  }
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${KEY_VERSION}:${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext.toString('base64')}`;
}

/**
 * Déchiffre une chaîne précédemment produite par encryptString.
 * Retourne la chaîne d'origine telle quelle si elle ne porte pas le préfixe (données legacy).
 * @param {string | null | undefined} payload
 * @returns {string | null}
 */
export function decryptString(payload) {
  if (payload === null || payload === undefined) return null;
  if (typeof payload !== 'string') return payload;
  if (!payload.startsWith(`${KEY_VERSION}:`)) {
    // Donnée legacy non chiffrée — retournée telle quelle pour migration progressive
    return payload;
  }
  const parts = payload.split(':');
  if (parts.length !== 4) {
    throw new Error('Format chiffré invalide');
  }
  const [, ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(ctB64, 'base64');
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString('utf8');
}

/**
 * Chiffre un objet JSON arbitraire. Retourne null si input null/undefined.
 * @param {object | null | undefined} obj
 * @returns {string | null}
 */
export function encryptJson(obj) {
  if (obj === null || obj === undefined) return null;
  return encryptString(JSON.stringify(obj));
}

/**
 * Déchiffre un objet JSON. Retourne null si null, l'objet d'origine si déjà déchiffré (legacy).
 * @param {string | object | null | undefined} payload
 * @returns {object | null}
 */
export function decryptJson(payload) {
  if (payload === null || payload === undefined) return null;
  // Données legacy stockées en JSONB Prisma → déjà un objet, pas une string
  if (typeof payload === 'object') return payload;
  const plaintext = decryptString(payload);
  if (plaintext === null) return null;
  // Si la string ne commence pas par v1:, decryptString l'a renvoyée telle quelle.
  // Tenter de parser ; si ça échoue, retourner brut (probablement legacy mal formatté).
  try {
    return JSON.parse(plaintext);
  } catch {
    return plaintext;
  }
}

/**
 * Détecte si une valeur est déjà chiffrée par ce module.
 * Utile pour les scripts de migration / dual-write.
 * @param {unknown} value
 * @returns {boolean}
 */
export function isEncrypted(value) {
  return typeof value === 'string' && value.startsWith(`${KEY_VERSION}:`);
}

/**
 * Masque un IBAN pour affichage : "FR76 1234 5678 9012 3456 7890 123" → "FR76 **** **** **** **** **** 123".
 * Conserve les 4 premiers et 3 derniers caractères significatifs.
 * @param {string | null | undefined} iban
 * @returns {string}
 */
export function maskIban(iban) {
  if (!iban || typeof iban !== 'string') return '';
  const compact = iban.replace(/\s+/g, '').toUpperCase();
  if (compact.length < 8) return compact;
  const start = compact.slice(0, 4);
  const end = compact.slice(-3);
  const middleLen = compact.length - 7;
  const stars = '*'.repeat(middleLen);
  // Re-grouper par 4 pour la lisibilité
  return `${start}${stars}${end}`.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Masque un numéro générique en gardant seulement les N derniers caractères.
 * Ex : maskTail("12345678901234", 4) → "********1234"
 * @param {string | null | undefined} value
 * @param {number} keep
 * @returns {string}
 */
export function maskTail(value, keep = 4) {
  if (!value || typeof value !== 'string') return '';
  if (value.length <= keep) return value;
  return '*'.repeat(value.length - keep) + value.slice(-keep);
}
