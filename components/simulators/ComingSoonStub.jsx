'use client';

import ConversionCTA from './ConversionCTA';

/**
 * Affiché pour tout simulateur non encore implémenté.
 * Préserve la promesse fonctionnelle, capture le lead vers le formulaire contact.
 */
export default function ComingSoonStub({ simulator }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 sm:p-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          <i className="fa-solid fa-hammer"></i>
          <span>Bientôt disponible</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3">{simulator?.name}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
          {simulator?.desc} Ce simulateur est en cours de finalisation.
          En attendant, nos conseillers réalisent gratuitement cette étude pour vous.
        </p>
        <ConversionCTA simulatorName={simulator?.slug} variant="inline" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: 'fa-clock', label: 'Réponse 48h', val: 'Garantie' },
          { icon: 'fa-shield-check', label: 'Sans engagement', val: 'Toujours' },
          { icon: 'fa-euro-sign', label: 'Frais d\'étude', val: '0 €' },
        ].map((b, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <i className={`fa-solid ${b.icon} text-emerald-600`}></i>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-400 font-bold">{b.label}</div>
              <div className="text-sm font-bold text-primary">{b.val}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
