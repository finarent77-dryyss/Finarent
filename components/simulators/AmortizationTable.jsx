'use client';

import { useState, useMemo } from 'react';
import { amortizationSchedule, formatEUR } from '@/lib/simulators/calculations/pret';

/**
 * Tableau d'amortissement avec onglets par année.
 * Reproduit le pattern repéré dans la maquette partenaire.
 *
 * @param {number} amount        capital
 * @param {number} months        durée en mois
 * @param {number} rate          taux nominal annuel %
 * @param {number} insuranceRate taux assurance annuel %
 */
export default function AmortizationTable({ amount, months, rate, insuranceRate = 0 }) {
  const [view, setView] = useState('annual'); // 'annual' | year number
  const [open, setOpen] = useState(true);

  const schedule = useMemo(() => amortizationSchedule(amount, months, rate), [amount, months, rate]);
  const years = Math.ceil(months / 12);
  const monthlyInsurance = (amount * (insuranceRate / 100)) / 12;

  // Agrégation par année
  const annual = useMemo(() => {
    const out = [];
    for (let y = 1; y <= years; y++) {
      const slice = schedule.filter((r) => r.month > (y - 1) * 12 && r.month <= y * 12);
      if (slice.length === 0) break;
      const interest = slice.reduce((s, r) => s + r.interest, 0);
      const principal = slice.reduce((s, r) => s + r.principal, 0);
      const insurance = Math.round(monthlyInsurance * slice.length);
      const total = interest + principal + insurance;
      const remaining = slice[slice.length - 1].remaining;
      out.push({ year: y, interest, principal, insurance, total, remaining });
    }
    return out;
  }, [schedule, years, monthlyInsurance]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <i className="fa-solid fa-table-list text-blue-600 text-sm"></i>
          </div>
          <span className="font-bold text-primary">Tableau d'amortissement</span>
        </div>
        <i className={`fa-solid fa-chevron-down text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}></i>
      </button>

      {open && (
        <div className="px-6 pb-6">
          {/* Onglets */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              type="button"
              onClick={() => setView('annual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${view === 'annual'
                ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              Par année
            </button>
            {annual.map((r) => (
              <button
                key={r.year}
                type="button"
                onClick={() => setView(r.year)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${view === r.year
                  ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                An {r.year}
              </button>
            ))}
          </div>

          {view === 'annual' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
                    <th className="text-left py-3 font-bold">Année</th>
                    <th className="text-right py-3 font-bold">Intérêts</th>
                    <th className="text-right py-3 font-bold">Capital</th>
                    {insuranceRate > 0 && <th className="text-right py-3 font-bold">Assurance</th>}
                    <th className="text-right py-3 font-bold">Total</th>
                    <th className="text-right py-3 font-bold">CRD fin</th>
                  </tr>
                </thead>
                <tbody>
                  {annual.map((r) => (
                    <tr key={r.year} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 font-semibold text-amber-600">Année {r.year}</td>
                      <td className="text-right text-rose-600">{formatEUR(r.interest)}</td>
                      <td className="text-right text-blue-600">{formatEUR(r.principal)}</td>
                      {insuranceRate > 0 && <td className="text-right text-emerald-600">{formatEUR(r.insurance)}</td>}
                      <td className="text-right font-bold text-primary">{formatEUR(r.total)}</td>
                      <td className="text-right text-gray-500">{formatEUR(r.remaining)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
                    <th className="text-left py-3 font-bold">Mois</th>
                    <th className="text-right py-3 font-bold">Intérêts</th>
                    <th className="text-right py-3 font-bold">Capital</th>
                    {insuranceRate > 0 && <th className="text-right py-3 font-bold">Assurance</th>}
                    <th className="text-right py-3 font-bold">Total</th>
                    <th className="text-right py-3 font-bold">CRD</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule
                    .filter((r) => r.month > (view - 1) * 12 && r.month <= view * 12)
                    .map((r) => (
                      <tr key={r.month} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-2 font-semibold text-gray-600">M{r.month}</td>
                        <td className="text-right text-rose-600">{formatEUR(r.interest)}</td>
                        <td className="text-right text-blue-600">{formatEUR(r.principal)}</td>
                        {insuranceRate > 0 && <td className="text-right text-emerald-600">{formatEUR(Math.round(monthlyInsurance))}</td>}
                        <td className="text-right font-bold text-primary">{formatEUR(r.payment + Math.round(monthlyInsurance))}</td>
                        <td className="text-right text-gray-500">{formatEUR(r.remaining)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
