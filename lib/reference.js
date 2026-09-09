/**
 * Numéro de dossier Finarent : FIN-AAAA-NNNNN.
 *
 * C'est l'identifiant pivot de toute l'application : il est repris dans les
 * emails, sur les factures et devis, dans le nom des dossiers de stockage et
 * dans le registre des documents générés. Un client qui appelle donne ce
 * numéro, et il doit suffire à retrouver l'ensemble de son historique.
 *
 * Numérotation SÉQUENTIELLE, et non aléatoire comme auparavant. Un tirage sur
 * 5 chiffres donnait, par le paradoxe des anniversaires, environ 50 % de
 * chances de collision dès ~370 dossiers dans l'année — or `reference` est en
 * contrainte d'unicité : la collision se traduisait par une erreur 500 pour un
 * prospect en train de déposer sa demande.
 *
 * Le format à 5 chiffres est conservé pour rester comparable aux références
 * déjà émises.
 */

const PREFIXE = 'FIN';
const LARGEUR = 5;

/**
 * Client Prisma chargé à la demande, pour que ce module reste importable hors
 * du runtime Next (scripts de recette et de seed créent aussi des dossiers, et
 * doivent obtenir un vrai numéro plutôt que d'en inventer un).
 */
let clientDefaut = null;
async function db() {
  if (clientDefaut) return clientDefaut;
  try {
    ({ prisma: clientDefaut } = await import('@/lib/prisma'));
  } catch {
    const { PrismaClient } = await import('@prisma/client');
    clientDefaut = new PrismaClient();
  }
  return clientDefaut;
}

function prefixeAnnee(annee = new Date().getFullYear()) {
  return `${PREFIXE}-${annee}-`;
}

/**
 * Plus grand numéro déjà attribué pour l'année en cours.
 * Le tri alphabétique suffit tant que la largeur est fixe.
 */
async function dernierNumero(client, prefixe) {
  const dernier = await client.application.findFirst({
    where: { reference: { startsWith: prefixe } },
    orderBy: { reference: 'desc' },
    select: { reference: true },
  });
  const m = dernier?.reference?.match(/-(\d+)$/);
  const valeur = m ? parseInt(m[1], 10) : 0;
  return Number.isNaN(valeur) ? 0 : valeur;
}

/**
 * Attribue le prochain numéro de dossier libre.
 *
 * `client` est injectable pour les scripts qui tournent hors du runtime Next
 * avec leur propre PrismaClient.
 *
 * La boucle protège des créations concurrentes : deux demandes déposées à la
 * même seconde calculent le même numéro, la seconde le trouve pris et passe au
 * suivant. La contrainte d'unicité en base reste le juge de paix.
 *
 * @param {object} [clientInjecte] PrismaClient (scripts hors Next)
 * @returns {Promise<string>} ex. "FIN-2026-00412"
 */
export async function genererReferenceDossier(clientInjecte = null) {
  const client = clientInjecte || (await db());
  const prefixe = prefixeAnnee();
  let numero = await dernierNumero(client, prefixe);

  for (let essai = 0; essai < 20; essai += 1) {
    numero += 1;
    const candidat = `${prefixe}${String(numero).padStart(LARGEUR, '0')}`;
    const pris = await client.application.findUnique({
      where: { reference: candidat },
      select: { id: true },
    });
    if (!pris) return candidat;
  }

  // Improbable : 20 numéros consécutifs pris pendant le calcul. On bascule sur
  // un suffixe horodaté plutôt que de refuser la demande d'un prospect.
  return `${prefixe}${String(Date.now()).slice(-LARGEUR)}`;
}

/**
 * Numéro de dossier lisible pour un enregistrement, avec repli.
 * Évite d'afficher « null » dans un email ou un PDF sur les anciens dossiers
 * créés avant la mise en place des références.
 */
export function referenceLisible(entite) {
  return entite?.reference || (entite?.id ? `SANS-REF-${String(entite.id).slice(-6)}` : '—');
}
