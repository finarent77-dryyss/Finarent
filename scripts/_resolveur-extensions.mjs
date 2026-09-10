/**
 * Résolveur d'imports sans extension, pour les scripts de maintenance.
 *
 * Les modules de `lib/` sont écrits pour le bundler de Next, qui accepte un
 * spécificateur sans extension : `lib/notes-admin.js` fait
 * `import { decryptString } from './crypto'`. Node, en ESM, exige le chemin
 * complet et refuse ce spécificateur (`ERR_MODULE_NOT_FOUND`) — un script
 * lancé par `node scripts/…` ne peut donc pas importer ces modules tels quels.
 *
 * Ce crochet ne fait qu'une chose : quand un spécificateur RELATIF et SANS
 * extension échoue, il réessaie une fois avec « .js ». Il n'invente aucun
 * chemin, ne touche ni aux paquets npm ni aux imports absolus, et laisse
 * remonter l'erreur d'origine si le second essai échoue aussi.
 *
 * Il s'applique au seul processus qui l'enregistre via `register()` :
 * l'application Next continue de passer par son bundler, inchangée.
 */

const RELATIF = /^\.\.?\//;
const PORTE_UNE_EXTENSION = /\.[cm]?[jt]sx?$/;

/** @type {import('node:module').ResolveHook} */
export async function resolve(specificateur, contexte, suivant) {
  try {
    return await suivant(specificateur, contexte);
  } catch (erreur) {
    const rattrapable = erreur?.code === 'ERR_MODULE_NOT_FOUND'
      && RELATIF.test(specificateur)
      && !PORTE_UNE_EXTENSION.test(specificateur);
    if (!rattrapable) throw erreur;
    return suivant(`${specificateur}.js`, contexte);
  }
}
