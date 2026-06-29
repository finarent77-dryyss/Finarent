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

  // Détecte si la DB est vierge (table _prisma_migrations absente)
  let isFreshDb = false;
  try {
    execSync(
      `npx prisma db execute --stdin --url "${limitedDbUrl}"`,
      { input: 'SELECT 1 FROM "_prisma_migrations" LIMIT 1;', stdio: 'pipe', env }
    );
  } catch {
    isFreshDb = true;
  }

  if (isFreshDb) {
    // DB fraîche : db push applique le schéma directement (pas de migration history)
    console.log('🆕 DB vierge détectée — prisma db push...');
    execSync('npx prisma db push --accept-data-loss --skip-generate', {
      stdio: 'inherit',
      env,
    });
    console.log('✅ Schema synchronisé via db push');
    return;
  }

  // DB existante : migrate deploy (données à préserver)
  console.log('🔄 DB existante — prisma migrate deploy...');
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`   Tentative ${attempt}/${maxRetries}...`);
      execSync('npx prisma migrate deploy', { stdio: 'inherit', env });
      return;
    } catch (err) {
      console.error(`⚠️  Migration échec tentative ${attempt}:`, err.message);
      if (attempt < maxRetries) {
        console.log('⏳ Nouvelle tentative dans 5s...');
        sleep(5000);
      } else {
        throw new Error('migrate deploy a échoué après 3 tentatives — build interrompu');
      }
    }
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
