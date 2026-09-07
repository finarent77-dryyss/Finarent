/**
 * Limitation de débit en mémoire (par instance).
 * En multi-instance, basculer sur Redis ou Upstash.
 *
 * Les compteurs sont cloisonnés par « seau » : deux usages différents ne se
 * volent plus mutuellement leur quota. Avant cette version, un unique compteur
 * par IP était partagé par toutes les routes — déposer une demande de devis
 * consommait donc le quota de la demande de financement.
 */
const requests = new Map();

const WINDOW_MS = 60 * 60 * 1000; // 1 heure
const MAX_REQUESTS = 5;

/** Nettoyage périodique : sans cela la Map grossit indéfiniment. */
function purger(now) {
  if (requests.size < 5000) return;
  for (const [k, v] of requests) {
    if (now - v.firstRequest > v.windowMs) requests.delete(k);
  }
}

/**
 * @param {string} ip        Adresse du client.
 * @param {object} [options]
 * @param {string} [options.bucket]   Usage concerné (défaut : 'default').
 * @param {number} [options.max]      Requêtes autorisées par fenêtre.
 * @param {number} [options.windowMs] Durée de la fenêtre en millisecondes.
 * @returns {{allowed: boolean, remaining: number}}
 */
export function checkRateLimit(ip, options = {}) {
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
