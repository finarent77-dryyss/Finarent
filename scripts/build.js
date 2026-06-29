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

function resolveFailedMigrations(env) {
  try {
    const raw = execSync(
      `npx prisma db execute --stdin --url "${env.DATABASE_URL}"`,
      {
        input: `SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NULL AND started_at IS NOT NULL AND rolled_back_at IS NULL;`,
        stdio: 'pipe',
        env,
      }
    ).toString();
    const names = raw.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('migration_name') && l !== '---');
    for (const name of names) {
      try {
        execSync(`npx prisma migrate resolve --rolled-back ${name}`, { stdio: 'pipe', env });
        console.log(`✓ Migration résolue (rolled-back): ${name}`);
      } catch { /* déjà résolue */ }
    }
  } catch { /* table absente ou pas de failed — ignoré */ }
}

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

  // Résoudre les migrations en échec avant toute tentative
  resolveFailedMigrations(env);

  // Tenter migrate deploy
  console.log('🔄 prisma migrate deploy...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit', env });
    console.log('✅ Migrations appliquées');
    return;
  } catch (err) {
    console.warn('⚠️  migrate deploy échoué:', err.message.split('\n')[0]);
  }

  // Fallback : db push (DB fraîche ou historique migrations corrompu)
  console.log('🔀 Fallback — prisma db push --accept-data-loss...');
  execSync('npx prisma db push --accept-data-loss --skip-generate', {
    stdio: 'inherit',
    env,
  });
  console.log('✅ Schema synchronisé via db push');
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
