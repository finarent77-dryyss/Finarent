#!/usr/bin/env node

/**
 * Enveloppe protégée autour des commandes Prisma qui écrivent en base.
 *
 * Pourquoi ce fichier existe — incident du 9 septembre 2026
 * ---------------------------------------------------------
 * `scripts/_guard.js` protégeait les six scripts maison, et il fonctionne. Mais
 * il ne couvrait pas les commandes Prisma elles-mêmes : `prisma migrate deploy`,
 * `prisma migrate dev`, `prisma db push` s'exécutent sans passer par lui. Or
 * c'est exactement ce que le plan de correction désigne comme dangereux —
 * « une commande de routine (npm run db:migrate) peut détruire les données
 * clients réelles ».
 *
 * Le scénario s'est produit : une ligne `DATABASE_URL` distante, restée active
 * plus bas dans le `.env`, l'a emporté sur la ligne locale — dotenv retient la
 * DERNIÈRE occurrence d'une clé, pas la première. Un `prisma migrate deploy`
 * lancé pour la base de développement est parti sur la base distante. La
 * migration était additive, il n'y a eu aucune perte ; avec une migration
 * portant un `DROP COLUMN`, l'issue aurait été tout autre.
 *
 * Deux enseignements, tous deux traités ici :
 *   1. la garde doit s'appliquer à la commande, pas seulement aux scripts ;
 *   2. l'hôte réellement visé doit être AFFICHÉ avant d'agir, car la variable
 *      qui gagne n'est pas forcément celle qu'on croit avoir écrite.
 *
 * Usage : node scripts/prisma-securise.mjs migrate deploy
 *         node scripts/prisma-securise.mjs db push
 * Contournement délibéré : ajouter --i-know-this-is-production
 */

import { spawnSync } from 'child_process';
import { createRequire } from 'module';
import { refuseProduction, inspecterBase } from './_guard.js';

// Charge .env / .env.local exactement comme le fait Next, afin que la garde
// évalue la même DATABASE_URL que celle que Prisma utilisera réellement.
try {
  const require = createRequire(import.meta.url);
  const { loadEnvConfig } = require('@next/env');
  loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });
} catch {
  // @next/env indisponible : Prisma chargera .env de son côté, la garde
  // s'appuiera sur ce que l'environnement expose déjà.
}

const argumentsPrisma = process.argv.slice(2).filter((a) => a !== '--i-know-this-is-production');

if (argumentsPrisma.length === 0) {
  console.error('Usage : node scripts/prisma-securise.mjs <commande prisma…>');
  process.exit(1);
}

const { hote, motif, distante } = inspecterBase();
console.log(`\n🎯 Base visée : ${hote}  (${motif})`);
console.log(`   Commande   : prisma ${argumentsPrisma.join(' ')}\n`);

refuseProduction({ nom: `prisma ${argumentsPrisma.join(' ')}` });

if (!distante) {
  const resultat = spawnSync('npx', ['prisma', ...argumentsPrisma], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  process.exit(resultat.status ?? 1);
}

// Chemin atteint uniquement avec le drapeau de contournement : refuseProduction()
// a déjà averti et laissé passer.
const resultat = spawnSync('npx', ['prisma', ...argumentsPrisma], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(resultat.status ?? 1);
