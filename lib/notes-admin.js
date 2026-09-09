/**
 * Lecture tolérante du champ `Application.adminNotes`.
 *
 * `adminNotes` est déclaré sensible (`lib/sensitive.js`) : il est stocké
 * chiffré et se lit normalement via `reveal('Application', …)`. Deux raisons
 * justifient malgré tout ce module :
 *
 *  1. Le journal d'appel (`/api/admin/centre-appel/log`) a longtemps réécrit
 *     le champ **en clair** en y concaténant l'ancien contenu resté chiffré
 *     (constat ADM1-02). Des enregistrements existants ressemblent donc à :
 *
 *         [APPEL 2026-…] Décroché
 *         → rappeler lundi
 *
 *         ---
 *
 *         v1:AbC…:DeF…:GhI…
 *
 *     `decryptString` ne déchiffre que si la chaîne *commence* par `v1:`
 *     (`lib/crypto.js`) : sur ces lignes elle rend la chaîne telle quelle et
 *     l'admin lit du base64 à la place de ses notes historiques.
 *
 *  2. Après une rotation de clé, `decipher.final()` lève sur un tag GCM
 *     invalide. Une note illisible ne doit pas faire tomber la fiche entière.
 *
 * La fonction ci-dessous traite les deux cas d'un seul geste : elle déchiffre
 * **chaque** bloc `v1:…` rencontré, où qu'il se trouve dans la chaîne. Le cas
 * nominal (chaîne entièrement chiffrée) n'est qu'un cas particulier — le bloc
 * couvre alors toute la valeur. Un bloc indéchiffrable est remplacé par un
 * marqueur explicite plutôt que de propager une exception : on affiche ce qui
 * est lisible.
 *
 * Effet de bord utile : une note réparée à la lecture est ensuite réécrite
 * chiffrée par `protect()`, ce qui assainit la donnée au premier enregistrement
 * suivant.
 */

import { decryptString } from './crypto';

// Un bloc produit par `encryptString` : "v1:<iv b64>:<tag b64>:<ciphertext b64>".
const MOTIF_BLOC_CHIFFRE = /v1:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+/g;

const MARQUEUR_ILLISIBLE = '[note chiffrée illisible]';

/**
 * Rend le contenu lisible de `adminNotes`, quel que soit son état de stockage.
 *
 * @param {string | null | undefined} valeurStockee
 * @returns {string | null} texte lisible, ou null si le champ est vide
 */
export function lireNotesAdmin(valeurStockee) {
  if (valeurStockee === null || valeurStockee === undefined) return null;
  if (typeof valeurStockee !== 'string') return valeurStockee;
  if (valeurStockee === '') return '';

  return valeurStockee.replace(MOTIF_BLOC_CHIFFRE, (bloc) => {
    try {
      const clair = decryptString(bloc);
      return clair === null ? MARQUEUR_ILLISIBLE : clair;
    } catch (err) {
      console.warn('[notes-admin] bloc indéchiffrable ignoré :', err.message);
      return MARQUEUR_ILLISIBLE;
    }
  });
}

export { MARQUEUR_ILLISIBLE };
