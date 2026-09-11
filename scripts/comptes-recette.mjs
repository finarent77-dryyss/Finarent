/**
 * Comptes de recette pour le protocole de test client (docs/PROTOCOLE_TEST_CLIENT.md).
 *
 * Crée ou réinitialise, sur le locataire Auth0 lu dans l'environnement, un compte
 * par profil à tester, lui attribue son rôle Auth0 (lu par l'Action post-login en
 * place) et son `app_metadata.role` (lu par la version documentée de l'Action),
 * puis écrit les accès dans `docs/client/` — dossier exclu du versionnement.
 *
 * Les mots de passe ne sont jamais affichés dans le terminal. Ils sont ensuite
 * injectés dans la version HTML du protocole par `scripts/build-livraison.mjs`,
 * elle aussi hors git : le fichier Markdown versionné n'en contient aucun.
 *
 *   node -r dotenv/config scripts/comptes-recette.mjs --locataire-production
 *
 * Le drapeau est exigé parce que l'opération vise un locataire réel : le script
 * affiche d'abord le locataire visé et refuse sans lui. Il est rejouable : un
 * compte déjà présent voit son mot de passe réinitialisé, pas dupliqué.
 *
 * Choix de comptes : les profils client, administrateur et centre d'appel sont
 * créés sur des adresses du domaine finarent.com (à faire exister ou rediriger
 * pour recevoir les emails de la plateforme). Les profils partenaire et assureur
 * réutilisent les comptes de démonstration existants, déjà rattachés en base à
 * une société partenaire et à des dossiers : c'est la seule façon d'avoir un
 * espace partenaire non vide, aucun écran ne permettant ce rattachement.
 */

import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { obtenirJetonManagement, configurationManagement } from '../lib/auth0-management.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOSSIER_SORTIE = join(ROOT, 'docs', 'client');
const CONNEXION = 'Username-Password-Authentication';
const DRAPEAU = '--locataire-production';

const COMPTES = [
  { profil: 'Client', code: 'Client', email: 'recette-client@finarent.com', nom: 'Claire Recette (client)', role: 'client', mode: 'creer' },
  { profil: 'Administrateur', code: 'Admin', email: 'recette-admin@finarent.com', nom: 'Adrien Recette (admin)', role: 'admin', mode: 'creer', fort: true },
  { profil: 'Partenaire', code: 'Partenaire', email: 'partenaire@demo.fr', role: 'partner', mode: 'reinitialiser' },
  { profil: 'Assureur', code: 'Assureur', email: 'assureur@demo.fr', role: 'insurer', mode: 'reinitialiser' },
  { profil: "Centre d'appel (responsable)", code: 'Resp', email: 'recette-responsable@finarent.com', nom: 'Rémi Recette (responsable)', role: 'client', mode: 'creer' },
  { profil: "Centre d'appel (agent)", code: 'Agent', email: 'recette-agent@finarent.com', nom: 'Agathe Recette (agent)', role: 'client', mode: 'creer' },
];

const { domaine, configuree, manquantes } = configurationManagement();
if (!configuree) {
  console.error(`Management API Auth0 non configurée : ${manquantes.join(', ')} absente(s).`);
  process.exit(1);
}
console.log(`Locataire visé : ${domaine}`);
if (!process.argv.includes(DRAPEAU)) {
  console.error(`Refus : ce script écrit sur un locataire réel. Relancez avec ${DRAPEAU} si c'est bien celui-ci.`);
  process.exit(1);
}

const jeton = await obtenirJetonManagement();

