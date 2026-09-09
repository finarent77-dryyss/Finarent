/**
 * Garde-fou anti-production pour les scripts qui touchent la base.
 *
 * Constat P0-1 / P1-3 de l'audit de septembre 2026 : six scripts écrivent et
 * suppriment en base sans jamais vérifier ce que DATABASE_URL désigne, alors
 * que le .env de développement a longtemps pointé sur l'addon de production.
 * `seed-demo.js` commence par dix-huit deleteMany() sans filtre : lancé en
 * l'état, il détruit des données clients réelles.
 *
 * Tout script qui écrit en base appelle refuseProduction() en première
 * instruction, avant d'ouvrir la moindre connexion.
 */

/** Hôtes gérés : une base servie par l'un d'eux n'est jamais une base locale. */
const HEBERGEURS_DISTANTS = /clever-cloud\.com|\.neon\.tech|amazonaws\.com|supabase\.co|azure\.com|\.render\.com/i;

/** Hôtes explicitement locaux, qui l'emportent sur toute autre heuristique. */
const HOTES_LOCAUX = /@(localhost|127\.0\.0\.1|\[::1\]|host\.docker\.internal|db|postgres)[:\/]/i;

const DRAPEAU = '--i-know-this-is-production';

/**
 * Décrit ce que DATABASE_URL désigne, sans jamais exposer le mot de passe.
 * @returns {{ distante: boolean, hote: string, motif: string }}
 */
export function inspecterBase(url = process.env.DATABASE_URL || '') {
  if (!url) {
    return { distante: false, hote: '(aucune)', motif: 'DATABASE_URL non définie' };
  }

  let hote = '(illisible)';
  try {
    hote = new URL(url).hostname || hote;
  } catch {
    // URL malformée : on retombe sur l'analyse textuelle ci-dessous.
  }

  if (HOTES_LOCAUX.test(url)) {
    return { distante: false, hote, motif: 'hôte local' };
  }
  if (HEBERGEURS_DISTANTS.test(url)) {
    return { distante: true, hote, motif: 'hébergeur géré reconnu' };
  }
  if (process.env.NODE_ENV === 'production') {
    return { distante: true, hote, motif: 'NODE_ENV=production' };
  }
  return { distante: false, hote, motif: 'hôte non reconnu comme distant' };
}

/**
 * Interrompt le script si DATABASE_URL désigne une base distante.
 *
 * @param {object}  [options]
 * @param {boolean} [options.allowWithFlag=true]
 *   Autorise le contournement explicite par `--i-know-this-is-production`.
 *   Mettre à false pour un script dont l'exécution en production n'a aucun
 *   sens légitime.
 * @param {string}  [options.nom]
 *   Nom affiché du script ; par défaut, celui du fichier lancé.
 */
export function refuseProduction({ allowWithFlag = true, nom } = {}) {
  const script = nom || process.argv[1]?.split(/[\\/]/).pop() || 'ce script';
  const { distante, hote, motif } = inspecterBase();

  if (!distante) return;

  if (allowWithFlag && process.argv.includes(DRAPEAU)) {
    console.warn(
      `\n⚠️  ${script} s'exécute sur une base DISTANTE : ${hote} (${motif}).\n` +
      `   Contournement explicite accepté. Les écritures seront réelles.\n`
    );
    return;
  }

  console.error(
    `\n⛔ Exécution refusée — ${script}\n` +
    `\n   DATABASE_URL désigne une base distante : ${hote}\n` +
    `   Motif de la détection : ${motif}\n` +
    `\n   Ce script écrit et supprime des données. Sur la base de production,\n` +
    `   il détruirait des dossiers clients réels.\n` +
    `\n   Pointez DATABASE_URL sur votre base de développement locale.\n` +
    (allowWithFlag
      ? `   Si l'exécution distante est délibérée : ${DRAPEAU}\n`
      : `   Ce script n'admet aucun contournement.\n`)
  );
  process.exit(1);
}
