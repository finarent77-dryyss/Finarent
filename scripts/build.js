#!/usr/bin/env node

/**
 * Build Clever Cloud — Prisma generate + migrate deploy + next build + copie assets standalone.
 * Inspiré de slformations/scripts/build.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🏗️  Starting Clever Cloud build...');

// Addon PostgreSQL Clever Cloud → DATABASE_URL pour Prisma
if (process.env.POSTGRESQL_ADDON_URI && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.POSTGRESQL_ADDON_URI;
  console.log('✓ DATABASE_URL ← POSTGRESQL_ADDON_URI');
}

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) { /* sync wait */ }
}

// Exécute une commande, capture stdout+stderr (ré-affichés), renvoie { ok, output }
function execCapture(cmd, env) {
  try {
    const output = execSync(cmd, { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    if (output) process.stdout.write(output);
    return { ok: true, output };
  } catch (err) {
    const output = `${err.stdout || ''}${err.stderr || ''}`;
    if (output) process.stdout.write(output);
    return { ok: false, output };
  }
}

// Erreurs transitoires liées à la saturation de l'addon PostgreSQL Clever Cloud
const TRANSIENT_DB_ERROR = /too many connections|reach database|ECONNREFUSED|ETIMEDOUT|connection|timeout/i;

function syncDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn('⚠️  DATABASE_URL absent — sync DB ignorée');
    return;
  }

  const limitedDbUrl = dbUrl.includes('?')
    ? `${dbUrl}&connection_limit=1`
    : `${dbUrl}?connection_limit=1`;

  const env = { ...process.env, DATABASE_URL: limitedDbUrl };

  // Migrations dont les objets existent deja en base mais dont l'enregistrement
  // est reste en echec. On les marque APPLIQUEES, pas « rolled-back » :
  // « rolled-back » demandait a Prisma de les REJOUER, elles echouaient a
  // nouveau (« constraint already exists »), et le build basculait alors sur
  // le repli destructeur ci-dessous. C'est ce cycle qui a fait disparaitre des
  // colonnes de la table Application a chaque deploiement.
  const knownApplied = [
    '20260513120000_dashboard_perf_indexes',
    '20260623220000_call_center_ringover_fields',
    '20260626230000_admin_activity_log_prospect_center',
    '20260627120000_brevo_affiliate_fiscal',
    '20260629000000_commission_table',
  ];
  for (const name of knownApplied) {
    try {
      execSync(`npx prisma migrate resolve --applied ${name}`, { stdio: 'pipe', env });
      console.log(`✓ Migration marquée appliquée: ${name}`);
    } catch { /* déjà marquée, ou jamais enregistrée */ }
  }

  const MAX_ATTEMPTS = 3;
  const RETRY_DELAY_MS = 6000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`🔄 Sync DB (tentative ${attempt}/${MAX_ATTEMPTS}) — prisma migrate deploy...`);
    let res = execCapture('npx prisma migrate deploy', env);
    if (res.ok) {
      console.log('✅ Migrations appliquées');
      return;
    }

    // PAS de repli `db push --accept-data-loss` ici. Cette commande aligne la
    // base sur schema.prisma en SUPPRIMANT tout ce qui n'y figure pas : elle a
    // efface les colonnes reference / email / phone / firstName / lastName de
    // la table Application, rendant le formulaire public inoperant sans le
    // moindre message. Une migration qui echoue doit se voir et se corriger a
    // la main, jamais se contourner par une operation destructrice automatique.
    console.error('❌ migrate deploy échoué. Sortie Prisma :');
    console.error(res.output);

    // Saturation connexions (ancienne instance encore active) → réessai après pause
    if (attempt < MAX_ATTEMPTS && TRANSIENT_DB_ERROR.test(res.output)) {
      console.warn(`⚠️  Base saturée/inaccessible — nouvelle tentative dans ${RETRY_DELAY_MS / 1000}s...`);
      sleep(RETRY_DELAY_MS);
      continue;
    }

    // FATAL depuis le 9 septembre 2026.
    //
    // Ce bloc laissait auparavant le build se poursuivre : « le schéma est déjà
    // synchronisé par les déploiements précédents ». C'est une hypothèse, pas un
    // fait, et elle est fausse précisément dans le cas qui compte — une migration
    // qui échoue est le signe que la base et le code ont divergé. Le déploiement
    // partait alors quand même, et l'application servait du code attendant des
    // colonnes absentes : des erreurs 500 en production, sans qu'aucune étape du
    // build n'apparaisse en échec.
    //
    // C'est le même défaut que les crons comptés « réussis » sur un 401 (constat
    // P0-2 de l'audit) : un échec invisible est pire qu'une panne franche. Un
    // build qui s'arrête se voit et se corrige ; un build qui passe en mentant se
    // découvre par l'appel d'un client.
    //
    // Les échecs transitoires (saturation de connexions) sont déjà absorbés par
    // la boucle de réessai ci-dessus : arriver ici signifie une vraie divergence.
    if (process.env.AUTORISER_DEPLOIEMENT_SANS_MIGRATION === '1') {
      console.warn('⚠️  Sync DB en échec, mais AUTORISER_DEPLOIEMENT_SANS_MIGRATION=1.');
      console.warn('   Contournement explicite : le build se poursuit avec un schéma');
      console.warn('   potentiellement désynchronisé. À retirer dès l\'incident résolu.');
      return;
    }

    throw new Error(
      'Sync DB impossible après plusieurs tentatives — déploiement interrompu.\n' +
      '   La base et schema.prisma ont divergé. Corrigez la migration en cause\n' +
      '   (sortie Prisma ci-dessus) avant de redéployer.\n' +
      '   Contournement d\'urgence, en connaissance de cause :\n' +
      '   clever env set AUTORISER_DEPLOIEMENT_SANS_MIGRATION 1'
    );
  }
}

