'use client';

import { formatEUR } from '@/lib/simulators/calculations/pret';

/**
 * Liste de charges mensuelles avec ajout / suppression.
 * Compteur total visible. Pattern repéré dans la maquette partenaire.
 *
 * @param {{label:string, amount:number}[]} charges
 * @param {(charges)=>void} onChange
 */
export default function ChargesList({ charges, onChange }) {
  const total = charges.reduce((s, c) => s + (Number(c.amount) || 0), 0);

  const update = (i, patch) => {
    const next = charges.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const remove = (i) => onChange(charges.filter((_, idx) => idx !== i));

  const add = () => onChange([...charges, { label: '', amount: 0 }]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-700">Charges mensuelles existantes</div>
          <div className="text-xs text-gray-400">Crédits en cours, pensions alimentaires…</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Total</div>
          <div className="text-lg font-black text-primary">{formatEUR(total)}</div>
        </div>
      </div>

      <div className="space-y-2">
        {charges.length === 0 && (
          <div className="text-sm text-gray-400 italic px-3 py-3 bg-gray-50 rounded-lg text-center">
            Aucune charge. Cliquez "+ Ajouter une charge" si vous avez des crédits en cours.
          </div>
        )}
        {charges.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Crédit auto, etc."
              value={c.label}
              onChange={(e) => update(i, { label: e.target.value })}
              className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-secondary focus:outline-none"
            />
            <div className="relative w-32">
              <input
                type="number"
                value={c.amount}
                onChange={(e) => update(i, { amount: Number(e.target.value) })}
                min={0}
                step={10}
                className="w-full pl-3 pr-7 py-2 border-2 border-gray-200 rounded-lg text-sm text-right focus:border-secondary focus:outline-none"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">€</span>
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="w-9 h-9 rounded-lg border-2 border-rose-100 text-rose-500 hover:bg-rose-50 transition flex items-center justify-center"
              aria-label="Supprimer"
            >
              <i className="fa-solid fa-trash text-xs"></i>
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:border-secondary hover:text-secondary transition flex items-center justify-center gap-2"
      >
        <i className="fa-solid fa-plus text-xs"></i>
        <span>Ajouter une charge</span>
      </button>
    </div>
  );
}