async function api(method, chemin, body) {
  const reponse = await fetch(`https://${domaine}/api/v2/${chemin}`, {
    method,
    headers: { Authorization: `Bearer ${jeton}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const texte = await reponse.text();
  let json;
  try {
    json = JSON.parse(texte);
  } catch {
    json = texte;
  }
  if (!reponse.ok) {
    const detail = typeof json === 'object' ? json.message || json.error : json;
    throw new Error(`${method} ${chemin} → ${reponse.status} ${detail}`);
  }
  return json;
}

/** Alphabet sans caractères ambigus (0/O, 1/l/I), pour des mots de passe recopiables. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
function aleatoire(longueur) {
  const octets = randomBytes(longueur);
  let s = '';
  for (let i = 0; i < longueur; i++) s += ALPHABET[octets[i] % ALPHABET.length];
  return s;
}

const roles = await api('GET', 'roles');
function idRole(nom) {
  const r = roles.find((x) => x.name === nom);
  if (!r) throw new Error(`Rôle Auth0 absent sur le locataire : ${nom}`);
  return r.id;
}

const existants = await api('GET', 'users?per_page=100&fields=email,user_id&include_fields=true');
const resultat = [];

for (const compte of COMPTES) {
  const motDePasse = `Finarent-${compte.code}-${aleatoire(compte.fort ? 10 : 6)}!`;
  let user = existants.find((u) => (u.email || '').toLowerCase() === compte.email);
  const cible = () => `users/${encodeURIComponent(user.user_id)}`;

  if (!user) {
    if (compte.mode !== 'creer') throw new Error(`Compte de démonstration introuvable : ${compte.email}`);
    user = await api('POST', 'users', {
      connection: CONNEXION,
      email: compte.email,
      name: compte.nom,
      password: motDePasse,
      email_verified: true,
      verify_email: false,
      app_metadata: { role: compte.role },
    });
    console.log(`créé                 ${compte.email}`);
  } else {
    // Auth0 refuse un PATCH mêlant mot de passe et autres champs : deux appels.
    await api('PATCH', cible(), { password: motDePasse, connection: CONNEXION });
    await api('PATCH', cible(), { app_metadata: { role: compte.role } });
    console.log(`mot de passe défini  ${compte.email}`);
  }

  // Rôle Auth0 (RBAC) : un seul par compte, pour que l'Action post-login soit sans ambiguïté.
  const actuels = await api('GET', `${cible()}/roles`);
  const aRetirer = actuels.filter((r) => r.name !== compte.role).map((r) => r.id);
  if (aRetirer.length) await api('DELETE', `${cible()}/roles`, { roles: aRetirer });
  if (!actuels.some((r) => r.name === compte.role)) await api('POST', `${cible()}/roles`, { roles: [idRole(compte.role)] });

  resultat.push({ profil: compte.profil, email: compte.email, motDePasse, role: compte.role, auth0Id: user.user_id });
}

mkdirSync(DOSSIER_SORTIE, { recursive: true });
const genereLe = new Date();
writeFileSync(
  join(DOSSIER_SORTIE, 'comptes-test.json'),
  `${JSON.stringify({ genereLe: genereLe.toISOString(), locataire: domaine, comptes: resultat }, null, 2)}\n`,
  'utf8'
);

const lignes = resultat.map((r) => `| ${r.profil} | \`${r.email}\` | \`${r.motDePasse}\` | ${r.role} |`).join('\n');
writeFileSync(
  join(DOSSIER_SORTIE, 'COMPTES_TEST.md'),
  `# Comptes de recette — Finarent

Générés le ${genereLe.toLocaleString('fr-FR')} sur le locataire Auth0 \`${domaine}\`. **Ce fichier est hors git.**

| Profil | Email | Mot de passe | Rôle Auth0 |
|---|---|---|---|
${lignes}

- Les adresses \`@finarent.com\` doivent exister ou être redirigées vers une boîte consultée, sinon les emails de la plateforme (confirmations, devis, factures) n'arrivent nulle part.
- Les comptes partenaire et assureur sont les comptes de démonstration existants : ils sont déjà rattachés en base à une société partenaire et à des dossiers.
- Après la recette : changer ces mots de passe ou désactiver les comptes depuis Auth0 (User Management → Users), le compte administrateur en premier.
- Pour tout regénérer : \`node -r dotenv/config scripts/comptes-recette.mjs ${DRAPEAU}\`, puis \`node scripts/build-livraison.mjs\` pour remplir le protocole.
`,
  'utf8'
);

console.log(`\nAccès écrits dans docs/client/ (hors git) :`);
for (const r of resultat) console.log(`  ${r.profil.padEnd(30)} ${r.email.padEnd(36)} rôle ${r.role}`);
console.log('\nÉtape suivante : node scripts/build-livraison.mjs — le protocole HTML reprend ces accès.');
