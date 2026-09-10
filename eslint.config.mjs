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
  // Extensions réellement analysées — corrigé le 10 septembre 2026.
  //
  // En configuration « plate », ESLint ne parcourt par défaut que .js, .mjs et
  // .cjs quand on lui passe un dossier. Sans ce motif, les **273 fichiers .jsx**
  // du dépôt — c'est-à-dire la totalité de l'interface React — n'étaient
  // analysés par personne : ni par le linter, ni par `tsc` (dont le tsconfig
  // n'inclut que .ts et .tsx). Le lint passait au vert en ne regardant qu'un
  // tiers du code.
  //
  // Régression introduite par notre propre bascule de `next lint` vers
  // `eslint .` (action 3.3) : `next lint` couvrait les .jsx d'office. Une
  // migration qui préserve la commande mais perd son périmètre est une
  // migration ratée — d'où ce motif explicite plutôt qu'un défaut implicite.
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
  },
  ...compat.extends("next/core-web-vitals"),

  // Règles ajustées le 10 septembre 2026, en même temps que l'élargissement du
  // périmètre aux .jsx ci-dessus.
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      // 145 occurrences, toutes de la même nature : une apostrophe dans un texte
      // français (« l'entreprise », « d'affaires »). La règle vise l'ambiguïté
      // entre une apostrophe littérale et une chaîne JSX mal fermée — un risque
      // réel en anglais, où l'apostrophe est rare, et inexistant ici, où elle
      // est dans une phrase sur deux. L'appliquer imposerait d'écrire
      // « l&apos;entreprise » dans toute l'interface : des textes illisibles à
      // la relecture, pour aucun défaut évité.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
