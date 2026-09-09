// Promotion d'un utilisateur en ADMIN — Auth0 d'abord, base ensuite.
// Usage : node scripts/promote-admin.js <email>
//
// Constat P1-8 de l'audit de septembre 2026 : le rôle applicatif vient du claim
// Auth0, que `syncUser()` (lib/users.js) recopie en base à chaque requête
// authentifiée, avec CLIENT par défaut. L'ancienne version de ce script se
// contentait d'un UPDATE en base : la promotion retombait dès la navigation
// suivante, sans le moindre message. On écrit donc dans Auth0 en premier, et en
// base uniquement si Auth0 a accepté.
//
// La personne promue doit se reconnecter pour que son jeton porte le nouveau
// claim (cf. l'Action « Post Login » décrite dans AUTH0_SETUP.md).

import { PrismaClient } from '@prisma/client';
import { refuseProduction } from './_guard.js';
import { configurationManagement, definirRoleUtilisateur } from '../lib/auth0-management.js';

// Refuse de tourner contre une base de production (audit P0-1 / P1-3).
refuseProduction();

const prisma = new PrismaClient();

const ROLE = 'ADMIN';

async function promote(email) {
  const utilisateur = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, auth0Id: true, role: true },
  });

  if (!utilisateur) {
    console.error(`❌  Aucun utilisateur avec l'email ${email} en base.`);
    console.log("    Note : la personne doit s'être connectée au moins une fois pour exister en base.");
    process.exitCode = 1;
    return;
  }

  if (utilisateur.role === ROLE) {
    console.log(`ℹ️  ${email} est déjà ${ROLE} en base — la propagation vers Auth0 est refaite par sécurité.`);
  }

  const { configuree, manquantes, domaine } = configurationManagement();
  if (!configuree) {
    console.error(
      `\n⛔ Promotion refusée — Management API Auth0 non configurée.\n`
      + `\n   Variables absentes : ${manquantes.join(', ')}\n`
      + `\n   Le rôle est porté par le claim Auth0 : une écriture en base seule\n`
      + `   serait effacée dès la requête suivante. Rien n'a été modifié.\n`
      + `\n   Procédure de configuration : AUTH0_SETUP.md\n`
    );
    process.exitCode = 1;
    return;
  }

  try {
    await definirRoleUtilisateur(utilisateur.auth0Id, ROLE);
    console.log(`✅  Auth0 (${domaine}) : app_metadata.role = admin pour ${utilisateur.auth0Id}`);
  } catch (erreur) {
    console.error(`\n⛔ Auth0 a refusé la modification — rien n'a été écrit en base.\n\n   ${erreur.message}\n`);
    process.exitCode = 1;
    return;
  }

  await prisma.user.update({ where: { id: utilisateur.id }, data: { role: ROLE } });

  console.log(`✅  Base : ${email} est maintenant ${ROLE}.`);
  console.log('ℹ️  La personne doit se déconnecter puis se reconnecter pour que son jeton porte le nouveau rôle.');
}

const email = process.argv[2];
if (!email) {
  console.log('Utilisation : node scripts/promote-admin.js <email>');
  process.exit(1);
}

promote(email)
  .catch((erreur) => {
    console.error('❌  Erreur inattendue :', erreur);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
