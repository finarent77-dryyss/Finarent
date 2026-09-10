/**
 * Affichage des numéros de documents commerciaux dans le back-office.
 *
 * Depuis la correction de la séquence comptable, une facture en brouillon ne
 * consomme plus de numéro `FAC-AAAA-NNNN` : elle porte un numéro de travail
 * `BROUILLON-XXXXXXXX` (cf. `numeroProvisoire()` dans `lib/invoicing/numbering.js`),
 * attribué à la création et remplacé par le numéro comptable à l'émission.
 *
 * Affichée telle quelle, cette chaîne technique se lit comme un numéro de
 * facture : un admin peut la recopier dans un courrier ou un rapprochement
 * bancaire, alors qu'elle n'a aucune valeur comptable et qu'elle disparaîtra à
 * l'émission. On l'affiche donc en clair (« Brouillon ») en gardant le suffixe
 * comme référence de travail, pour distinguer deux brouillons entre eux.
 *
 * Ce module ne dépend ni de Prisma ni de `crypto` : il est importable depuis un
 * composant client, contrairement à `lib/invoicing/numbering.js`. La valeur
 * brute reste la seule utilisée pour le tri et la recherche — les écrans
 * filtrent sur `invoiceNumber`, pas sur le libellé calculé ici.
 */

const PREFIXE_BROUILLON = 'BROUILLON-';

/**
 * Vrai si le numéro est un numéro de travail, pas un numéro comptable.
 * Même règle que `estNumeroProvisoire()` côté serveur.
 *
 * @param {unknown} numero
 * @returns {boolean}
 */
export function estNumeroProvisoire(numero) {
  return typeof numero === 'string' && numero.startsWith(PREFIXE_BROUILLON);
}

/**
 * Décompose un numéro de document pour l'affichage.
 *
 * @param {string | null | undefined} numero valeur stockée en base
 * @returns {{ provisoire: boolean, libelle: string, reference: string | null }}
 *   `libelle` est ce qui se lit comme un numéro ; `reference` n'est renseignée
 *   que pour un brouillon, et sert de repère interne.
 */
export function libelleNumeroDocument(numero) {
  if (!estNumeroProvisoire(numero)) {
    return { provisoire: false, libelle: numero || '—', reference: null };
  }
  return {
    provisoire: true,
    libelle: 'Brouillon',
    reference: numero.slice(PREFIXE_BROUILLON.length),
  };
}
