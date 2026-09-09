'use client';

// Étape 5 — récapitulatif avant envoi, avec retour possible vers chaque étape.
// Extraite telle quelle de DemandeWizardClient.jsx (ex-StepSummary).

export default function EtapeRecapitulatif({ form, goToStep, t }) {
  const isRcPro = form.productType === 'RC_PRO';

  const sections = [
    {
      step: 0,
      title: t('espace.wizard.steps.type'),
      icon: 'fa-solid fa-tag',
      items: [
        { label: t('espace.wizard.productTypeLabel'), value: t(`productType.${form.productType}`) },
      ],
    },
    {
      step: 1,
      title: t('espace.wizard.steps.project'),
      icon: 'fa-solid fa-clipboard-list',
      items: isRcPro
        ? [
            { label: t('espace.wizard.sectorActivity'), value: form.sector_rcpro },
            { label: t('espace.wizard.turnover'), value: `${Number(form.ca).toLocaleString('fr-FR')} €` },
            { label: t('espace.wizard.employees'), value: form.employees },
          ]
        : [
            { label: t('espace.wizard.equipmentType'), value: form.equipmentType },
            { label: t('espace.wizard.amount'), value: `${Number(form.amount).toLocaleString('fr-FR')} €` },
            { label: t('espace.wizard.duration'), value: `${form.duration} ${t('espace.wizard.months')}` },
          ],
    },
    {
      step: 2,
      title: t('espace.wizard.steps.company'),
      icon: 'fa-solid fa-building',
      items: [
        { label: t('espace.wizard.companyName'), value: form.companyName },
        { label: t('espace.wizard.siren'), value: form.siren },
        { label: t('espace.wizard.legalForm'), value: form.legalForm },
        { label: t('espace.wizard.sector'), value: form.sector },
      ],
    },
    {
      step: 3,
      title: t('espace.wizard.steps.contact'),
      icon: 'fa-solid fa-user',
      items: [
        { label: t('espace.wizard.fullName'), value: form.name },
        { label: t('espace.wizard.email'), value: form.email },
        { label: t('espace.wizard.phone'), value: form.phone },
      ],
    },
  ];

  if (form.description) {
    sections[1].items.push({
      label: t('espace.wizard.description'),
      value: form.description,
    });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-primary mb-2">
        {t('espace.wizard.summaryTitle')}
      </h2>
      <p className="text-slate-500 mb-6">{t('espace.wizard.summarySubtitle')}</p>

      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.step}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <i className={`${section.icon} text-secondary text-sm`} />
                </div>
                <h3 className="font-semibold text-primary text-sm">{section.title}</h3>
              </div>
              <button
                onClick={() => goToStep(section.step)}
                className="text-xs font-medium text-secondary hover:text-secondary/80 flex items-center gap-1 transition-colors"
              >
                <i className="fa-solid fa-pen text-[10px]" />
                {t('espace.wizard.edit')}
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              {section.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className="text-sm font-medium text-primary text-right max-w-[60%]">
                    {item.value || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Message de confirmation */}
      <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
        <i className="fa-solid fa-circle-info text-emerald-600 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-emerald-800">
            {t('espace.wizard.confirmTitle')}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            {t('espace.wizard.confirmDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
