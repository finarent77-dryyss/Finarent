'use client';

import { Suspense, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { buildPrefillFromParams } from '@/lib/simulators/prefill';

// ─── CONSTANTS ──────────────────────────────────────────

const STEPS = ['type', 'project', 'company', 'contact', 'summary'];

const PRODUCT_TYPES = [
  { key: 'PRET_PRO', icon: 'fa-solid fa-building-columns' },
  { key: 'CREDIT_BAIL', icon: 'fa-solid fa-file-contract' },
  { key: 'LOA', icon: 'fa-solid fa-car-side' },
  { key: 'LLD', icon: 'fa-solid fa-truck-moving' },
  { key: 'LEASING_OPS', icon: 'fa-solid fa-gear' },
  { key: 'RC_PRO', icon: 'fa-solid fa-shield-halved' },
];

const DURATIONS = [12, 24, 36, 48, 60, 72, 84];

const LEGAL_FORMS = [
  'SAS', 'SARL', 'EURL', 'SA', 'SCI', 'EI', 'SASU', 'SNC', 'Auto-entrepreneur',
];

const SECTORS = [
  'BTP & Construction',
  'Médical & Santé',
  'Informatique & Tech',
  'Transport & Logistique',
  'Industrie',
  'Services',
  'Commerce',
  'Autre',
];

// ─── SLIDE VARIANTS ─────────────────────────────────────

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

// ─── MAIN COMPONENT ─────────────────────────────────────

export default function DemandeWizardClient(props) {
  return (
    <Suspense fallback={null}>
      <DemandeWizardInner {...props} />
    </Suspense>
  );
}

function DemandeWizardInner({ user, dbUser }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  // Préremplissage depuis un simulateur (calculé une seule fois)
  const prefill = useMemo(() => buildPrefillFromParams(searchParams), [searchParams]);
  const isRcPrefill = prefill?.productType === 'RC_PRO';

  const [step, setStep] = useState(prefill?.productType ? 1 : 0);
  const [direction, setDirection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    // Step 1 - Type
    productType: prefill?.productType || '',
    // Step 2 - Project (financing)
    equipmentType: prefill?.equipmentType || '',
    amount: prefill && !isRcPrefill ? prefill.amount : '',
    duration: prefill && !isRcPrefill && prefill.duration ? prefill.duration : '36',
    description: prefill?.description || '',
    // Step 2 - Project (RC_PRO)
    sector_rcpro: prefill?.sector_rcpro || '',
    ca: isRcPrefill ? prefill.ca : '',
    employees: isRcPrefill ? prefill.employees : '',
    // Step 3 - Company
    companyName: dbUser.company || '',
    siren: '',
    legalForm: dbUser.legalForm || '',
    sector: '',
    // Step 4 - Contact
    name: dbUser.name || user.name || '',
    email: dbUser.email || user.email || '',
    phone: dbUser.phone || '',
    terms: false,
  });

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // ─── VALIDATION ──────────────────────────────────────

  const validateStep = useCallback((stepIndex) => {
    const errs = {};
    if (stepIndex === 0) {
      if (!form.productType) errs.productType = t('espace.wizard.errors.required');
    }
    if (stepIndex === 1) {
      if (form.productType === 'RC_PRO') {
        if (!form.sector_rcpro) errs.sector_rcpro = t('espace.wizard.errors.required');
        if (!form.ca || isNaN(Number(form.ca)) || Number(form.ca) <= 0) errs.ca = t('espace.wizard.errors.invalidAmount');
        if (!form.employees || isNaN(Number(form.employees)) || Number(form.employees) <= 0) errs.employees = t('espace.wizard.errors.required');
      } else {
        if (!form.equipmentType.trim()) errs.equipmentType = t('espace.wizard.errors.required');
        if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) errs.amount = t('espace.wizard.errors.invalidAmount');
      }
    }
    if (stepIndex === 2) {
      if (!form.companyName.trim()) errs.companyName = t('espace.wizard.errors.required');
      {
        const sirenDigits = form.siren.replace(/\D/g, '');
        if (sirenDigits.length !== 9 && sirenDigits.length !== 14) {
          errs.siren = t('espace.wizard.errors.invalidSiren');
        }
      }
      if (!form.legalForm) errs.legalForm = t('espace.wizard.errors.required');
      if (!form.sector) errs.sector = t('espace.wizard.errors.required');
    }
    if (stepIndex === 3) {
      if (!form.name.trim()) errs.name = t('espace.wizard.errors.required');
      if (!form.phone.trim()) errs.phone = t('espace.wizard.errors.required');
      if (!form.terms) errs.terms = t('espace.wizard.errors.termsRequired');
    }
    return errs;
  }, [form, t]);

  const goNext = useCallback(() => {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }, [step, validateStep]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const goToStep = useCallback((target) => {
    // Only allow going back to completed steps
    if (target < step) {
      setDirection(-1);
      setStep(target);
    }
  }, [step]);

  // ─── SUBMIT ──────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const isRcPro = form.productType === 'RC_PRO';
      const body = {
        productType: form.productType,
        companyName: form.companyName.trim(),
        siren: form.siren.replace(/\D/g, ''),
        legalForm: form.legalForm,
        sector: isRcPro ? form.sector_rcpro : form.sector,
        description: isRcPro
          ? `CA: ${form.ca}€ | Effectif: ${form.employees} | ${form.description}`.trim()
          : form.description.trim() || null,
        amount: isRcPro ? Number(form.ca) : Number(form.amount),
        duration: isRcPro ? null : Number(form.duration),
        equipmentType: isRcPro ? null : form.equipmentType.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
      };

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur serveur');
      }

      router.push('/espace');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── STEP LABELS ─────────────────────────────────────

  const stepLabels = [
    t('espace.wizard.steps.type'),
    t('espace.wizard.steps.project'),
    t('espace.wizard.steps.company'),
    t('espace.wizard.steps.contact'),
    t('espace.wizard.steps.summary'),
  ];

  // ─── RENDER ──────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
          <button
            onClick={() => router.push('/espace')}
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
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <i className="fa-solid fa-wand-magic-sparkles" />
              Prérempli depuis votre simulation : {prefill.fromSimulatorLabel}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((_, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => goToStep(i)}
                  disabled={i > step}
                  className={`
                    flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-all duration-300 shrink-0
                    ${i < step
                      ? 'bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600'
                      : i === step
                        ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }
                  `}
                >
                  {i < step ? <i className="fa-solid fa-check text-xs" /> : i + 1}
                </button>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-1 mx-2 rounded-full bg-slate-200 overflow-hidden">
                    <motion.div
                      className={i < step ? 'h-full bg-emerald-500' : 'h-full bg-secondary'}
                      initial={{ width: 0 }}
                      animate={{ width: i < step ? '100%' : '0%' }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="hidden sm:flex justify-between mt-2">
            {stepLabels.map((label, i) => (
              <span
                key={i}
                className={`text-xs font-medium ${i <= step ? 'text-primary' : 'text-slate-400'} ${i < STEPS.length - 1 ? 'flex-1' : ''} text-center first:text-left last:text-right`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {step === 0 && <StepType form={form} update={update} errors={errors} t={t} />}
            {step === 1 && <StepProject form={form} update={update} errors={errors} t={t} />}
            {step === 2 && <StepCompany form={form} update={update} errors={errors} t={t} />}
            {step === 3 && <StepContact form={form} update={update} errors={errors} t={t} />}
            {step === 4 && (
              <StepSummary form={form} goToStep={(s) => { setDirection(-1); setStep(s); }} t={t} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error message */}
        {errors.submit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-circle-exclamation" />
            {errors.submit}
          </motion.div>
        )}

        {/* Navigation Buttons */}
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
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
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
      </div>
    </div>
  );
}

// ─── STEP 1: TYPE ───────────────────────────────────────

function StepType({ form, update, errors, t }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-primary mb-2">
        {t('espace.wizard.typeTitle')}
      </h2>
      <p className="text-slate-500 mb-6">{t('espace.wizard.typeSubtitle')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRODUCT_TYPES.map(({ key, icon }) => {
          const selected = form.productType === key;
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => update('productType', key)}
              className={`
                relative p-6 rounded-2xl border-2 text-left transition-all duration-200
                ${selected
                  ? 'border-secondary bg-secondary/5 shadow-lg shadow-secondary/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }
              `}
            >
              {selected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-check text-white text-xs" />
                </div>
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${selected ? 'bg-secondary/10 text-secondary' : 'bg-slate-100 text-slate-500'}`}>
                <i className={`${icon} text-xl`} />
              </div>
              <h3 className="font-semibold text-primary text-sm">
                {t(`productType.${key}`)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {t(`espace.wizard.typeDesc.${key}`)}
              </p>
            </motion.button>
          );
        })}
      </div>

      {errors.productType && (
        <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
          <i className="fa-solid fa-circle-exclamation text-xs" />
          {errors.productType}
        </p>
      )}
    </div>
  );
}

// ─── STEP 2: PROJECT ────────────────────────────────────

function StepProject({ form, update, errors, t }) {
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
            <FieldSelect
              label={t('espace.wizard.sectorActivity')}
              value={form.sector_rcpro}
              onChange={(v) => update('sector_rcpro', v)}
              options={SECTORS}
              placeholder={t('espace.wizard.selectSector')}
              error={errors.sector_rcpro}
            />
            <FieldInput
              label={t('espace.wizard.turnover')}
              type="number"
              value={form.ca}
              onChange={(v) => update('ca', v)}
              placeholder="150000"
              suffix="€"
              error={errors.ca}
            />
            <FieldInput
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
            <FieldInput
              label={t('espace.wizard.equipmentType')}
              value={form.equipmentType}
              onChange={(v) => update('equipmentType', v)}
              placeholder={t('espace.wizard.equipmentPlaceholder')}
              error={errors.equipmentType}
            />
            <FieldInput
              label={t('espace.wizard.amount')}
              type="number"
              value={form.amount}
              onChange={(v) => update('amount', v)}
              placeholder="50000"
              suffix="€"
              error={errors.amount}
            />
            <FieldSelect
              label={t('espace.wizard.duration')}
              value={form.duration}
              onChange={(v) => update('duration', v)}
              options={DURATIONS.map((d) => ({ value: String(d), label: `${d} ${t('espace.wizard.months')}` }))}
              error={errors.duration}
            />
          </>
        )}
        <FieldTextarea
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

// ─── STEP 3: COMPANY ────────────────────────────────────

function StepCompany({ form, update, errors, t }) {
  const [sirenLoading, setSirenLoading] = useState(false);
  const [sirenFound, setSirenFound] = useState(null);
  const [sirenError, setSirenError] = useState(null);
  const lastLookupRef = useRef('');

  const handleSirenBlur = useCallback(async () => {
    const digits = form.siren.replace(/\D/g, '');
    // Accept 9 (SIREN) or 14 (SIRET). If 9, pad with "00001" (siège social par défaut)
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

      // Auto-fill company name
      if (data.raisonSociale) {
        update('companyName', data.raisonSociale);
      }

      // Auto-fill legalForm if matches one of our predefined options
      if (data.formeJuridique) {
        const upper = data.formeJuridique.toUpperCase();
        const matchedForm = LEGAL_FORMS.find((lf) => upper.includes(lf.toUpperCase()));
        if (matchedForm) {
          update('legalForm', matchedForm);
        }
      }

      setSirenFound(data.raisonSociale || 'Entreprise trouvée');
    } catch (err) {
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
        <FieldInput
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
                // Reset indicators when user types again
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
          <FieldSelect
            label={t('espace.wizard.legalForm')}
            value={form.legalForm}
            onChange={(v) => update('legalForm', v)}
            options={LEGAL_FORMS}
            placeholder={t('espace.wizard.selectLegalForm')}
            error={errors.legalForm}
          />
          <FieldSelect
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

// ─── STEP 4: CONTACT ────────────────────────────────────

function StepContact({ form, update, errors, t }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-primary mb-2">
        {t('espace.wizard.contactTitle')}
      </h2>
      <p className="text-slate-500 mb-6">{t('espace.wizard.contactSubtitle')}</p>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <FieldInput
          label={t('espace.wizard.fullName')}
          value={form.name}
          onChange={(v) => update('name', v)}
          placeholder={t('espace.wizard.fullNamePlaceholder')}
          error={errors.name}
        />
        <FieldInput
          label={t('espace.wizard.email')}
          value={form.email}
          readOnly
          icon="fa-solid fa-lock"
          hint={t('espace.wizard.emailReadOnly')}
        />
        <FieldInput
          label={t('espace.wizard.phone')}
          type="tel"
          value={form.phone}
          onChange={(v) => update('phone', v)}
          placeholder="06 12 34 56 78"
          error={errors.phone}
        />

        {/* Terms */}
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

// ─── STEP 5: SUMMARY ───────────────────────────────────

function StepSummary({ form, goToStep, t }) {
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

      {/* Confirmation message */}
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

// ─── REUSABLE FORM FIELDS ──────────────────────────────

function FieldInput({ label, type = 'text', value, onChange, placeholder, error, suffix, readOnly, icon, hint, optional }) {
  return (
    <div>
      <label className="block text-sm font-medium text-primary mb-1.5">
        {label}
        {optional && <span className="text-slate-400 font-normal ml-1">(optionnel)</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={readOnly ? undefined : (e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none
            ${readOnly
              ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
              : error
                ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-200 bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20'
            }
            ${suffix ? 'pr-10' : ''}
            ${icon ? 'pr-10' : ''}
          `}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
            {suffix}
          </span>
        )}
        {icon && (
          <i className={`${icon} absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400`} />
        )}
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <i className="fa-solid fa-circle-exclamation text-[10px]" />
          {error}
        </p>
      )}
    </div>
  );
}

function FieldSelect({ label, value, onChange, options, placeholder, error, optional }) {
  const isObjectOptions = options.length > 0 && typeof options[0] === 'object';

  return (
    <div>
      <label className="block text-sm font-medium text-primary mb-1.5">
        {label}
        {optional && <span className="text-slate-400 font-normal ml-1">(optionnel)</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none appearance-none bg-white
          ${error
            ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20'
          }
        `}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {isObjectOptions
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))
          : options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))
        }
      </select>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <i className="fa-solid fa-circle-exclamation text-[10px]" />
          {error}
        </p>
      )}
    </div>
  );
}

function FieldTextarea({ label, value, onChange, placeholder, error, optional }) {
  return (
    <div>
      <label className="block text-sm font-medium text-primary mb-1.5">
        {label}
        {optional && <span className="text-slate-400 font-normal ml-1">(optionnel)</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={`
          w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none resize-none
          ${error
            ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-slate-200 bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20'
          }
        `}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <i className="fa-solid fa-circle-exclamation text-[10px]" />
          {error}
        </p>
      )}
    </div>
  );
}
