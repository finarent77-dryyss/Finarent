import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Action 3.3 du plan : `next lint` disparaît en Next 16, le script `lint`
  // appelle désormais `eslint .` directement. Contrairement à `next lint`, qui
  // ne parcourait que les dossiers applicatifs, `eslint .` part de la racine :
  // il faut donc exclure explicitement ce que `next lint` ignorait d'office,
  // sans quoi le lint échoue sur du code que nous n'écrivons pas.
  {
    ignores: [
      "node_modules/**",
      // Sortie de `next build` (dont .next/standalone) : code transpilé et
      // minifié. Le linter y signalait 4 erreurs react/display-name qui ne
      // correspondent à aucune source du dépôt.
      ".next/**",
      // Documents téléversés (données sensibles, jamais versionnées).
      "private/**",
      // Autres artefacts générés.
      "dist/**",
      "coverage/**",
      "app/generated/prisma/**",
      ".email-preview/**",
      "docs/livraison-client/**",
      ".vercel/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default eslintConfig;
