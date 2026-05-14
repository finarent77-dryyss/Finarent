'use client';

/** Code postal + ville (fallback simple sans API SIRENE) */
export default function PostalCity({ postal, city, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Code postal</label>
        <input
          type="text"
          value={postal || ''}
          onChange={(e) => onChange({ postal: e.target.value.replace(/[^\d]/g, '').slice(0, 5), city })}
          placeholder="75001"
          inputMode="numeric"
          maxLength={5}
          className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-secondary focus:outline-none text-base font-mono tabular-nums placeholder:text-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
        <input
          type="text"
          value={city || ''}
          onChange={(e) => onChange({ postal, city: e.target.value })}
          placeholder="Paris"
          className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-secondary focus:outline-none text-base placeholder:text-gray-300"
        />
      </div>
    </div>
  );
}
