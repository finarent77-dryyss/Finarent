'use client';

// Étape 2 — description du projet : montant et durée pour un financement,
// chiffre d'affaires et effectif pour la RC Pro.
// Extraite telle quelle de DemandeWizardClient.jsx (ex-StepProject).

import ChampTexte from '../champs/ChampTexte';
import ChampSelection from '../champs/ChampSelection';
import ChampZoneTexte from '../champs/ChampZoneTexte';
import { DURATIONS, SECTORS } from '../constantes';

export default function EtapeProjet({ form, update, errors, t }) {
  const isRcPro = form.productType === 'RC_PRO';

  return (
    <div>
      <h2 className="text-xl font-bold text-primary mb-2">
        {t('espace.wizard.projectTitle')}
      </h2>
      <p className="text-slate-500 mb-6">{t('espace.wizard.projectSubtitle')}</p>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        {isRcPro ? (
          <>
            <ChampSelection
              label={t('espace.wizard.sectorActivity')}
              value={form.sector_rcpro}
              onChange={(v) => update('sector_rcpro', v)}
              options={SECTORS}
              placeholder={t('espace.wizard.selectSector')}
              error={errors.sector_rcpro}
            />
            <ChampTexte
              label={t('espace.wizard.turnover')}
              type="number"
              value={form.ca}
              onChange={(v) => update('ca', v)}
              placeholder="150000"
              suffix="€"
              error={errors.ca}
            />
            <ChampTexte
              label={t('espace.wizard.employees')}
              type="number"
              value={form.employees}
              onChange={(v) => update('employees', v)}
              placeholder="10"
              error={errors.employees}
            />
          </>
        ) : (
          <>
            <ChampTexte
              label={t('espace.wizard.equipmentType')}
              value={form.equipmentType}
              onChange={(v) => update('equipmentType', v)}
              placeholder={t('espace.wizard.equipmentPlaceholder')}
              error={errors.equipmentType}
            />
            <ChampTexte
              label={t('espace.wizard.amount')}
              type="number"
              value={form.amount}
              onChange={(v) => update('amount', v)}
              placeholder="50000"
              suffix="€"
              error={errors.amount}
            />
            <ChampSelection
              label={t('espace.wizard.duration')}
              value={form.duration}
              onChange={(v) => update('duration', v)}
              options={DURATIONS.map((d) => ({ value: String(d), label: `${d} ${t('espace.wizard.months')}` }))}
              error={errors.duration}
            />
          </>
        )}
        <ChampZoneTexte
          label={t('espace.wizard.description')}
          value={form.description}
          onChange={(v) => update('description', v)}
          placeholder={t('espace.wizard.descriptionPlaceholder')}
          optional
        />
      </div>
    </div>
  );
}
