'use client';

// Boutons de navigation de l'assistant : précédent, suivant et envoi final.
// Extraits tels quels de DemandeWizardClient.jsx.

import { STEPS } from './constantes';
import { LoadingIcon } from '@/components/animations/FinarentAnimation';

export default function NavigationAssistant({ step, submitting, goPrev, goNext, onSubmit, t }) {
  return (
    <div className="flex justify-between mt-8">
      <button
        onClick={goPrev}
        disabled={step === 0}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
          ${step === 0
            ? 'opacity-0 pointer-events-none'
            : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }
        `}
      >
        <i className="fa-solid fa-arrow-left text-sm" />
        {t('espace.wizard.prev')}
      </button>

      {step < STEPS.length - 1 ? (
        <button
          onClick={goNext}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium bg-secondary text-white hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/25"
        >
          {t('espace.wizard.next')}
          <i className="fa-solid fa-arrow-right text-sm" />
        </button>
      ) : (
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <LoadingIcon size={18} />
              {t('espace.wizard.submitting')}
            </>
          ) : (
            <>
              <i className="fa-solid fa-paper-plane" />
              {t('espace.wizard.submit')}
            </>
          )}
        </button>
      )}
    </div>
  );
}
