#!/usr/bin/env node

/**
 * Reprise des notes d'administration restées en clair.
 *
 * Usage :
 *   node scripts/reprise-notes-admin.js            simulation (défaut)
 *   node scripts/reprise-notes-admin.js --ecrire   applique les réécritures
 *
 * Pourquoi ce script
 * ------------------
 * `Application.adminNotes` est déclaré sensible (`lib/sensitive.js`) : la
 * colonne est censée ne contenir que des blocs chiffrés. Le journal d'appel a
 * longtemps réécrit ce champ EN CLAIR en y concaténant l'ancien contenu resté
 * chiffré (constat ADM1-02). La lecture est rétablie — `lireNotesAdmin()`
 * déchiffre chaque bloc `v1:` où qu'il se trouve et restitue le reste tel quel —
 * mais la lecture ne répare rien en base : une fiche réparée n'est réécrite
 * chiffrée qu'au prochain enregistrement. Les dossiers qu'on ne rouvrira jamais
 * gardent donc indéfiniment des notes lisibles par quiconque accède à la table
 * ou à une sauvegarde. C'est un défaut de confidentialité, pas d'affichage.
 *
 * Ce que fait le script
 * ---------------------
 *  - il ignore les valeurs déjà réduites à un unique bloc `v1:` bien formé
 *    (rien à faire — le script est donc rejouable sans effet) ;
 *  - il réécrit les autres via `encryptString(lireNotesAdmin(valeur))`, c'est-à-
 *    dire le texte lisible tel que l'écran l'affiche aujourd'hui, rechiffré
 *    d'un seul bloc ;
 *  - il ne touche PAS aux valeurs dont un bloc est indéchiffrable (clé ayant
 *    tourné) : `lireNotesAdmin()` y substitue un marqueur, et réécrire
 *    reviendrait à remplacer définitivement le chiffré par ce marqueur. Elles
 *    sont comptées à part et laissées intactes.
 *
 * Ce que le script n'affiche jamais
 * ---------------------------------
 * Aucun contenu de note, ni en clair ni en chiffré, ni extrait, ni longueur
 * exploitable : un script de mise en conformité qui recopie les notes dans un
 * journal de terminal (ou dans la sortie d'un job CI) annule ce qu'il corrige.
 * Seuls des décomptes sortent d'ici.
 */

import { createRequire, register } from 'node:module';
import { PrismaClient } from '@prisma/client';
import { refuseProduction, inspecterBase } from './_guard.js';
import { encryptString } from '../lib/crypto.js';

// ─── Préambule ────────────────────────────────────────────────
// Deux gestes préalables. Aucun n'ouvre de connexion ni ne lit la base : ils
// mettent seulement le processus en état d'exécuter la garde et les imports.
//
// 1. Peupler `process.env` depuis .env / .env.local, comme le fait Next.
//    `refuseProduction()` juge sur `process.env.DATABASE_URL` ; lancé par
//    `node scripts/…`, rien ne l'a encore peuplé. La garde verrait
//    « DATABASE_URL non définie », conclurait à une base locale et laisserait
//    passer — alors que Prisma, lui, chargera le .env de son côté et se
//    connectera bel et bien à ce que ce fichier désigne. C'est exactement
//    l'ordre retenu par `scripts/prisma-securise.mjs` après l'incident du
//    9 septembre 2026 : contrôler l'hôte RÉELLEMENT visé, pas celui qu'on croit.
try {
  const require = createRequire(import.meta.url);
  const { loadEnvConfig } = require('@next/env');
  loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });
} catch {
  // @next/env indisponible : la garde s'appuiera sur ce que l'environnement
  // expose déjà, et Prisma chargera .env de son côté.
}

// 2. Autoriser les imports sans extension de `lib/` (voir le résolveur). Il doit
//    être enregistré AVANT le chargement de `lib/notes-admin.js`, d'où l'import
//    dynamique plus bas : un `import` statique serait résolu avant ce corps.
register('./_resolveur-extensions.mjs', import.meta.url);

// ─── Garde-fou anti-production (audit P0-1 / P1-3) ────────────
refuseProduction();

const { lireNotesAdmin, MARQUEUR_ILLISIBLE } = await import('../lib/notes-admin.js');

