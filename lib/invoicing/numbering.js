import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Numérotation séquentielle des documents commerciaux.
 * Format : <PREFIX>-<YYYY>-<NNNN> (zéro-padded sur 4 chiffres).
 *
 * Trois règles comptables sont portées ici, chacune corrigeant un défaut relevé
 * en revue :
 *
 * 1. Le maximum est calculé NUMÉRIQUEMENT, pas alphabétiquement.
 *    La colonne est du texte : en tri PostgreSQL, « FAC-2026-9999 » est
 *    supérieur à « FAC-2026-10000 ». Un `orderBy … desc` plafonnait donc la
 *    séquence à 9 999 et réattribuait 10000 indéfiniment — un doublon de numéro
 *    de facture, motif de rejet en contrôle fiscal. Un numéro non conforme
 *    (reprise, import manuel sans suffixe numérique) faisait pire encore :
 *    il repartait la séquence à 0001, sur des numéros déjà émis.
 *
 * 2. Le candidat est vérifié libre avant d'être rendu, et la contrainte
 *    d'unicité en base reste le juge de paix (cf. `avecNumeroUnique`).
 *    Deux créations simultanées calculaient le même numéro : la seconde mourait
 *    sur un P2002 non attrapé, en 500 opaque, la facture perdue. Même schéma
 *    que `lib/reference.js` pour les numéros de dossier.
 *
 * 3. Un brouillon ne consomme PAS de numéro définitif (`numeroProvisoire`).
 *    Le numéro n'était attribué qu'à la création, au statut DRAFT ; supprimer
 *    un brouillon laissait un trou définitif dans la séquence, alors que la
 *    comptabilité française exige une suite continue. Le numéro définitif est
 *    désormais attribué à l'émission (cf. `app/api/admin/invoices/[id]`).
 */

const LARGEUR = 4;
const NOMBRE_ESSAIS_CANDIDAT = 20;
const PREFIXE_BROUILLON = 'BROUILLON';

/** Préfixe d'exercice, ex. « FAC-2026- ». */
function prefixeAnnee(prefix, annee = new Date().getFullYear()) {
  return `${prefix}-${annee}-`;
}

/**
 * Plus grand rang déjà attribué pour l'exercice en cours.
 *
 * On lit tous les numéros de l'année (balayage d'index sur une colonne unique,
 * une seule chaîne courte par ligne) et on prend le maximum en JavaScript.
 * C'est le prix à payer pour rester correct au-delà de 9 999 documents : aucun
 * `orderBy` sur une colonne texte ne donne le bon maximum, et un `MAX(CAST(…))`
 * en SQL brut nous lierait au dialecte PostgreSQL.
 */
async function rangMaximum(client, model, field, prefixeComplet) {
  const lignes = await client[model].findMany({
    where: { [field]: { startsWith: prefixeComplet } },
    select: { [field]: true },
  });

  let max = 0;
  for (const ligne of lignes) {
    const correspondance = /-(\d+)$/.exec(ligne?.[field] ?? '');
    if (!correspondance) continue;
    const valeur = parseInt(correspondance[1], 10);
    if (Number.isFinite(valeur) && valeur > max) max = valeur;
  }
  return max;
}

/**
 * Prochain numéro libre de la séquence.
 *
 * @param {string} model    nom du modèle Prisma (`invoice`, `quote`, …)
 * @param {string} field    colonne portant le numéro
 * @param {string} prefix   préfixe métier (`FAC`, `DEV`, `AVO`)
 * @param {object} [client] client Prisma (injectable pour une transaction)
 */
async function nextNumber(model, field, prefix, client = prisma) {
  const prefixeComplet = prefixeAnnee(prefix);
  let rang = await rangMaximum(client, model, field, prefixeComplet);

  for (let essai = 0; essai < NOMBRE_ESSAIS_CANDIDAT; essai += 1) {
    rang += 1;
    const candidat = `${prefixeComplet}${String(rang).padStart(LARGEUR, '0')}`;
    const pris = await client[model].findUnique({
      where: { [field]: candidat },
      select: { id: true },
    });
    if (!pris) return candidat;
  }

  // Improbable : vingt numéros consécutifs pris pendant le calcul. On refuse
  // franchement plutôt que d'inventer un numéro hors format — sur un document
  // comptable, un numéro fantaisiste coûte plus cher qu'une erreur affichée.
  throw new Error(
    `Numérotation ${prefix} impossible : ${NOMBRE_ESSAIS_CANDIDAT} numéros consécutifs déjà pris.`,
  );
}

export async function nextInvoiceNumber(client) {
  return nextNumber('invoice', 'invoiceNumber', 'FAC', client);
}

export async function nextQuoteNumber(client) {
  return nextNumber('quote', 'quoteNumber', 'DEV', client);
}

export async function nextCreditNoteNumber(client) {
  return nextNumber('creditNote', 'creditNoteNumber', 'AVO', client);
}

/**
 * Numéro de travail d'un brouillon.
 *
 * Il occupe la colonne (qui est `NOT NULL @unique`) sans consommer de rang dans
 * la séquence comptable : le préfixe « BROUILLON- » ne correspond à aucun
 * préfixe d'exercice, donc `rangMaximum` l'ignore. Supprimer un brouillon ne
 * laisse plus aucun trou.
 */
export function numeroProvisoire() {
  return `${PREFIXE_BROUILLON}-${randomBytes(4).toString('hex').toUpperCase()}`;
}

/** Vrai si le numéro est un numéro de travail, pas un numéro comptable. */
export function estNumeroProvisoire(numero) {
  return typeof numero === 'string' && numero.startsWith(`${PREFIXE_BROUILLON}-`);
}

/**
 * Écrit un document en réessayant si le numéro vient d'être pris.
 *
 * Le calcul du numéro et l'écriture ne peuvent pas être atomiques sans verrou
 * applicatif : deux requêtes concurrentes liront le même maximum. La contrainte
 * d'unicité est donc le dernier rempart, et c'est elle qu'on reboucle — au lieu
 * de laisser remonter un P2002 en 500 opaque. Même geste que la création
 * d'affilié (`app/api/admin/affiliates/route.js`).
 *
 * @param {object}   o
 * @param {string}   o.champ     colonne unique concernée (pour ne pas avaler
 *                               une autre violation d'unicité)
 * @param {Function} o.generer   () => Promise<string|null> ; `null` = pas de
 *                               numéro à attribuer sur cette écriture
 * @param {Function} o.ecrire    (numero) => Promise<T>
 * @param {number}   [o.essais]
 * @returns {Promise<T>}
 */
export async function avecNumeroUnique({ champ, generer, ecrire, essais = 5 }) {
  let derniereErreur = null;

  for (let essai = 1; essai <= essais; essai += 1) {
    const numero = await generer();
    try {
      return await ecrire(numero);
    } catch (erreur) {
      const cible = String(erreur?.meta?.target ?? '');
      if (erreur?.code !== 'P2002' || !cible.includes(champ)) throw erreur;
      derniereErreur = erreur;
    }
  }

  throw derniereErreur;
}
