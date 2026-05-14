'use client';

/** Champ texte / number / email / tel générique. */
export default function TextInput({ value, onChange, label, type = 'text', placeholder, suffix, prefix, helper, inputMode }) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-gray-700">{label}</label>}
      <div className="relative">
        {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">{prefix}</span>}
        <input
          type={type === 'number' ? 'text' : type}
          inputMode={inputMode || (type === 'number' ? 'numeric' : type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'text')}
          value={value ?? ''}
          onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value.replace(/[^\d.]/g, ''))) : e.target.value)}
          placeholder={placeholder}
          className={`w-full ${prefix ? 'pl-10' : 'pl-5'} ${suffix ? 'pr-14' : 'pr-5'} py-4 border-2 border-gray-200 rounded-2xl focus:border-secondary focus:outline-none text-base placeholder:text-gray-300`}
        />
        {suffix && <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{suffix}</span>}
      </div>
      {helper && <div className="text-xs text-gray-500 px-1">{helper}</div>}
    </div>
  );
}
