import crypto from 'crypto';

/**
 * Parrainage client (« filleuls »).
 *
 * À ne pas confondre avec l'affiliation (`lib/affiliate.js`), qui rémunère des
 * apporteurs d'affaires professionnels. Ici, un client existant recommande
 * Finarent à un confrère.
 *
 * Les deux dispositifs partagent le paramètre d'URL `?ref=`, ce qui impose une
 * règle : un code de parrainage ne doit JAMAIS pouvoir être confondu avec un
 * code d'affilié. La génération vérifie donc l'unicité dans les deux tables.
 *
 * Cycle de vie d'un `Referral` :
 *   PENDING    invitation envoyée, le filleul n'a pas encore de compte
 *   SIGNED_UP  le filleul s'est inscrit
 *   CONVERTED  un de ses dossiers a été signé
 */

export const COOKIE_PARRAINAGE = 'finarent_referral';
export const DUREE_COOKIE_PARRAINAGE = 90 * 24 * 60 * 60; // 90 jours, comme l'affiliation

// Alphabet sans caractères ambigus : un code se dicte au téléphone.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const LONGUEUR = 8;

function tirerCode() {
  const octets = crypto.randomBytes(LONGUEUR);
  let code = '';
  for (let i = 0; i < LONGUEUR; i += 1) code += ALPHABET[octets[i] % ALPHABET.length];
  return code;
}

/**
 * Code libre, vérifié contre les codes de parrainage ET d'affiliation.
 *
 * L'ancienne implémentation tirait `Math.random().toString(36).substring(2, 8)`
 * sans aucune vérification, sur une colonne en contrainte d'unicité : une
 * collision se soldait par une erreur 500 pour l'utilisateur qui invitait.
 */
export async function genererCodeParrainage(client) {
  for (let essai = 0; essai < 10; essai += 1) {
    const code = tirerCode();
    const [dejaUser, dejaAffilie, dejaReferral] = await Promise.all([
      client.user.findUnique({ where: { referralCode: code }, select: { id: true } }),
      client.affiliate.findUnique({ where: { code }, select: { id: true } }),
      client.referral.findUnique({ where: { code }, select: { id: true } }),
    ]);
    if (!dejaUser && !dejaAffilie && !dejaReferral) return code;
  }
  // 10 collisions d'affilée sur 31^8 possibilités : on préfère un code plus
  // long à une erreur renvoyée à l'utilisateur.
  return `${tirerCode()}${tirerCode().slice(0, 4)}`;
}

/**
 * Garantit qu'un utilisateur possède un code de parrainage et le retourne.
 *
 * Le code n'était généré nulle part : la page affichait un repli calculé côté
 * navigateur à partir de l'identifiant technique, que personne ne savait
 * résoudre ensuite.
 */
export async function assurerCodeParrainage(client, userId) {
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { id: true, referralCode: true },
  });
  if (!user) return null;
  if (user.referralCode) return user.referralCode;

  const code = await genererCodeParrainage(client);
  try {
    const maj = await client.user.update({
      where: { id: userId },
      data: { referralCode: code },
      select: { referralCode: true },
    });
    return maj.referralCode;
  } catch {
    // Course entre deux requêtes du même utilisateur : l'autre a gagné.
    const relu = await client.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    return relu?.referralCode || null;
  }
}

/** Parrain correspondant à un code, ou null si le code n'est pas un parrainage. */
export async function trouverParrainParCode(client, code) {
  if (!code) return null;
  return client.user.findUnique({
    where: { referralCode: code.trim().toUpperCase() },
    select: { id: true, email: true, name: true, referralCode: true },
  });
}

/**
 * Rattache un nouvel inscrit à son parrain.
 *
 * Deux chemins mènent ici et doivent converger sur la même ligne :
 *   - le filleul a été invité par email (une ligne PENDING existe déjà) ;
 *   - il est arrivé par le lien de parrainage (aucune ligne, on la crée).
 */
export async function enregistrerInscriptionFilleul(client, { email, code }) {
  const adresse = String(email || '').trim().toLowerCase();
  if (!adresse) return null;

  // Invitation déjà enregistrée pour cette adresse : on la fait avancer.
  //
  // Comparaison insensible à la casse : l'adresse est normalisée à l'écriture
  // par la route d'invitation, mais rien ne garantit qu'un import ou une
  // création manuelle le fera. Une invitation « Jean@Exemple.fr » ne doit pas
  // rester introuvable et laisser le parrainage bloqué en PENDING pour
  // toujours.
  const existante = await client.referral.findFirst({
    where: { refereeEmail: { equals: adresse, mode: 'insensitive' }, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });
  if (existante) {
    return client.referral.update({
      where: { id: existante.id },
      data: { status: 'SIGNED_UP' },
    });
  }

  if (!code) return null;
  const parrain = await trouverParrainParCode(client, code);
  if (!parrain || parrain.email?.toLowerCase() === adresse) return null;

  const dejaRattache = await client.referral.findFirst({
    where: { referrerId: parrain.id, refereeEmail: { equals: adresse, mode: 'insensitive' } },
  });
  if (dejaRattache) return dejaRattache;

  return client.referral.create({
    data: {
      referrerId: parrain.id,
      refereeEmail: adresse,
      status: 'SIGNED_UP',
      code: await genererCodeParrainage(client),
    },
  });
}

/**
 * Marque converti le parrainage d'une adresse, à la signature d'un dossier.
 *
 * Rien ne faisait évoluer `status` jusqu'ici : les compteurs « inscrits » et
 * « convertis » de la page étaient condamnés à rester à zéro.
 *
 * @returns {Promise<object|null>} le parrainage converti, avec son parrain
 */
export async function marquerConversion(client, email) {
  const adresse = String(email || '').trim().toLowerCase();
  if (!adresse) return null;

  const parrainage = await client.referral.findFirst({
    where: { refereeEmail: { equals: adresse, mode: 'insensitive' }, status: { in: ['PENDING', 'SIGNED_UP'] } },
    orderBy: { createdAt: 'desc' },
  });
  if (!parrainage) return null;

  const converti = await client.referral.update({
    where: { id: parrainage.id },
    data: { status: 'CONVERTED', convertedAt: new Date() },
  });

  const parrain = await client.user.findUnique({
    where: { id: converti.referrerId },
    select: { id: true, email: true, name: true },
  });

  return { ...converti, parrain };
}
