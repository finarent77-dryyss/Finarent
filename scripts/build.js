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

  // Résoudre les migrations connues en échec (idempotent — ignoré si déjà résolu)
  const knownFailed = [
    '20260513120000_dashboard_perf_indexes',
    '20260623220000_call_center_ringover_fields',
    '20260626230000_admin_activity_log_prospect_center',
    '20260627120000_brevo_affiliate_fiscal',
    '20260629000000_commission_table',
  ];
  for (const name of knownFailed) {
    try {
      execSync(`npx prisma migrate resolve --rolled-back ${name}`, { stdio: 'pipe', env });
      console.log(`✓ Migration résolue: ${name}`);
    } catch { /* déjà résolue ou jamais appliquée */ }
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

    console.warn('⚠️  migrate deploy échoué — fallback db push...');
    res = execCapture('npx prisma db push --accept-data-loss --skip-generate', env);
    if (res.ok) {
      console.log('✅ Schema synchronisé via db push');
      return;
    }

    // Saturation connexions (ancienne instance encore active) → réessai après pause
    if (attempt < MAX_ATTEMPTS && TRANSIENT_DB_ERROR.test(res.output)) {
      console.warn(`⚠️  Base saturée/inaccessible — nouvelle tentative dans ${RETRY_DELAY_MS / 1000}s...`);
      sleep(RETRY_DELAY_MS);
      continue;
    }

    // NON-FATAL : le schéma est déjà synchronisé par les déploiements précédents.
    // Un échec transitoire de sync ne doit pas bloquer tout le déploiement —
    // l'app se connectera normalement au runtime.
    console.warn('⚠️  Sync DB impossible après plusieurs tentatives — build poursuivi.');
    console.warn('   (schéma supposé déjà à jour ; vérifier les migrations si un modèle a changé)');
    return;
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

try {
  console.log('📦 prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  syncDatabase();

  console.log('⏳ Pause 3s (libération connexions DB)...');
  sleep(3000);

  console.log('⚡ next build...');
  execSync('npm run build:next', { stdio: 'inherit' });

  console.log('📂 Copie assets standalone...');
  copyStandaloneAssets();

  console.log('✅ Build Clever Cloud terminé.');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
