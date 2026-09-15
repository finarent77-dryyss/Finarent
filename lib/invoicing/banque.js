/**
 * Coordonnées bancaires de Finarent : saisies dans Admin › Paramètres,
 * imprimées en pied de facture et utilisées comme compte débiteur des
 * virements SEPA.
 *
 * Elles vivent en base (`CompanyBankDetails`, une seule ligne). Tant que rien
 * n'y a été saisi, on retombe sur le gabarit de `company.js` — que la garde
 * `ribValide` continue de refuser : une facture ne peut donc pas partir avec
 * un IBAN à zéros, que la base soit vide ou injoignable.
 */

import { COMPANY_INFO, ribValide } from './company.js';
import { formatIban, isValidBic, isValidIban, normalizeBic, normalizeIban } from '../bank.js';

export const ID_COORDONNEES_BANCAIRES = 'finarent';

const LONGUEUR_MAX_BANQUE = 100;
const LONGUEUR_MAX_TITULAIRE = 140;

/**
 * Import paresseux du client Prisma : ce module est chargé par des tests
 * unitaires sans `DATABASE_URL` (même précaution que lib/rateLimit.js).
 */
async function clientPrisma() {
  const { prisma } = await import('../prisma');
  return prisma;
}

function titulaireParDefaut() {
  return `${COMPANY_INFO.name} ${COMPANY_INFO.legalForm}`;
}

function depuisGabarit() {
  return {
    bankName: COMPANY_INFO.bankName,
    holder: titulaireParDefaut(),
    iban: COMPANY_INFO.iban,
    bic: COMPANY_INFO.bic,
    source: 'gabarit',
    updatedAt: null,
  };
}

/**
 * Coordonnées en vigueur : la ligne en base, sinon le gabarit.
 *
 * @returns {Promise<{bankName: string, holder: string, iban: string, bic: string,
 *   source: 'base' | 'gabarit', updatedAt: Date | null}>}
 */
export async function lireCoordonneesBancaires() {
  try {
    const prisma = await clientPrisma();
    const ligne = await prisma.companyBankDetails.findUnique({
      where: { id: ID_COORDONNEES_BANCAIRES },
    });
    if (!ligne) return depuisGabarit();
    return {
      bankName: ligne.bankName,
      holder: ligne.holder || titulaireParDefaut(),
      iban: formatIban(ligne.iban),
      bic: ligne.bic,
      source: 'base',
      updatedAt: ligne.updatedAt,
    };
  } catch (erreur) {
    // Base injoignable : le gabarit s'applique, et les gardes refusent l'envoi.
    console.error('[banque] lecture des coordonnées bancaires impossible :', erreur?.message || erreur);
    return depuisGabarit();
  }
}

/**
 * Contrôle d'une saisie. Refuse exactement ce que refuse `ribValide`, avec un
 * message par champ pour l'écran d'administration.
 *
 * @returns {{ erreurs: Record<string, string> | null,
 *   donnees: { bankName: string, holder: string | null, iban: string, bic: string } | null }}
 */
export function validerCoordonneesBancaires(entree) {
  const bankName = String(entree?.bankName ?? '').trim();
  const holder = String(entree?.holder ?? '').trim();
  const iban = normalizeIban(entree?.iban);
  const bic = normalizeBic(entree?.bic);

  const erreurs = {};
  if (!bankName) erreurs.bankName = 'Nom de la banque requis';
  else if (bankName.length > LONGUEUR_MAX_BANQUE) erreurs.bankName = `${LONGUEUR_MAX_BANQUE} caractères maximum`;

  if (holder.length > LONGUEUR_MAX_TITULAIRE) erreurs.holder = `${LONGUEUR_MAX_TITULAIRE} caractères maximum`;

  // Un identifiant national tout à zéro satisfait la clé mod 97 : c'est le gabarit.
  if (!isValidIban(iban) || /^0+$/.test(iban.slice(4))) {
    erreurs.iban = 'IBAN invalide : vérifiez la saisie (clé de contrôle)';
  }
  if (!isValidBic(bic) || bic.startsWith('XXXX')) {
    erreurs.bic = 'BIC invalide (8 ou 11 caractères)';
  }

  if (Object.keys(erreurs).length > 0 || !ribValide(iban, bic)) {
    return { erreurs: Object.keys(erreurs).length ? erreurs : { iban: 'RIB refusé' }, donnees: null };
  }

  return { erreurs: null, donnees: { bankName, holder: holder || null, iban, bic } };
}
