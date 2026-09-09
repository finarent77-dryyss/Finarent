/**
 * Limitation de débit persistante (PostgreSQL) — constat P2-3.
 *
 * Avant : un `Map` dans la mémoire du processus. Deux défauts rédhibitoires en
 * production Clever Cloud :
 *   1. multi-instance — chaque instance comptait pour elle seule, le quota réel
 *      était donc « limite × nombre d'instances » ;
 *   2. redéploiement — le compteur repartait de zéro à chaque livraison.
 *
 * Désormais le compteur vit dans la table `RateLimitCounter`, partagée par
 * toutes les instances. PostgreSQL a été retenu plutôt que Redis : aucun addon
 * supplémentaire à ouvrir ni à facturer, et le volume (quelques lignes par IP
 * et par heure, purgées par le cron) est sans commune mesure avec la charge
 * métier déjà encaissée par la base.
 *
 * Fenêtre fixe alignée sur l'époque plutôt que fenêtre glissante ancrée sur la
 * première requête : c'est ce qui rend la clé (`key`, `windowStart`)
 * déterministe, donc l'incrément atomisable en un seul aller-retour SQL.
 * Contrepartie assumée : un client peut consommer son quota en fin de fenêtre
 * puis le reconsommer aussitôt après la bascule. Pour un garde-fou anti-flood,
 * c'est sans conséquence.
 *
 * Les seaux (`bucket`) cloisonnent les usages : déposer une demande de devis ne
 * consomme pas le quota de la demande de financement.
 */

const WINDOW_MS = 60 * 60 * 1000; // 1 heure
const MAX_REQUESTS = 5;

// ─── Repli en mémoire ─────────────────────────────────────────
// Conservé comme filet de sécurité quand la base est injoignable (voir
// `checkRateLimit`) et comme implémentation utilisée hors base configurée
// (tests unitaires, scripts).
const requests = new Map();

/** Nettoyage périodique : sans cela la Map grossit indéfiniment. */
function purger(now) {
  if (requests.size < 5000) return;
  for (const [k, v] of requests) {
    if (now - v.firstRequest > v.windowMs) requests.delete(k);
  }
}

/**
 * Limitation en mémoire du processus, fenêtre glissante ancrée sur la première
 * requête. Ne vaut que pour l'instance courante.
 *
 * @param {string} ip
 * @param {{bucket?: string, max?: number, windowMs?: number}} [options]
 * @returns {{allowed: boolean, remaining: number}}
 */
