'use client';

import { useState, useMemo } from 'react';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

/** Plus-value immobilière (résidence secondaire / locatif).
 *  Régime fiscal français 2024.
 */
export default function PlusValueSimulator() {
  const [salePrice, setSalePrice] = useState(450000);
  const [purchasePrice, setPurchasePrice] = useState(280000);
  const [purchaseFees, setPurchaseFees] = useState(22000);
  const [works, setWorks] = useState(35000);
  const [yearsHeld, setYearsHeld] = useState(12);
  const [residenceType, setResidenceType] = useState('secondaire');

  const grossGain = salePrice - (purchasePrice + purchaseFees + works);

  // Abattements pour durée de détention (2024)
  // IR : 6%/an de la 6e à 21e année, 4% la 22e année (exonération 22 ans)
  // PS : 1.65%/an de la 6e à 21e année, 1.6% la 22e année, 9%/an de la 23e à 30e (exonération 30 ans)
  let abattementIR = 0, abattementPS = 0;
  if (yearsHeld >= 6) {
    abattementIR = Math.min(100, (yearsHeld - 5) * 6 + (yearsHeld >= 22 ? 4 : 0));
    abattementPS = Math.min(100, (yearsHeld - 5) * 1.65);
    if (yearsHeld >= 22) abattementPS += 1.6;
    if (yearsHeld >= 23) abattementPS += (yearsHeld - 22) * 9;
    if (yearsHeld >= 30) abattementPS = 100;
  }

  const exempt = residenceType === 'principale' || grossGain <= 0;

  const taxableIR = exempt ? 0 : Math.max(0, grossGain * (1 - abattementIR / 100));
  const taxablePS = exempt ? 0 : Math.max(0, grossGain * (1 - abattementPS / 100));
  const irTax = Math.round(taxableIR * 0.19); // 19% IR
  const psTax = Math.round(taxablePS * 0.172); // 17.2% prélèvements sociaux

  // Surtaxe plus-value > 50k€
  let surtaxe = 0;
  if (taxableIR > 50000 && !exempt) {
    if (taxableIR <= 100000) surtaxe = Math.round(taxableIR * 0.02);
    else if (taxableIR <= 150000) surtaxe = Math.round(taxableIR * 0.03);
    else if (taxableIR <= 200000) surtaxe = Math.round(taxableIR * 0.04);
    else surtaxe = Math.round(taxableIR * 0.06);
  }

  const totalTax = irTax + psTax + surtaxe;
  const netGain = grossGain - totalTax;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Plus-value immobilière (résidence secondaire ou locatif). Résidence principale : exonération totale. Régime fiscal 2024 avec abattements pour durée de détention.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nature du bien</label>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setResidenceType('principale')} className={`py-3 rounded-xl border-2 font-bold text-sm transition ${residenceType === 'principale' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500'}`}>🏠 Résidence principale</button>
            <button type="button" onClick={() => setResidenceType('secondaire')} className={`py-3 rounded-xl border-2 font-bold text-sm transition ${residenceType === 'secondaire' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>🌴 Résidence secondaire</button>
            <button type="button" onClick={() => setResidenceType('locatif')} className={`py-3 rounded-xl border-2 font-bold text-sm transition ${residenceType === 'locatif' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>🏘 Investissement locatif</button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Prix de vente actuel" value={salePrice} onChange={setSalePrice} suffix="€" step={5000} min={0} />
          <NumberInput label="Prix d'achat initial" value={purchasePrice} onChange={setPurchasePrice} suffix="€" step={5000} min={0} />
          <NumberInput label="Frais d'acquisition (notaire, etc.)" value={purchaseFees} onChange={setPurchaseFees} suffix="€" step={1000} min={0} />
          <NumberInput label="Travaux justifiés" value={works} onChange={setWorks} suffix="€" step={1000} min={0} />
          <NumberInput label="Durée de détention" value={yearsHeld} onChange={setYearsHeld} suffix="ans" step={1} min={0} max={40} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Plus-value brute" value={formatEUR(grossGain)} sub="Prix vente − coût total" accent="secondary" large />
        <ResultCard label="Plus-value nette" value={formatEUR(netGain)} sub="Après impôts" accent={netGain > 0 ? 'emerald-600' : 'rose-600'} large />
      </div>

      {exempt ? (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5">
          <div className="text-xs uppercase tracking-widest font-bold text-emerald-700 mb-1">✓ Exonération totale</div>
          <div className="text-sm text-emerald-700">{residenceType === 'principale' ? 'Résidence principale exonérée d\'impôt sur la plus-value.' : 'Pas de plus-value imposable.'}</div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Décomposition fiscale</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Abattement IR ({abattementIR.toFixed(1)}%)</span><span className="font-bold">{formatEUR(Math.round(grossGain * abattementIR / 100))}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Impôt revenu (19%)</span><span className="font-bold text-rose-600">{formatEUR(irTax)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Prélèvements sociaux (17.2%)</span><span className="font-bold text-rose-600">{formatEUR(psTax)}</span></div>
            {surtaxe > 0 && <div className="flex justify-between"><span className="text-gray-500">Surtaxe plus-value &gt; 50k€</span><span className="font-bold text-rose-600">{formatEUR(surtaxe)}</span></div>}
            <div className="flex justify-between pt-2 border-t border-gray-100"><span className="font-bold text-primary">Total impôts</span><span className="text-lg font-black text-rose-600">{formatEUR(totalTax)}</span></div>
          </div>
        </div>
      )}

      <ConversionCTA simulatorName="plus-value" params={{ salePrice, purchasePrice, yearsHeld, netGain, totalTax }} />
    </div>
  );
}
