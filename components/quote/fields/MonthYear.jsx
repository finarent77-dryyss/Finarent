'use client';

/** Champ MM/AAAA (date de mise en circulation, date d'effet, etc.) */
export default function MonthYear({ value, onChange, placeholder = 'MM/AAAA', helper }) {
  const handleChange = (v) => {
    // Auto-format: ajoute "/" après 2 chiffres
    const cleaned = v.replace(/[^\d]/g, '').slice(0, 6);
    if (cleaned.length <= 2) {
      onChange(cleaned);
    } else {
      onChange(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        maxLength={7}
        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-secondary focus:outline-none text-lg text-center font-mono tabular-nums placeholder:text-gray-300"
      />
      {helper && (
        <div className="flex items-start gap-2 text-xs text-gray-500 px-1">
          <i className="fa-solid fa-circle-info text-gray-400 mt-0.5 shrink-0"></i>
          <span dangerouslySetInnerHTML={{ __html: helper }} />
        </div>
      )}
    </div>
  );
}
