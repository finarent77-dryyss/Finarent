/**
 * Extraction de l'adresse IP du client — défaut RUN-03 (revue statique : PUB-06).
 *
 * ## Le défaut corrigé
 *
 * Neuf fichiers portaient la même ligne, recopiée :
 *
 *     request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
 *
 * Elle retient l'entrée **la plus à gauche** de `X-Forwarded-For`. Or cet
 * en-tête est un journal de traversée : chaque mandataire *ajoute à droite*
 * l'adresse du pair dont il vient de recevoir la requête. L'entrée de gauche
 * est donc celle que l'appelant a écrite lui-même — jamais vérifiée par
 * personne. Constaté à l'exécution : dix requêtes portant
 * `X-Forwarded-For: 198.51.100.101…110` passent toutes, alors que la même IP
 * fixe était refusée dès la sixième. Le quota s'annule à volonté, et le
 * contournement vaut aussi en production, pas seulement en local.
 *
 * ## Le raisonnement
 *
 * Derrière un mandataire de confiance, la chaîne reçue ressemble à ceci :
 *
 *     X-Forwarded-For: <ce que le client a bien voulu écrire>, <IP vue par notre proxy>
 *                       └──────── non vérifiable ─────────┘   └─── posée par nous ───┘
 *
 * Seul le dernier maillon a été écrit par une machine que nous contrôlons :
 * notre proxy y inscrit l'adresse TCP réelle de son pair. C'est le seul
 * élément de l'en-tête sur lequel une décision de sécurité peut reposer.
 *
 * Avec N mandataires de confiance empilés, chacun ajoute une entrée : les N-1
 * dernières sont les adresses des proxys eux-mêmes, et l'adresse du client est
 * la **N-ième en partant de la droite**. D'où l'indexation `longueur - N`.
 *
 * ## Le réglage
 *
 * `NB_PROXYS_DE_CONFIANCE` fixe N.
 *
 *   - `1` (**défaut**) — un unique reverse-proxy devant l'application. C'est
 *     la topologie de Clever Cloud : le routeur de la plateforme termine la
 *     connexion du visiteur et relaie vers l'instance. L'entrée la plus à
 *     droite est donc l'adresse du visiteur.
 *   - `0` — aucun mandataire : l'en-tête est intégralement ignoré, puisque
 *     rien de ce qu'il contient n'a été posé par une machine de confiance.
 *     C'est le réglage juste pour un serveur exposé en direct.
 *   - `2`, `3`… — un CDN ou un équilibreur supplémentaire en amont. Chaque
 *     couche ajoutée décale l'index d'un cran vers la gauche.
 *
 * Surévaluer N est dangereux (on lit une entrée que le client contrôle) ;
 * sous-évaluer N est seulement imprécis (on lit l'IP d'un proxy, donc on
 * regroupe des visiteurs sous un même quota). En cas de doute, sous-évaluer.
 *
 * ## Pourquoi `x-real-ip` n'est plus consulté
 *
 * L'ancienne implémentation retombait sur `x-real-ip`. Cet en-tête ne porte
 * qu'une seule valeur, sans position : rien ne distingue une valeur écrite par
 * notre proxy d'une valeur écrite par le client. Un en-tête dont on ne peut
 * pas établir la provenance ne peut pas fonder un contrôle — le consulter
 * rouvrirait exactement la faille que ce module ferme.
 *
 * ## Quand rien n'est exploitable
 *
 * On rend la sentinelle `'inconnue'`, partagée par tous les appelants
 * non identifiables. Choix délibéré : ils consomment alors **un seul et même**
 * quota. L'inverse — rendre une valeur unique par requête — reviendrait à
 * offrir un quota neuf à chaque appel, c'est-à-dire à ne pas limiter du tout.
 * Contrepartie assumée : si le proxy cessait d'émettre l'en-tête en
 * production, tout le trafic partagerait un quota unique. C'est une panne
 * visible et réparable, là où l'autre choix est une faille silencieuse.
 */

/** Valeur rendue quand aucune adresse de confiance ne peut être établie. */
export const IP_INCONNUE = 'inconnue';

/** Topologie Clever Cloud : un unique reverse-proxy devant l'instance. */
export const NB_PROXYS_DE_CONFIANCE_PAR_DEFAUT = 1;

const RE_IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const RE_IPV4_AVEC_PORT = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d{1,5}$/;
const RE_IPV6_CROCHETS = /^\[([0-9A-Fa-f:.]+)\](?::\d{1,5})?$/;
const RE_IPV6 = /^[0-9A-Fa-f:]*:[0-9A-Fa-f:.]*$/;

/**
 * Nombre de mandataires de confiance devant l'application.
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {number} Entier >= 0.
 */