function copyStandaloneAssets() {
  const standalonePath = path.join(process.cwd(), '.next', 'standalone');
  if (!fs.existsSync(standalonePath)) {
    console.warn('⚠️  Dossier .next/standalone absent — vérifiez output:standalone dans next.config.js');
    return;
  }

  const publicSrc = path.join(process.cwd(), 'public');
  const publicDst = path.join(standalonePath, 'public');
  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDst, { recursive: true, force: true });
    console.log('✅ public/ → standalone/public');
  }

  const staticSrc = path.join(process.cwd(), '.next', 'static');
  const staticDst = path.join(standalonePath, '.next', 'static');
  if (fs.existsSync(staticSrc)) {
    fs.mkdirSync(path.dirname(staticDst), { recursive: true });
    fs.cpSync(staticSrc, staticDst, { recursive: true, force: true });
    console.log('✅ .next/static → standalone/.next/static');
  }
}

/**
 * Environnement du `next build`, avec un plafond mémoire par processus.
 *
 * Clever Cloud injecte `NODE_OPTIONS=--max-old-space-size=1262` sur une instance
 * de build d'environ 2 Go. `execSync` transmet cet environnement tel quel, donc
 * le plafond vaut pour CHAQUE processus : le parent et le worker de génération
 * statique. Deux fois 1262 Mo dépassent le conteneur, et le noyau tue le
 * second — d'où « Next.js build worker exited with code: null and signal:
 * SIGKILL », observé au déploiement du 11 septembre 2026.
 *
 * Le plafond est donc abaissé pour que parent et worker tiennent ensemble.
 * V8 déclenche ses collectes plus tôt : le build est un peu plus lent, mais il
 * aboutit. `next.config.js` limite déjà la génération à un seul worker.
 *
 * Réglage local ou en intégration continue : inchangé. La variable n'est
 * ajustée que si la plateforme a imposé la sienne.
 */
const PLAFOND_MEMOIRE_PAR_PROCESSUS_MO = 768;

function environnementBuild() {
  const env = { ...process.env };
  if (!/--max-old-space-size/.test(env.NODE_OPTIONS || '')) return env;

  const sansPlafond = env.NODE_OPTIONS.replace(/--max-old-space-size=\d+/g, '').trim();
  env.NODE_OPTIONS = `${sansPlafond} --max-old-space-size=${PLAFOND_MEMOIRE_PAR_PROCESSUS_MO}`.trim();
  console.log(`🧠 NODE_OPTIONS du build : ${env.NODE_OPTIONS}`);
  return env;
}

try {
  console.log('📦 prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  syncDatabase();

  console.log('⏳ Pause 3s (libération connexions DB)...');
  sleep(3000);

  console.log('⚡ next build...');
  execSync('npm run build:next', { stdio: 'inherit', env: environnementBuild() });

  console.log('📂 Copie assets standalone...');
  copyStandaloneAssets();

  console.log('✅ Build Clever Cloud terminé.');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
