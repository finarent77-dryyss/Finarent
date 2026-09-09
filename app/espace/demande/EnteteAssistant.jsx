'use client';

// En-tête de l'assistant : retour au tableau de bord, titre, bandeau de
// préremplissage simulateur et bandeau de brouillon restauré.
// Extrait tel quel de DemandeWizardClient.jsx.

import Link from 'next/link';

export default function EnteteAssistant({ prefill, showDraftHint, onRetour, onEffacerBrouillon, t }) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
        <button
          onClick={onRetour}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors mb-4"
        >
          <i className="fa-solid fa-arrow-left" />
          {t('espace.wizard.backToDashboard')}
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          {t('espace.wizard.title')}
        </h1>
        <p className="text-slate-500 mt-1">{t('espace.wizard.subtitle')}</p>

        {prefill?.fromSimulatorLabel && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <i className="fa-solid fa-wand-magic-sparkles" />
              Prérempli depuis votre simulation : {prefill.fromSimulatorLabel}
            </span>
            {prefill.fromSimulatorCategory && prefill.fromSimulatorSlug && (
              <Link
                href={`/simulateurs/${prefill.fromSimulatorCategory}/${prefill.fromSimulatorSlug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:text-primary hover:border-secondary text-xs font-semibold transition-colors"
              >
                <i className="fa-solid fa-pen-to-square" />
                Modifier ma simulation
              </Link>
            )}
          </div>
        )}

        {!prefill && showDraftHint && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <i className="fa-solid fa-floppy-disk" />
              Brouillon restauré depuis votre dernière visite
            </span>
            <button
              type="button"
              onClick={onEffacerBrouillon}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-300 text-xs font-semibold transition-colors"
            >
              <i className="fa-solid fa-trash" />
              Recommencer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