export function checkRateLimitMemoire(ip, options = {}) {
  const {
    bucket = 'default',
    max = MAX_REQUESTS,
    windowMs = WINDOW_MS,
  } = options;

  const now = Date.now();
  purger(now);

  const key = `${bucket}|${ip}`;
  const record = requests.get(key);

  if (!record || now - record.firstRequest > windowMs) {
    requests.set(key, { count: 1, firstRequest: now, windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  record.count++;
  if (record.count > max) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: max - record.count };
}

// ─── Compteur persistant ──────────────────────────────────────

/**
 * Début de la fenêtre contenant `horodatage`, aligné sur l'époque.
 * Deux instances qui traitent deux requêtes simultanées calculent la même
 * valeur : c'est la condition pour que l'UPSERT porte sur la même ligne.
 *
 * @param {number} horodatage  Millisecondes depuis l'époque.
 * @param {number} windowMs    Durée de la fenêtre.
 * @returns {Date}
 */
export function debutDeFenetre(horodatage, windowMs) {
  return new Date(Math.floor(horodatage / windowMs) * windowMs);
}

/**
 * Import paresseux du client Prisma : ce module est importé par des tests
 * unitaires qui tournent sans `DATABASE_URL`, et le constructeur de
 * `PrismaClient` échoue si la variable manque. L'import au premier appel réel
 * évite de faire dépendre le chargement du module d'une base configurée.
 */
async function clientPrisma() {
  const { prisma } = await import('./prisma');
  return prisma;
}

/**
 * Vérifie et consomme un jeton de quota.
 *
 * Signature devenue **asynchrone** : un aller-retour SQL ne peut pas se faire
 * de façon synchrone. Tous les appelants ont été adaptés (`await`).
 *
 * @param {string} ip        Adresse du client (ou tout identifiant stable).
 * @param {object} [options]
 * @param {string} [options.bucket]   Usage concerné (défaut : 'default').
 * @param {number} [options.max]      Requêtes autorisées par fenêtre.
 * @param {number} [options.windowMs] Durée de la fenêtre en millisecondes.
 * @returns {Promise<{allowed: boolean, remaining: number}>}
 */
export async function checkRateLimit(ip, options = {}) {
  const {
    bucket = 'default',
    max = MAX_REQUESTS,
    windowMs = WINDOW_MS,
  } = options;

  // Sans base configurée (tests unitaires, scripts hors ligne), on ne prétend
  // pas limiter à l'échelle du parc : on retombe sur le compteur mémoire.
  if (!process.env.DATABASE_URL) {
    return checkRateLimitMemoire(ip, { bucket, max, windowMs });
  }

  const cle = `${bucket}|${ip}`;
  const maintenant = Date.now();
  const debut = debutDeFenetre(maintenant, windowMs);
  const fin = new Date(debut.getTime() + windowMs);

  try {
    const prisma = await clientPrisma();

    // Incrément atomique : l'INSERT et l'UPDATE sont une seule instruction, et
    // le RETURNING rend la valeur d'après incrément. Deux requêtes simultanées
    // (même instance ou instances différentes) obtiennent donc deux compteurs
    // distincts — impossible qu'elles passent toutes les deux sous la limite.
    // Un `upsert` Prisma ne conviendrait pas : son `update` ne sait pas lire la
    // valeur courante côté base, il faudrait un `increment` sans retour lisible
    // dans la même instruction.
    //
    // Horodatages passés en chaîne ISO puis castés en `timestamp` : un
    // paramètre Date de `$queryRaw` part en `timestamptz` et serait reconverti
    // selon le fuseau de la session, alors que Prisma stocke de l'UTC nu dans
    // les colonnes DateTime. Le cast explicite garantit que la clé de conflit
    // écrite ici et la comparaison faite par `purgerCompteursExpires` (via
    // l'ORM) parlent bien de la même valeur.
    const lignes = await prisma.$queryRaw`
      INSERT INTO "RateLimitCounter" ("key", "windowStart", "count", "expiresAt", "updatedAt")
      VALUES (
        ${cle},
        ${debut.toISOString()}::timestamp,
        1,
        ${fin.toISOString()}::timestamp,
        ${new Date(maintenant).toISOString()}::timestamp
      )
      ON CONFLICT ("key", "windowStart")
      DO UPDATE SET
        "count" = "RateLimitCounter"."count" + 1,
        "updatedAt" = ${new Date(maintenant).toISOString()}::timestamp
      RETURNING "count"
    `;

    const compteur = Number(lignes?.[0]?.count ?? 1);
    if (compteur > max) return { allowed: false, remaining: 0 };
    return { allowed: true, remaining: max - compteur };
  } catch (erreur) {
    // Choix explicite : en cas d'indisponibilité de la base, on LAISSE PASSER
    // (repli sur le compteur mémoire de l'instance) plutôt que de bloquer.
    //
    // Justification : les routes protégées ici sont les formulaires publics qui
    // portent le chiffre d'affaires (demande de financement, devis, newsletter,
    // recherche SIRET). Bloquer sur incident de base transformerait une panne
    // de base en refus généralisé — le limiteur deviendrait un amplificateur de
    // panne. Par ailleurs ces routes écrivent presque toutes en base juste
    // après : si la base est vraiment tombée, elles échoueront de toute façon,
    // proprement, quelques lignes plus loin. Le repli mémoire conserve un
    // plancher de protection par instance, soit exactement le niveau de
    // sécurité d'avant cette correction.
    //
    // Le compromis inverse (fail-closed) serait défendable pour une route
    // d'authentification ; aucune n'utilise ce module — les mots de passe
    // vivent chez Auth0.
    console.error('[RATE-LIMIT] Base injoignable, repli en mémoire :', erreur?.message || erreur);
    return checkRateLimitMemoire(ip, { bucket, max, windowMs });
  }
}

/**
 * Supprime les fenêtres expirées. Appelée par le cron `sla-check` (toutes les
 * 2 heures) et non à chaque requête : purger dans le chemin critique ajouterait
 * un DELETE à chaque appel de formulaire pour un gain nul.
 *
 * @param {Date} [maintenant]
 * @returns {Promise<number>} Nombre de lignes supprimées.
 */
export async function purgerCompteursExpires(maintenant = new Date()) {
  const prisma = await clientPrisma();
  const { count } = await prisma.rateLimitCounter.deleteMany({
    where: { expiresAt: { lt: maintenant } },
  });
  return count;
}
