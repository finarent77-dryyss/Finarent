import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/users';
import { logAffiliateAction } from '@/lib/affiliate-fiscal.js';
import { ligneCsv } from '@/lib/csv.js';

// Seuil légal de déclaration DAS2 (honoraires et commissions versés).
const SEUIL_DAS2_PAR_DEFAUT = 1200;
// Plancher plausible : la société n'existe pas avant, une année antérieure
// signale une erreur de saisie plutôt qu'une déclaration réelle.
const ANNEE_MINIMALE = 2000;

/**
 * Lit un paramètre numérique de l'URL.
 * Retourne `{ valeur }` si le paramètre est absent (valeur par défaut) ou
 * correctement formé, `{ erreur }` sinon — jamais `NaN`, qui rendait toutes
 * les comparaisons fausses et faisait basculer l'intégralité des affiliés
 * dans la déclaration fiscale, seuil légal compris.
 *
 * @param {URLSearchParams} parametres
 * @param {string} nom
 * @param {number} defaut
 * @param {{ entier?: boolean, min?: number, max?: number }} [contraintes]
 * @returns {{ valeur: number, erreur?: undefined } | { valeur?: undefined, erreur: string }}
 */
function lireParametreNumerique(parametres, nom, defaut, contraintes = {}) {
  const brut = parametres.get(nom);
  if (brut === null || brut.trim() === '') return { valeur: defaut };

  const valeur = Number(brut);
  if (!Number.isFinite(valeur)) {
    return { erreur: `Paramètre « ${nom} » invalide : une valeur numérique est attendue.` };
  }
  if (contraintes.entier && !Number.isInteger(valeur)) {
    return { erreur: `Paramètre « ${nom} » invalide : un nombre entier est attendu.` };
  }
  if (contraintes.min !== undefined && valeur < contraintes.min) {
    return { erreur: `Paramètre « ${nom} » invalide : valeur minimale ${contraintes.min}.` };
  }
  if (contraintes.max !== undefined && valeur > contraintes.max) {
    return { erreur: `Paramètre « ${nom} » invalide : valeur maximale ${contraintes.max}.` };
  }
  return { valeur };
}

export async function GET(request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const adminAccess = await isAdmin(session.user);
  if (!adminAccess) return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });

  const url = new URL(request.url);
  const anneeCourante = new Date().getFullYear();

  // Un document fiscal erroné doit être refusé, jamais produit en silence.
  const anneeLue = lireParametreNumerique(url.searchParams, 'year', anneeCourante, {
    entier: true,
    min: ANNEE_MINIMALE,
    max: anneeCourante + 1,
  });
  if (anneeLue.erreur) return NextResponse.json({ error: anneeLue.erreur }, { status: 400 });

  const seuilLu = lireParametreNumerique(url.searchParams, 'threshold', SEUIL_DAS2_PAR_DEFAUT, { min: 0 });
  if (seuilLu.erreur) return NextResponse.json({ error: seuilLu.erreur }, { status: 400 });

  const year = anneeLue.valeur;
  const threshold = seuilLu.valeur;

  const invoices = await prisma.affiliateInvoice.findMany({
    where: {
      issuedAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
      status: { in: ['ISSUED', 'SENT'] },
    },
    include: {
      affiliate: {
        select: {
          code: true,
          legalName: true,
          name: true,
          siret: true,
          fiscalAddress: true,
          fiscalPostalCode: true,
          fiscalCity: true,
          fiscalStatus: true,
        },
      },
    },
  });

  const byAffiliate = new Map();
  for (const inv of invoices) {
    const key = inv.affiliateId;
    const prev = byAffiliate.get(key) || { affiliate: inv.affiliate, totalHT: 0, count: 0 };
    prev.totalHT += inv.amountHT;
    prev.count += 1;
    byAffiliate.set(key, prev);
  }

  // Séparateur « ; » : c'est le format attendu par Excel en configuration
  // francophone, celle des postes qui déposent la déclaration.
  const optionsCsv = { separateur: ';' };

  const rows = [];
  rows.push(ligneCsv(
    ['Code', 'Nom légal', 'SIRET', 'Adresse', 'CP', 'Ville', 'Statut fiscal', 'Total HT année', 'Nb factures'],
    optionsCsv,
  ));

  for (const [, data] of byAffiliate) {
    if (data.totalHT < threshold) continue;
    const a = data.affiliate;
    // `legalName`, `fiscalAddress` et `fiscalCity` sont des champs libres
    // saisis à l'onboarding : un point-virgule y décalerait toutes les colonnes.
    rows.push(ligneCsv([
      a.code,
      a.legalName || a.name,
      a.siret || '',
      a.fiscalAddress || '',
      a.fiscalPostalCode || '',
      a.fiscalCity || '',
      a.fiscalStatus || '',
      data.totalHT.toFixed(2),
      data.count,
    ], optionsCsv));
  }

  const csv = `\uFEFF${rows.join('\n')}`;
  const dbUser = await prisma.user.findUnique({
    where: { auth0Id: session.user.sub },
    select: { id: true },
  });

  await logAffiliateAction({
    actorId: dbUser?.id,
    entityType: 'EXPORT',
    entityId: `DAS2-${year}`,
    action: 'DAS2_EXPORT',
    after: { year, threshold, rowCount: rows.length - 1 },
  });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="DAS2_FINARENT_${year}.csv"`,
    },
  });
}
