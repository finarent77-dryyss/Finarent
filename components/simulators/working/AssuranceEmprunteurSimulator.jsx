'use client';

import { useState, useMemo } from 'react';
import { totalPremiumOnInitialCapital, totalPremiumOnCrd } from '@/lib/simulators/calculations/assurance';
import { amortizationSchedule, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

const QUOTITY_OPTIONS = [50, 75, 100];

export default function AssuranceEmprunteurSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [creditRate, setCreditRate] = useState(4);
  const [base, setBase] = useState('capital'); // 'capital' | 'crd'
  const [rate1, setRate1] = useState(0.30);
  const [q1, setQ1] = useState(100);
  const [hasCoBorrower, setHasCoBorrower] = useState(false);
  const [rate2, setRate2] = useState(0.30);
  const [q2, setQ2] = useState(100);

  // Coût premier emprunteur
  const total1 = useMemo(() => {
    const baseAmount = amount * (q1 / 100);
    return base === 'capital'
      ? totalPremiumOnInitialCapital(baseAmount, rate1, months)
      : totalPremiumOnCrd(baseAmount, rate1, months);
  }, [amount, q1, base, rate1, months]);

  // Coût second emprunteur
  const total2 = useMemo(() => {
    if (!hasCoBorrower) return 0;
    const baseAmount = amount * (q2 / 100);
    return base === 'capital'
      ? totalPremiumOnInitialCapital(baseAmount, rate2, months)
      : totalPremiumOnCrd(baseAmount, rate2, months);
  }, [hasCoBorrower, amount, q2, base, rate2, months]);

  const totalAssurance = total1 + total2;
  const monthlyInitial = useMemo(() => {
    // Prime mois 1 : (amount × q1 + amount × q2 si co) × rate / 100 / 12
    const base1 = (amount * q1 / 100) * (rate1 / 100) / 12;
    const base2 = hasCoBorrower ? (amount * q2 / 100) * (rate2 / 100) / 12 : 0;
    return Math.round(base1 + base2);
  }, [amount, q1, rate1, hasCoBorrower, q2, rate2]);

  // Évolution annuelle (capital initial = constant, CRD = décroissant)
  const yearlyEvolution = useMemo(() => {
    const years = Math.ceil(months / 12);
    const out = [];
    if (base === 'capital') {
      const yearly1 = Math.round((amount * q1 / 100) * (rate1 / 100));
      const yearly2 = hasCoBorrower ? Math.round((amount * q2 / 100) * (rate2 / 100)) : 0;
      let remaining = amount;
      const schedule = amortizationSchedule(amount, months, creditRate);
      for (let y = 1; y <= Math.min(years, 8); y++) {
        const yearStart = remaining;
        const slice = schedule.filter((r) => r.month > (y - 1) * 12 && r.month <= y * 12);
        if (slice.length === 0) break;
        remaining = slice[slice.length - 1].remaining;
        out.push({ year: y, crdStart: yearStart, p1: yearly1, p2: yearly2, total: yearly1 + yearly2 });
      }
    } else {
      // CRD : prime dépend du capital restant dû
      const schedule = amortizationSchedule(amount, months, creditRate);
      let remaining = amount;
      for (let y = 1; y <= Math.min(years, 8); y++) {
        const yearStart = remaining;
        const slice = schedule.filter((r) => r.month > (y - 1) * 12 && r.month <= y * 12);
        if (slice.length === 0) break;
        const avgCrd = (yearStart + slice[slice.length - 1].remaining) / 2;
        remaining = slice[slice.length - 1].remaining;
        const p1 = Math.round((avgCrd * q1 / 100) * (rate1 / 100));
        const p2 = hasCoBorrower ? Math.round((avgCrd * q2 / 100) * (rate2 / 100)) : 0;
        out.push({ year: y, crdStart: yearStart, p1, p2, total: p1 + p2 });
      }
    }
    return out;
  }, [base, amount, months, creditRate, q1, rate1, hasCoBorrower, q2, rate2]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Capital emprunté" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée du prêt" value={months} onChange={setMonths} min={12} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <NumberInput label="Taux du crédit (pour calcul CRD)" value={creditRate} onChange={setCreditRate} suffix="%" step={0.05} min={0.5} max={10} />
      </div>

      {/* Base de calcul */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Base de calcul de la prime</label>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { id: 'capital', label: 'Capital initial', sub: 'Prime fixe — bancaire groupe' },
              { id: 'crd',     label: 'Capital restant dû', sub: 'Prime décroissante — délégation' },
            ].map((opt) => {
              const active = base === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBase(opt.id)}
                  className={`text-left rounded-2xl border-2 p-4 transition ${active ? 'border-secondary bg-secondary/5 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{opt.label}</span>
                    {active && <i className="fa-solid fa-check text-secondary"></i>}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{opt.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Emprunteur 1 */}
        <div className="space-y-4">
          <NumberInput label="Taux assurance annuel — Emprunteur 1" value={rate1} onChange={setRate1} suffix="%" step={0.01} min={0.05} max={1.5} />
          <div className="text-xs text-gray-400 -mt-1">Bancaire ~0,30 % · Délégation ~0,10–0,25 %</div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quotité assurée — Emprunteur 1</label>
            <div className="grid grid-cols-3 gap-2">
              {QUOTITY_OPTIONS.map((q) => {
                const active = q1 === q;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQ1(q)}
                    className={`py-3 rounded-xl border-2 font-bold transition ${active ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    {q} %
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-gray-400 mt-2">Part du capital couverte en cas de décès / invalidité totale</div>
          </div>
        </div>

        {/* Co-emprunteur toggle */}
        <div className="border-t border-gray-100 pt-5">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-bold text-primary">Co-emprunteur</div>
              <div className="text-xs text-gray-500">Ajouter un second emprunteur avec sa propre quotité</div>
            </div>
            <button
              type="button"
              onClick={() => setHasCoBorrower(!hasCoBorrower)}
              role="switch"
              aria-checked={hasCoBorrower}
              aria-label="Activer co-emprunteur"
              className={`relative inline-flex w-11 h-6 rounded-full transition ${hasCoBorrower ? 'bg-secondary' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${hasCoBorrower ? 'left-5' : 'left-0.5'}`} />
            </button>
          </label>

          {hasCoBorrower && (
            <div className="mt-4 space-y-4 border-l-2 border-secondary/30 pl-4">
              <NumberInput label="Taux assurance — Emprunteur 2" value={rate2} onChange={setRate2} suffix="%" step={0.01} min={0.05} max={1.5} />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quotité — Emprunteur 2</label>
                <div className="grid grid-cols-3 gap-2">
                  {QUOTITY_OPTIONS.map((q) => {
                    const active = q2 === q;
                    return (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQ2(q)}
                        className={`py-3 rounded-xl border-2 font-bold transition ${active ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >
                        {q} %
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Résultat principal */}
      <div className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-100 rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <i className="fa-solid fa-shield-heart text-2xl"></i>
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-widest font-bold text-emerald-700 mb-1">Coût total assurance</div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600">{formatEUR(totalAssurance)}</div>
            <div className="text-sm text-emerald-700 mt-1">
              Sur {Math.round(months / 12)} ans · {base === 'capital' ? 'capital initial' : 'capital restant dû'}
              {hasCoBorrower && ' · 2 emprunteurs'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ResultCard label="Prime initiale / mois" value={formatEUR(monthlyInitial)} accent="primary" />
        <ResultCard label={`Emprunteur 1 (${q1}%)`} value={formatEUR(total1)} accent="emerald-600" />
        {hasCoBorrower
          ? <ResultCard label={`Emprunteur 2 (${q2}%)`} value={formatEUR(total2)} accent="emerald-600" />
          : <ResultCard label="Quotité totale couverte" value={`${q1} %`} accent="secondary" />
        }
      </div>

      {/* Évolution annuelle */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold text-primary">Évolution annuelle de la prime</div>
            <div className="text-xs text-gray-500">{base === 'capital' ? 'Prime constante (capital initial)' : 'Prime décroissante (CRD)'}</div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="text-left py-3">Année</th>
                <th className="text-right py-3">CRD début</th>
                <th className="text-right py-3">Emp. 1</th>
                {hasCoBorrower && <th className="text-right py-3">Emp. 2</th>}
                <th className="text-right py-3">Total année</th>
              </tr>
            </thead>
            <tbody>
              {yearlyEvolution.map((r) => (
                <tr key={r.year} className="border-b border-gray-50">
                  <td className="py-2.5 font-semibold text-gray-600">An {r.year}</td>
                  <td className="text-right text-gray-500">{formatEUR(r.crdStart)}</td>
                  <td className="text-right text-emerald-600 font-semibold">{formatEUR(r.p1)}</td>
                  {hasCoBorrower && <td className="text-right text-emerald-600 font-semibold">{formatEUR(r.p2)}</td>}
                  <td className="text-right text-primary font-bold">{formatEUR(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConversionCTA simulatorName="assurance-emprunteur" params={{ amount, months, base, rate1, q1, total: totalAssurance }} />
    </div>
  );
}
