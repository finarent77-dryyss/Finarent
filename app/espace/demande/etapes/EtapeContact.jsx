'use client';

// Étape 4 — coordonnées du demandeur et acceptation des CGU.
// Extraite telle quelle de DemandeWizardClient.jsx (ex-StepContact).

import ChampTexte from '../champs/ChampTexte';

export default function EtapeContact({ form, update, errors, t }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-primary mb-2">
        {t('espace.wizard.contactTitle')}
      </h2>
      <p className="text-slate-500 mb-6">{t('espace.wizard.contactSubtitle')}</p>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <ChampTexte
          label={t('espace.wizard.fullName')}
          value={form.name}
          onChange={(v) => update('name', v)}
          placeholder={t('espace.wizard.fullNamePlaceholder')}
          error={errors.name}
        />
        <ChampTexte
          label={t('espace.wizard.email')}
          value={form.email}
          readOnly
          icon="fa-solid fa-lock"
          hint={t('espace.wizard.emailReadOnly')}
        />
        <ChampTexte
          label={t('espace.wizard.phone')}
          type="tel"
          value={form.phone}
          onChange={(v) => update('phone', v)}
          placeholder="06 12 34 56 78"
          error={errors.phone}
        />

        {/* CGU */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => update('terms', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-5 h-5 rounded border-2 border-slate-300 peer-checked:border-secondary peer-checked:bg-secondary transition-all flex items-center justify-center">
                {form.terms && <i className="fa-solid fa-check text-white text-xs" />}
              </div>
            </div>
            <span className="text-sm text-slate-600 group-hover:text-slate-800 leading-relaxed">
              {t('espace.wizard.termsLabel')}{' '}
              <a href="/terms" target="_blank" className="text-secondary underline hover:text-secondary/80">
                {t('espace.wizard.termsLink')}
              </a>{' '}
              {t('espace.wizard.termsAnd')}{' '}
              <a href="/privacy" target="_blank" className="text-secondary underline hover:text-secondary/80">
                {t('espace.wizard.privacyLink')}
              </a>
            </span>
          </label>
          {errors.terms && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <i className="fa-solid fa-circle-exclamation text-xs" />
              {errors.terms}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
