/**
 * Helpers pour protéger les champs sensibles avant écriture Prisma
 * et les révéler après lecture. Centralise la liste des champs chiffrés
 * pour qu'un seul fichier soit à mettre à jour si on en ajoute.
 *
 * Usage côté écriture :
 *   await prisma.application.create({ data: protect('Application', body) });
 *
 * Usage côté lecture :
 *   const app = await prisma.application.findUnique({ where: { id } });
 *   return reveal('Application', app);
 *
 * Les anciens enregistrements (avant chiffrement) restent lisibles :
 * decryptString/decryptJson détectent l'absence du préfixe "v1:" et retournent
 * la valeur d'origine.
 */

import { encryptString, encryptJson, decryptString, decryptJson } from './crypto';

// Liste des champs sensibles par modèle.
// type: 'json' pour les champs JSON (quoteDetails, conditions),
//       'string' pour les colonnes texte (signatureData, adminNotes, reference).
const SENSITIVE_FIELDS = {
  Application: [
    { name: 'quoteDetails', type: 'json' },
    { name: 'adminNotes',   type: 'string' },
  ],
  Offer: [
    { name: 'conditions',   type: 'json' },
  ],
  SignatureRequest: [
    { name: 'signatureData', type: 'string' },
  ],
  InvoicePayment: [
    { name: 'reference',    type: 'string' },
  ],
};

/**
 * Chiffre les champs sensibles d'un objet de données Prisma avant write.
 * Retourne un nouvel objet (n'altère pas l'input).
 * @param {keyof typeof SENSITIVE_FIELDS} modelName
 * @param {object} data
 * @returns {object}
 */
export function protect(modelName, data) {
  if (!data || typeof data !== 'object') return data;
  const fields = SENSITIVE_FIELDS[modelName];
  if (!fields) return data;
  const out = { ...data };
  for (const { name, type } of fields) {
    if (out[name] === undefined) continue;
    if (out[name] === null) {
      out[name] = null;
      continue;
    }
    out[name] = type === 'json' ? encryptJson(out[name]) : encryptString(out[name]);
  }
  return out;
}

/**
 * Déchiffre les champs sensibles d'un enregistrement Prisma après read.
 * Accepte aussi un tableau ou null.
 * @param {keyof typeof SENSITIVE_FIELDS} modelName
 * @param {object | object[] | null} record
 * @returns {object | object[] | null}
 */
export function reveal(modelName, record) {
  if (record === null || record === undefined) return record;
  if (Array.isArray(record)) {
    return record.map((r) => reveal(modelName, r));
  }
  const fields = SENSITIVE_FIELDS[modelName];
  if (!fields) return record;
  const out = { ...record };
  for (const { name, type } of fields) {
    if (out[name] === undefined || out[name] === null) continue;
    try {
      out[name] = type === 'json' ? decryptJson(out[name]) : decryptString(out[name]);
    } catch (err) {
      // Si une donnée est corrompue ou la clé a changé, on log et on neutralise
      // plutôt que de planter toute la requête.
      console.warn(`[sensitive] decrypt failed for ${modelName}.${name}:`, err.message);
      out[name] = null;
    }
  }
  return out;
}

/**
 * Variante : retire complètement les champs sensibles (pour exports / admin views basiques).
 * @param {keyof typeof SENSITIVE_FIELDS} modelName
 * @param {object | null} record
 * @returns {object | null}
 */
export function stripSensitive(modelName, record) {
  if (!record) return record;
  const fields = SENSITIVE_FIELDS[modelName];
  if (!fields) return record;
  const out = { ...record };
  for (const { name } of fields) delete out[name];
  return out;
}

export { SENSITIVE_FIELDS };
