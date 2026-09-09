import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const racine = path.dirname(fileURLToPath(import.meta.url));

/**
 * Premier filet de sécurité automatisé du projet (audit P1-1).
 *
 * Portée volontairement limitée à la logique pure : ce qui se teste sans base,
 * sans réseau et sans serveur Next. Les modules qui importent `@/lib/prisma`
 * sont hors périmètre ici — ils relèvent des tests d'intégration, qui exigent
 * une base jetable.
 */
export default defineConfig({
  resolve: {
    // Même alias que tsconfig.json, pour que les imports `@/lib/...` résolvent.
    alias: { '@': racine },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.js'],
    // Clé de test : les tests de chiffrement en ont besoin, et il ne doit
    // jamais s'agir de la clé de production.
    env: {
      ENCRYPTION_KEY: 'dGVzdC1rZXktMzItb2N0ZXRzLXBvdXItdml0ZXN0ISE=',
    },
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.js', 'utils/**/*.js'],
      reporter: ['text', 'html'],
    },
  },
});
