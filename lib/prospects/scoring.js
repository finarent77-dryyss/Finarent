// Score d'engagement d'un prospect (0-100) calculé serveur.
// Permet de trier les leads "chauds" en haut de la liste admin.
//
// Pondérations :
//   - Email fourni             : +25
//   - Téléphone fourni         : +20
//   - Nom + société            : +10
//   - 1er événement            : +5
//   - +5 par event jusqu'à 4 events (max +20)
//   - Simulateur premium (auth): +15
//   - Montant ≥ 100k€          : +10
//   - Activité < 24h           : +5

const PREMIUM_SLUGS = new Set([
  'capacite-emprunt', 'amortissement', 'remboursement-anticipe', 'modulation-echeances',
  'differe', 'regroupement-credits', 'pret-relais', 'plus-value',
  'leasing-pro', 'pret-professionnel', 'capacite-financement-pro',
  'analyse-revenus-charges', 'scoring-bancaire',
]);

/** Montant simulé, quel que soit son habillage d'origine.
 *
 *  Les simulateurs transmettent le montant tantôt en nombre, tantôt en chaîne
 *  brute de la query string, tantôt déjà mis en forme (« 150 000 », « 150 000 € »).
 *  `Number()` seul rendait NaN sur ces deux dernières formes : le bonus
 *  « montant ≥ 100 k€ » se perdait en silence sur les prospects les plus gros.
 *  @param {unknown} valeur
 *  @returns {number} montant en euros, 0 si illisible
 */
function lireMontant(valeur) {
  if (typeof valeur === 'number') return Number.isFinite(valeur) ? valeur : 0;
  if (typeof valeur !== 'string') return 0;
  const nettoye = valeur
    .replace(/\s/g, '') // espaces, y compris insécables (U+00A0, U+202F)
    .replace(/[€$£]/g, '')
    .replace(/−/g, '-') // signe moins typographique
    .replace(',', '.'); // virgule décimale française
  if (!nettoye) return 0;
  const n = Number(nettoye);
  return Number.isFinite(n) ? n : 0;
}

export function computeEngagementScore({ prospect, events }) {
  let s = 0;
  if (prospect?.email) s += 25;
  if (prospect?.phone) s += 20;
  if (prospect?.name) s += 5;
  if (prospect?.company) s += 5;

  const evCount = Array.isArray(events) ? events.length : 0;
  if (evCount >= 1) s += 5;
  s += Math.min(Math.max(evCount - 1, 0), 4) * 5;

  if (events?.some((e) => PREMIUM_SLUGS.has(e.simulatorSlug))) s += 15;

  const bigAmount = events?.some((e) => {
    const p = e.params || {};
    const amount = lireMontant(p.amount || p.montant || p.maxAmount || 0);
    return amount >= 100000;
  });
  if (bigAmount) s += 10;

  if (prospect?.lastSeenAt) {
    const hoursSince = (Date.now() - new Date(prospect.lastSeenAt).getTime()) / 36e5;
    if (hoursSince < 24) s += 5;
  }

  return Math.max(0, Math.min(100, s));
}

export function scoreLabel(score) {
  if (score >= 75) return { label: 'Chaud', color: 'rose', emoji: '🔥' };
  if (score >= 50) return { label: 'Tiède', color: 'amber', emoji: '☀️' };
  if (score >= 25) return { label: 'Engagé', color: 'sky', emoji: '👀' };
  return { label: 'Froid', color: 'gray', emoji: '❄️' };
}
