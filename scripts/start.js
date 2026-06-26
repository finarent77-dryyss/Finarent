import { execSync } from 'child_process';
import fs from 'fs';

/**
 * Démarrage Clever Cloud — serveur Next.js standalone sur 0.0.0.0:PORT.
 * Inspiré de slformations/scripts/start.js
 */

const standaloneDir = '.next/standalone';
const standaloneServer = '.next/standalone/server.js';

function copyStandaloneAssets() {
  if (!fs.existsSync(standaloneDir)) return;

  if (fs.existsSync('public')) {
    console.log('📂 Copie public/ → standalone...');
    fs.cpSync('public', `${standaloneDir}/public`, { recursive: true, force: true });
  }

  if (fs.existsSync('.next/static')) {
    console.log('📂 Copie .next/static → standalone...');
    fs.mkdirSync(`${standaloneDir}/.next/static`, { recursive: true });
    fs.cpSync('.next/static', `${standaloneDir}/.next/static`, { recursive: true, force: true });
  }
}

const port = process.env.PORT || '8080';
const host = '0.0.0.0';

console.log(`🚀 Démarrage sur ${host}:${port}...`);

try {
  if (fs.existsSync(standaloneServer)) {
    copyStandaloneAssets();
    console.log('🚀 Serveur standalone...');
    execSync(`node ${standaloneServer}`, {
      stdio: 'inherit',
      env: { ...process.env, HOSTNAME: host, PORT: port },
    });
  } else {
    console.log('⚠️  Standalone absent — fallback next start');
    execSync(`npx next start -p ${port} -H ${host}`, {
      stdio: 'inherit',
      env: { ...process.env, HOSTNAME: host, PORT: port },
    });
  }
} catch {
  process.exit(1);
}
