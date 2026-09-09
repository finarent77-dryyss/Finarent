/**
 * Fabrication des fichiers CSV exportés par l'administration.
 *
 * Deux dangers cohabitent dans un export CSV, et ce module traite les deux
 * au même endroit pour que les cinq exports du back-office partagent
 * exactement la même règle :
 *
 * 1. **L'injection de formule.** Une cellule dont le premier caractère est
 *    `=`, `+`, `-`, `@`, une tabulation ou un retour chariot est interprétée
 *    comme une formule par Excel, LibreOffice et Google Sheets à l'ouverture
 *    du fichier. Or plusieurs colonnes exportées viennent d'endpoints publics
 *    non authentifiés (`POST /api/affiliate/track` pour `referer`,
 *    `landingPath` et `userAgent`, `POST /api/prospects` pour `name` et
 *    `company`) : un visiteur anonyme choisit donc le contenu d'une cellule
 *    qui s'exécutera sur le poste de l'administrateur. On neutralise en
 *    préfixant d'une apostrophe, ce qui force l'interprétation « texte ».
 *
 * 2. **La rupture de structure.** Un point-virgule, une virgule, un guillemet
 *    ou un saut de ligne dans une raison sociale décale toutes les colonnes
 *    suivantes — dans le fichier DAS2, c'est une déclaration fiscale fausse.
 *    On applique donc l'échappement CSV normal : guillemets doublés, cellule
 *    encadrée dès qu'elle contient un séparateur, un guillemet ou un saut de
 *    ligne.
 */

/**
 * Caractères qui, en tête de cellule, amorcent une formule dans un tableur.
 * `\t` et `\r` sont inclus parce que les tableurs les ignorent avant de lire
 * le caractère suivant : `\t=1+1` est évalué comme `=1+1`.
 */
const AMORCES_DE_FORMULE = new Set(['=', '+', '-', '@', '\t', '\r']);

/**
 * Seule exception au préfixage : un montant négatif écrit en toutes lettres
 * (« -1250.00 », ce que produit `Number.prototype.toFixed`). Il ne peut
 * contenir ni appel de fonction, ni référence de cellule, ni commande DDE,
 * et le préfixer le transformerait en texte — les totaux de la feuille
 * cesseraient de se calculer.
 *
 * Un numéro de téléphone « +33612345678 » n'entre volontairement PAS dans
 * cette exception : sans apostrophe, Excel l'évalue et affiche 33612345678,
 * indicatif perdu.
 */
const MONTANT_NEGATIF = /^-\d+(?:[.,]\d+)?$/;

/**
 * Échappe une valeur destinée à une cellule CSV.
 *
 * @param {unknown} valeur — chaîne, nombre, booléen, `Date`, `null` ou `undefined`.
 * @param {{ separateur?: string }} [options] — séparateur de colonnes du
 *   fichier (`,` par défaut, `;` pour les exports à destination d'Excel FR).
 * @returns {string} la cellule prête à être concaténée.
 */
export function echapperCelluleCsv(valeur, options = {}) {
  const separateur = options.separateur || ',';

  if (valeur === null || valeur === undefined) return '';

  let texte;
  // Une valeur déjà typée nombre ou date ne vient pas d'une saisie libre :
  // elle n'a aucune raison d'être neutralisée.
  let typeeParLeCode = false;
  if (valeur instanceof Date) {
    // Une date invalide ne doit pas faire lever `toISOString()` au milieu d'un export.
    texte = Number.isNaN(valeur.getTime()) ? '' : valeur.toISOString();
    typeeParLeCode = true;
  } else if (typeof valeur === 'number') {
    // `NaN` et `Infinity` n'ont aucun sens dans une colonne de montants.
    texte = Number.isFinite(valeur) ? String(valeur) : '';
    typeeParLeCode = true;
  } else {
    texte = String(valeur);
  }

  if (texte === '') return '';

  // 1. Neutralisation de l'injection de formule.
  if (!typeeParLeCode && AMORCES_DE_FORMULE.has(texte[0]) && !MONTANT_NEGATIF.test(texte)) {
    texte = `'${texte}`;
  }

  // 2. Échappement CSV normal. On encadre aussi sur `,` et `;` quel que soit le
  // séparateur choisi : les tableurs francophones ouvrent les deux, et une
  // cellule encadrée reste correcte dans les deux lectures.
  if (
    texte.includes('"') ||
    texte.includes('\n') ||
    texte.includes('\r') ||
    texte.includes(separateur) ||
    texte.includes(',') ||
    texte.includes(';')
  ) {
    return `"${texte.replace(/"/g, '""')}"`;
  }

  return texte;
}

/**
 * Assemble une ligne CSV complète à partir d'un tableau de valeurs brutes.
 *
 * @param {unknown[]} valeurs
 * @param {{ separateur?: string }} [options]
 * @returns {string}
 */
export function ligneCsv(valeurs, options = {}) {
  const separateur = options.separateur || ',';
  return valeurs.map((valeur) => echapperCelluleCsv(valeur, { separateur })).join(separateur);
}

/**
 * Nettoie un fragment destiné à un nom de fichier (en-tête `Content-Disposition`).
 * Un code d'affilié ou de centre contenant un guillemet ou un saut de ligne
 * casserait l'en-tête HTTP ; tout ce qui n'est pas alphanumérique, `.`, `_`
 * ou `-` est remplacé par un tiret.
 *
 * @param {unknown} valeur
 * @param {string} [remplacement] — valeur de repli si le nettoyage ne laisse rien.
 * @returns {string}
 */
export function nettoyerNomFichier(valeur, remplacement = 'export') {
  const nettoye = String(valeur ?? '')
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return nettoye || remplacement;
}
