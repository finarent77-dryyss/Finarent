import { prisma } from '@/lib/prisma';

/**
 * Numérotation séquentielle AF-YYYY-NNNN pour auto-factures affiliation.
 *
 * Même correction que `lib/invoicing/numbering.js` : le maximum est calculé
 * numériquement et non par tri alphabétique. `orderBy: { invoiceNumber: 'desc' }`
 * sur une colonne texte plaçait « AF-2026-9999 » au-dessus de « AF-2026-10000 » ;
 * passé le dix-millième document de l'exercice, le numéro 10000 était réattribué
 * indéfiniment. Un numéro non conforme (reprise, import) faisait quant à lui
 * repartir la séquence à 0001, sur des numéros déjà émis.
 *
 * Le candidat est ensuite vérifié libre, comme dans `lib/reference.js` : deux
 * versements d'affiliation traités simultanément ne se disputent plus le même
 * numéro, la contrainte d'unicité restant le juge de paix.
 */

const LARGEUR = 4;
const NOMBRE_ESSAIS_CANDIDAT = 20;

export async function nextAffiliateInvoiceNumber(client = prisma) {
  const annee = new Date().getFullYear();
  const prefixe = `AF-${annee}-`;

  const lignes = await client.affiliateInvoice.findMany({
    where: { invoiceNumber: { startsWith: prefixe } },
    select: { invoiceNumber: true },
  });

  let rang = 0;
  for (const ligne of lignes) {
    const correspondance = /-(\d+)$/.exec(ligne?.invoiceNumber ?? '');
    if (!correspondance) continue;
    const valeur = parseInt(correspondance[1], 10);
    if (Number.isFinite(valeur) && valeur > rang) rang = valeur;
  }

  for (let essai = 0; essai < NOMBRE_ESSAIS_CANDIDAT; essai += 1) {
    rang += 1;
    const candidat = `${prefixe}${String(rang).padStart(LARGEUR, '0')}`;
    const pris = await client.affiliateInvoice.findUnique({
      where: { invoiceNumber: candidat },
      select: { id: true },
    });
    if (!pris) return candidat;
  }

  throw new Error(
    `Numérotation AF impossible : ${NOMBRE_ESSAIS_CANDIDAT} numéros consécutifs déjà pris.`,
  );
}
