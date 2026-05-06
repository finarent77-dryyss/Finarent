'use client';

import { useMemo } from 'react';

/**
 * Calcule le tableau d'amortissement d'un prêt à mensualités constantes.
 * Renvoie un point par mois (capital remboursé cumulé + intérêts cumulés).
 */
function buildSchedule(amount, monthsTotal, monthlyRate) {
  if (!amount || !monthsTotal || !monthlyRate) return [];
  const monthlyPayment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -monthsTotal));
  let balance = amount;
  let cumulInterest = 0;
  let cumulCapital = 0;
  const points = [{ month: 0, capital: 0, interest: 0, balance: amount }];
  for (let m = 1; m <= monthsTotal; m++) {
    const interest = balance * monthlyRate;
    const capital = monthlyPayment - interest;
    balance = Math.max(0, balance - capital);
    cumulInterest += interest;
    cumulCapital += capital;
    points.push({ month: m, capital: cumulCapital, interest: cumulInterest, balance });
  }
  return points;
}

export default function AmortizationChart({ amount, duration, interestRate, monthlyPayment, totalInterest }) {
  const monthlyRate = interestRate / 12 / 100;
  const data = useMemo(() => buildSchedule(amount, duration, monthlyRate), [amount, duration, monthlyRate]);

  if (data.length === 0) return null;

  const W = 600; // viewBox width
  const H = 240; // viewBox height
  const PAD_L = 50;
  const PAD_B = 30;
  const PAD_T = 10;
  const PAD_R = 10;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const maxY = amount;
  const xFor = (m) => PAD_L + (m / duration) * innerW;
  const yFor = (v) => PAD_T + innerH - (v / maxY) * innerH;

  // Surface "Capital remboursé" (cumulé)
  const capitalPath = `M ${xFor(0)} ${yFor(0)} ` +
    data.map((p) => `L ${xFor(p.month)} ${yFor(p.capital)}`).join(' ') +
    ` L ${xFor(duration)} ${yFor(0)} Z`;

  // Surface "Intérêts" empilée au-dessus du capital
  const interestPath = `M ${xFor(0)} ${yFor(0)} ` +
    data.map((p) => `L ${xFor(p.month)} ${yFor(p.capital + p.interest)}`).join(' ') +
    ' ' +
    [...data].reverse().map((p) => `L ${xFor(p.month)} ${yFor(p.capital)}`).join(' ') +
    ' Z';

  // Y-axis ticks (4 paliers)
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxY * (4 - i)) / 4));
  const xTicks = duration <= 24 ? [0, 6, 12, 18, 24].filter((m) => m <= duration) : duration <= 60 ? [0, 12, 24, 36, 48, 60].filter((m) => m <= duration) : [0, 12, 24, 36, 48, 60, 72, 84].filter((m) => m <= duration);

  const fmt = (n) => {
    if (n >= 1000) return `${Math.round(n / 1000)}k`;
    return Math.round(n).toString();
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-primary text-lg">Plan d'amortissement</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Répartition mensuelle entre capital remboursé et intérêts
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-secondary"></span>
            <span className="font-semibold text-gray-700">Capital</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-accent"></span>
            <span className="font-semibold text-gray-700">Intérêts</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Graphique d'amortissement">
          {/* Y-axis grid */}
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={PAD_L} x2={W - PAD_R} y1={yFor(v)} y2={yFor(v)} stroke="#E5E7EB" strokeWidth="1" />
              <text x={PAD_L - 8} y={yFor(v) + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{fmt(v)}€</text>
            </g>
          ))}
          {/* X-axis ticks */}
          {xTicks.map((m) => (
            <text key={m} x={xFor(m)} y={H - 10} textAnchor="middle" fontSize="10" fill="#9CA3AF">{m}m</text>
          ))}

          {/* Capital area */}
          <path d={capitalPath} fill="#0EA5A5" fillOpacity="0.85" />
          {/* Interest area on top */}
          <path d={interestPath} fill="#F59E0B" fillOpacity="0.85" />
        </svg>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Mensualité</div>
          <div className="text-lg font-black text-primary">{Math.round(monthlyPayment).toLocaleString('fr-FR')}€</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Capital emprunté</div>
          <div className="text-lg font-black text-secondary">{amount.toLocaleString('fr-FR')}€</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Intérêts totaux</div>
          <div className="text-lg font-black text-accent">{Math.round(totalInterest).toLocaleString('fr-FR')}€</div>
        </div>
      </div>

      <div className="mt-4 text-[11px] text-gray-400 italic text-center">
        TAEG indicatif {interestRate}% · Mensualités constantes · Calcul à titre informatif, taux personnalisé selon votre dossier.
      </div>
    </div>
  );
}