export function nombreProxysDeConfiance(env = process.env) {
  const brut = env?.NB_PROXYS_DE_CONFIANCE;
  if (brut === undefined || brut === null || String(brut).trim() === '') {
    return NB_PROXYS_DE_CONFIANCE_PAR_DEFAUT;
  }
  const n = Number.parseInt(String(brut).trim(), 10);
  // Valeur illisible ou négative : on retombe sur le défaut plutôt que sur 0.
  // Une coquille dans la configuration ne doit pas désarmer la limitation.
  if (!Number.isFinite(n) || n < 0) return NB_PROXYS_DE_CONFIANCE_PAR_DEFAUT;
  return n;
}

/**
 * Ramène une entrée de `X-Forwarded-For` à une adresse nue, ou `null`.
 *
 * Traite les formes que les mandataires produisent réellement : IPv4 avec port
 * (`203.0.113.7:52413`), IPv6 entre crochets (`[2001:db8::1]:443`), IPv6 nue.
 * Tout ce qui ne ressemble pas à une adresse est rejeté : un en-tête qui
 * contient autre chose qu'une IP n'a pas été écrit par un proxy sérieux.
 *
 * @param {string} entree
 * @returns {string | null}
 */
export function normaliserAdresse(entree) {
  const brut = String(entree ?? '').trim();
  if (!brut) return null;

  const crochets = RE_IPV6_CROCHETS.exec(brut);
  if (crochets) {
    const adresse = crochets[1];
    return RE_IPV6.test(adresse) || RE_IPV4.test(adresse) ? adresse.toLowerCase() : null;
  }

  const avecPort = RE_IPV4_AVEC_PORT.exec(brut);
  const candidat = avecPort ? avecPort[1] : brut;

  const v4 = RE_IPV4.exec(candidat);
  if (v4) {
    // Un octet > 255 n'est pas une adresse : `999.1.2.3` est du texte libre.
    return v4.slice(1).every((o) => Number(o) <= 255) ? candidat : null;
  }

  // IPv6 : contrôle volontairement souple. Il ne s'agit pas de valider la
  // syntaxe RFC 4291 mais d'écarter le texte arbitraire — la valeur ne sert
  // que de clé de comptage, jamais de cible d'une requête.
  if (candidat.includes(':') && RE_IPV6.test(candidat)) return candidat.toLowerCase();

  return null;
}

/**
 * Cœur de l'extraction, isolé des objets `Request` pour être testable.
 *
 * @param {string | null | undefined} entete   Valeur brute de `X-Forwarded-For`.
 * @param {number} nbProxys                    Mandataires de confiance (>= 0).
 * @returns {string} Adresse de confiance, ou `IP_INCONNUE`.
 */
export function extraireIpDeXff(entete, nbProxys) {
  if (nbProxys <= 0) return IP_INCONNUE;
  if (typeof entete !== 'string' || !entete.trim()) return IP_INCONNUE;

  const entrees = entete.split(',').map((e) => e.trim()).filter(Boolean);

  // Moins d'entrées que de mandataires annoncés : la chaîne n'est pas celle
  // qu'on attend. On ne devine pas — deviner reviendrait à lire une entrée
  // fournie par le client. Cas réel : configuration `NB_PROXYS_DE_CONFIANCE`
  // trop élevée, ou proxy retiré sans mise à jour de la variable.
  if (entrees.length < nbProxys) return IP_INCONNUE;

  return normaliserAdresse(entrees[entrees.length - nbProxys]) ?? IP_INCONNUE;
}

/**
 * Adresse IP du client, à n'extraire que par ce chemin.
 *
 * @param {Request | {headers: {get(nom: string): string | null}}} request
 * @param {{nbProxys?: number, env?: Record<string, string | undefined>}} [options]
 * @returns {string} Adresse de confiance, ou `'inconnue'`.
 */
export function ipClient(request, options = {}) {
  const nbProxys = options.nbProxys ?? nombreProxysDeConfiance(options.env);
  let entete = null;
  try {
    entete = request?.headers?.get('x-forwarded-for') ?? null;
  } catch {
    // Objet de requête inattendu : traité comme un en-tête absent.
    return IP_INCONNUE;
  }
  return extraireIpDeXff(entete, nbProxys);
}

/**
 * Variante rendant `null` plutôt que la sentinelle, pour les colonnes de base
 * de données qui stockent l'IP à titre de preuve (mandat SEPA, signature,
 * traçabilité RGPD). Y écrire `'inconnue'` ferait passer une absence
 * d'information pour une information.
 *
 * @param {Request | {headers: {get(nom: string): string | null}}} request
 * @param {{nbProxys?: number, env?: Record<string, string | undefined>}} [options]
 * @returns {string | null}
 */
export function ipClientOuNull(request, options = {}) {
  const ip = ipClient(request, options);
  return ip === IP_INCONNUE ? null : ip;
}
