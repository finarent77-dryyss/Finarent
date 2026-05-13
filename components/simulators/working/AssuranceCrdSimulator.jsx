'use client';

import { useState, useMemo } from 'react';
import { amortizationSchedule, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function AssuranceCrdSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [creditRate, setCreditRate] = useState(3.5);
  const [insuranceRate, setInsuranceRate] = useState(0.20);

  const data = useMemo(() => {
    const schedule = amortizationSchedule(amount, months, creditRate);
    const yearly = [];
    const years = Math.ceil(months / 12);
    for (let y = 1; y <= years; y++) {
      const slice = schedule.filter((r) => r.month > (y - 1) * 12 && r.month <= y * 12);
      if (slice.length === 0) break;
      const avgCrd = slice.reduce((s, r) => s + r.remaining, 0) / slice.length;
      const premium = Math.round((avgCrd * insuranceRate) / 100);
      yearly.push({ year: y, avgCrd: Math.round(avgCrd), premium });
    }
    const total = yearly.reduce((s, r) => s + r.premium, 0);
    return { yearly, total };
  }, [amount, months, creditRate, insuranceRate]);

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Assurance sur capital restant dû : la prime diminue chaque année avec le remboursement du capital. Mode utilisé par la plupart des délégations d'assurance (économies importantes en fin de prêt).
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Capital initial" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée" value={months} onChange={setMonths} min={60} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Taux du crédit" value={creditRate} onChange={setCreditRate} suffix="%" step={0.05} min={0.5} max={10} />
          <NumberInput label="Taux assurance" value={insuranceRate} onChange={setInsuranceRate} suffix="%" step={0.01} min={0.05} max={1.5} />
        </div>
      </div>

      <ResultCard label="Coût total de l'assurance sur CRD" value={formatEUR(data.total)} sub={`Sur ${Math.round(months / 12)} ans, prime décroissante`} accent="emerald-600" large />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Évolution annuelle</div>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="text-left py-2">Année</th>
                <th className="text-right py-2">CRD moyen</th>
                <th className="text-right py-2">Prime annuelle</th>
                <th className="text-right py-2">Prime / mois</th>
              </tr>
            </thead>
            <tbody>
              {data.yearly.map((r) => (
                <tr key={r.year} className="border-b border-gray-50">
                  <td className="py-2 font-semibold text-amber-600">An {r.year}</td>
                  <td className="text-right text-gray-500">{formatEUR(r.avgCrd)}</td>
                  <td className="text-right font-bold text-emerald-600">{formatEUR(r.premium)}</td>
                  <td className="text-right text-gray-500">{formatEUR(Math.round(r.premium / 12))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConversionCTA simulatorName="assurance-crd" params={{ amount, months, rate: insuranceRate, total: data.total }} />
    </div>
  );
}