const ECRITURE_DEMANDEE = process.argv.includes('--ecrire');

/**
 * Forme d'un chiffré produit par `lib/crypto.js`, et RIEN d'autre autour :
 * "v1:<iv b64>:<tag b64>:<ciphertext b64>". Les ancres interdisent le cas qui
 * motive ce script — du texte en clair avant, après, ou entre deux blocs.
 * Le « : » n'appartient pas à l'alphabet base64 : la chaîne compte donc
 * exactement quatre segments, comme à l'écriture.
 */
const BLOC_CHIFFRE_UNIQUE = /^v1:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/;

const prisma = new PrismaClient();

async function main() {
  // Sans clé, chaque réécriture lèverait ligne à ligne : autant le dire avant.
  if (!process.env.ENCRYPTION_KEY) {
    console.error(
      '\n⛔ ENCRYPTION_KEY absente de l\'environnement.\n'
      + '   Le script ne peut ni relire ni rechiffrer les notes. Vérifiez .env / .env.local.\n',
    );
    process.exitCode = 1;
    return;
  }

  const { hote, motif } = inspecterBase();
  console.log(`\n🎯 Base visée : ${hote}  (${motif})`);
  console.log(
    ECRITURE_DEMANDEE
      ? '   Mode       : ÉCRITURE — les notes concernées vont être rechiffrées.\n'
      : '   Mode       : SIMULATION — aucune écriture (ajoutez --ecrire pour appliquer).\n',
  );

  const lignes = await prisma.application.findMany({
    where: { adminNotes: { not: null } },
    select: { id: true, adminNotes: true },
  });

  let vides = 0;
  let dejaChiffrees = 0;
  let aReprendre = 0;
  let illisibles = 0;
  let reecrites = 0;
  let echecs = 0;

  for (const ligne of lignes) {
    const valeur = ligne.adminNotes;

    if (typeof valeur !== 'string' || valeur === '') {
      vides += 1;
      continue;
    }

    // Cas nominal, et seul état acceptable : un unique bloc chiffré.
    if (BLOC_CHIFFRE_UNIQUE.test(valeur)) {
      dejaChiffrees += 1;
      continue;
    }

    const clair = lireNotesAdmin(valeur);

    // Un bloc indéchiffrable (rotation de clé) : `lireNotesAdmin` a mis un
    // marqueur à sa place. Rechiffrer ce résultat remplacerait le chiffré par
    // le marqueur — la note serait perdue pour de bon. On ne touche à rien.
    if (clair === null || clair.includes(MARQUEUR_ILLISIBLE)) {
      illisibles += 1;
      continue;
    }

    aReprendre += 1;
    if (!ECRITURE_DEMANDEE) continue;

    try {
      await prisma.application.update({
        where: { id: ligne.id },
        data: { adminNotes: encryptString(clair) },
      });
      reecrites += 1;
    } catch (err) {
      // Ni l'identifiant ni le contenu : seul le code d'erreur est utile ici.
      echecs += 1;
      console.error(`   ⚠️  Échec de réécriture (${err?.code || 'erreur inconnue'})`);
    }
  }

  console.log('📋 Notes d\'administration');
  console.log(`   Lignes examinées .......................... ${lignes.length}`);
  console.log(`   Déjà chiffrées d'un seul bloc (rien à faire) ${dejaChiffrees}`);
  console.log(`   Vides ..................................... ${vides}`);
  console.log(`   Illisibles, laissées en l'état ............ ${illisibles}`);
  console.log(
    ECRITURE_DEMANDEE
      ? `   Reprises .................................. ${reecrites} / ${aReprendre}`
      : `   À reprendre (en clair ou mixtes) .......... ${aReprendre}`,
  );
  if (echecs > 0) console.log(`   Échecs .................................... ${echecs}`);

  if (!ECRITURE_DEMANDEE && aReprendre > 0) {
    console.log('\n   Rien n\'a été écrit. Pour appliquer : node scripts/reprise-notes-admin.js --ecrire\n');
  } else {
    console.log('');
  }
}

main()
  .catch((err) => {
    console.error('\n⛔ Reprise interrompue :', err?.message || err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
