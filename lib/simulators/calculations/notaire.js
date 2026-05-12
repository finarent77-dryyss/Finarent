// Calcul des frais d'acquisition immobilière (frais de notaire).
// Barème 2024 simplifié. À affiner selon département pour usage légal réel.

/**
 * Barème par tranche pour les émoluments du notaire (décret 2016-230).
 * Tranches sur le prix du bien.
 */
const EMOLUMENTS_BRACKETS = [
  { up: 6500,    rate: 3.870 / 100 },
  { up: 17000,   rate: 1.596 / 100 },
  { up: 60000,   rate: 1.064 / 100 },
  { up: Infinity,rate: 0.799 / 100 },
];

function emoluments(price) {
  let remaining = price;
  let acc = 0;
  let prev = 0;
  for (const b of EMOLUMENTS_BRACKETS) {
    const cap = Math.min(remaining, b.up - prev);
    if (cap <= 0) break;
    acc += cap * b.rate;
    remaining -= cap;
    prev = b.up;
    if (remaining <= 0) break;
  }
  return acc;
}

/** Frais de notaire complets.
 *  @param {{price:number, type:'ancien'|'neuf'}} args
 *  @returns {{ total, mutationRights, notaryFees, csiAndDisbursements, rate, breakdown }}
 */
export function notaryFees({ price, type = 'ancien' }) {
  if (!price || price <= 0) {
    return { total: 0, mutationRights: 0, notaryFees: 0, csiAndDisbursements: 0, rate: 0, breakdown: [] };
  }

  // Droits de mutation
  // Ancien : ~5,80665 % (DMTO départemental + frais)
  // Neuf : ~0,71498 % (TVA déjà payée, seule la taxe de publicité foncière s'applique)
  const dmtoRate = type === 'neuf' ? 0.71498 / 100 : 5.80665 / 100;
  const mutationRights = Math.round(price * dmtoRate);

  // Émoluments du notaire (HT, simplifié sans TVA pour démo)
  const emolHt = emoluments(price);
  const notary = Math.round(emolHt * 1.2); // TVA 20 %

  // CSI (contribution de sécurité immobilière) : 0,10 % + débours forfaitaires ~1 200 €
  const csi = Math.round(price * 0.001) + 1200;

  const total = mutationRights + notary + csi;
  const ratePct = (total / price) * 100;

  return {
    total,
    mutationRights,
    notaryFees: notary,
    csiAndDisbursements: csi,
    rate: ratePct,
    breakdown: [
      { label: 'Droits de mutation',  value: mutationRights, color: 'rose-500',    sub: `Taxe publicité foncière — bien ${type} ${(dmtoRate * 100).toFixed(5)} %` },
      { label: 'Émoluments notaire',  value: notary,         color: 'amber-500',   sub: 'Barème officiel TTC (décret 2016)' },
      { label: 'CSI + débours',       value: csi,            color: 'blue-500',    sub: 'Contribution de sécurité immobilière + frais annexes' },
    ],
  };
}
