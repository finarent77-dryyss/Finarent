'use client';

// Étape 3 — identité de l'entreprise, avec recherche SIREN/SIRET et
// remplissage automatique de la raison sociale et de la forme juridique.
// Extraite telle quelle de DemandeWizardClient.jsx (ex-StepCompany).

import { useState, useCallback, useRef } from 'react';
import ChampTexte from '../champs/ChampTexte';
import ChampSelection from '../champs/ChampSelection';
import { LEGAL_FORMS, SECTORS } from '../constantes';

export default function EtapeEntreprise({ form, update, errors, t }) {
  const [sirenLoading, setSirenLoading] = useState(false);
  const [sirenFound, setSirenFound] = useState(null);
  const [sirenError, setSirenError] = useState(null);
  const lastLookupRef = useRef('');

  const handleSirenBlur = useCallback(async () => {
    const digits = form.siren.replace(/\D/g, '');
    // Accepte 9 chiffres (SIREN) ou 14 (SIRET). Si 9, on complète par « 00001 » (siège social par défaut)
    if (digits.length !== 9 && digits.length !== 14) {
      setSirenFound(null);
      setSirenError(null);
      return;
    }

    const siretToLookup = digits.length === 9 ? digits + '00001' : digits;
    if (lastLookupRef.current === siretToLookup) return;
    lastLookupRef.current = siretToLookup;

    setSirenLoading(true);
    setSirenError(null);
    setSirenFound(null);

    try {
      const res = await fetch(`/api/siret/${siretToLookup}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setSirenError(data.error || 'Entreprise introuvable');
        return;
      }

      // Remplissage automatique de la raison sociale
      if (data.raisonSociale) {
        update('companyName', data.raisonSociale);
      }

      // Remplissage automatique de la forme juridique si elle correspond à une option connue
      if (data.formeJuridique) {
        const upper = data.formeJuridique.toUpperCase();
        const matchedForm = LEGAL_FORMS.find((lf) => upper.includes(lf.toUpperCase()));
        if (matchedForm) {
          update('legalForm', matchedForm);
        }
      }

      setSirenFound(data.raisonSociale || 'Entreprise trouvée');
    } catch {
      // Panne réseau ou réponse illisible : même message pour l'utilisateur,
      // la cause exacte ne lui apprendrait rien d'exploitable.
      setSirenError('Erreur lors de la recherche');
    } finally {
      setSirenLoading(false);
    }
  }, [form.siren, update]);

  return (
    <div>
      <h2 className="text-xl font-bold text-primary mb-2">
        {t('espace.wizard.companyTitle')}
      </h2>
      <p className="text-slate-500 mb-6">{t('espace.wizard.companySubtitle')}</p>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <ChampTexte
          label={t('espace.wizard.companyName')}
          value={form.companyName}
          onChange={(v) => update('companyName', v)}
          placeholder={t('espace.wizard.companyNamePlaceholder')}
          error={errors.companyName}
        />
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">
            {t('espace.wizard.siren')}
            <span className="text-slate-400 font-normal ml-1">(SIREN 9 chiffres ou SIRET 14 chiffres)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={form.siren}
              onChange={(e) => {
                const v = e.target.value.replace(/[^\d\s]/g, '').slice(0, 17);
                update('siren', v);
                // Réinitialise les indicateurs dès que l'utilisateur saisit à nouveau
                setSirenFound(null);
                setSirenError(null);
              }}
              onBlur={handleSirenBlur}
              placeholder="123 456 789 00012"
              className={`
                w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none pr-10
                ${errors.siren
                  ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : sirenFound
                    ? 'border-accent bg-accent/5 focus:border-accent focus:ring-2 focus:ring-accent/20'
                    : 'border-slate-200 bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20'
                }
              `}
            />
            {sirenLoading && (
              <i className="fa-solid fa-spinner fa-spin absolute right-4 top-1/2 -translate-y-1/2 text-sm text-secondary" />
            )}
            {!sirenLoading && sirenFound && (
              <i className="fa-solid fa-circle-check absolute right-4 top-1/2 -translate-y-1/2 text-sm text-accent" />
            )}
          </div>
          {sirenLoading && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <i className="fa-solid fa-spinner fa-spin text-[10px]" />
              Recherche...
            </p>
          )}
          {!sirenLoading && sirenFound && (
            <p className="text-xs text-accent mt-1 flex items-center gap-1 font-medium">
              <i className="fa-solid fa-circle-check text-[10px]" />
              Entreprise trouvée : {sirenFound}
            </p>
          )}
          {!sirenLoading && sirenError && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <i className="fa-solid fa-circle-exclamation text-[10px]" />
              {sirenError}
            </p>
          )}
          {errors.siren && !sirenError && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <i className="fa-solid fa-circle-exclamation text-[10px]" />
              {errors.siren}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ChampSelection
            label={t('espace.wizard.legalForm')}
            value={form.legalForm}
            onChange={(v) => update('legalForm', v)}
            options={LEGAL_FORMS}
            placeholder={t('espace.wizard.selectLegalForm')}
            error={errors.legalForm}
          />
          <ChampSelection
            label={t('espace.wizard.sector')}
            value={form.sector}
            onChange={(v) => update('sector', v)}
            options={SECTORS}
            placeholder={t('espace.wizard.selectSector')}
            error={errors.sector}
          />
        </div>
      </div>
    </div>
  );
}
