'use client';

import { useState } from 'react';
import Link from 'next/link';
import BrandGrid from './fields/BrandGrid';
import MonthYear from './fields/MonthYear';
import PostalCity from './fields/PostalCity';
import ChoiceCards from './fields/ChoiceCards';
import TextInput from './fields/TextInput';

/**
 * Wizard de devis multi-étapes inspiré du tunnel Allianz.
 *
 * Props :
 *  - title          : titre du devis ("Votre devis auto", etc.)
 *  - product        : identifiant produit ('auto', 'moto', etc.)
 *  - steps          : Array<StepConfig>
 *  - initial        : valeurs initiales
 *  - onSubmit       : (values) => Promise<void> — appelé à la fin
 *  - icon           : icône Font Awesome du produit
 *
 * StepConfig :
 *  { id, title, subtitle?, field, type, options?, validate?, helper? }
 *  type : 'brand-grid' | 'month-year' | 'postal-city' | 'choice-cards' | 'text' | 'number' | 'email' | 'tel' | 'summary'
 */
export default function QuoteWizard({ title, product, icon = 'fa-shield-halved', steps, initial = {}, onSubmit }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [values, setValues] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const step = steps[stepIdx];
  const totalSteps = steps.length;
  const progress = ((stepIdx + 1) / totalSteps) * 100;
  const isLast = stepIdx === totalSteps - 1;

  const setValue = (key, v) => setValues((prev) => ({ ...prev, [key]: v }));

  const handleNext = async () => {
    if (step.validate && !step.validate(values)) return;
    if (isLast) {
      setSubmitting(true);
      setError(null);
      try {
        await onSubmit({ ...values, product });
        setDone(true);
      } catch (err) {
        setError(err?.message || 'Erreur — réessayez plus tard.');
      } finally {
        setSubmitting(false);
      }
    } else {
      setStepIdx((i) => i + 1);
    }
  };

  const handleBack = () => stepIdx > 0 && setStepIdx((i) => i - 1);

  if (done) return <DoneScreen title={title} values={values} product={product} />;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center text-white shadow-md">
              <i className="fa-solid fa-shield-halved text-sm"></i>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-black text-primary">Finarent</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest">{title}</div>
            </div>
            <div className="sm:hidden text-xs font-bold text-primary">{title}</div>
          </Link>
          <Link href="/contact" className="flex items-center gap-2 text-secondary hover:text-accent font-semibold text-sm">
            <i className="fa-solid fa-phone"></i>
            <span className="hidden sm:inline">Nous contacter</span>
          </Link>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-secondary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-2xl">
        {/* Retour */}
        {stepIdx > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-secondary hover:text-accent font-semibold text-sm mb-6"
          >
            <i className="fa-solid fa-chevron-left text-xs"></i>
            Retour
          </button>
        )}

        {/* Step indicator */}
        <div className="text-center mb-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400">
            Étape {stepIdx + 1} sur {totalSteps}
          </span>
        </div>

        {/* Step title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-2 leading-tight">{step.title}</h1>
        {step.subtitle && <p className="text-center text-gray-500 text-sm mb-8">{step.subtitle}</p>}
        {!step.subtitle && <div className="mb-8"></div>}

        {/* Field */}
        <StepField step={step} values={values} setValue={setValue} setValues={setValues} />

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-sm text-red-700">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>{error}
          </div>
        )}

        {/* Continue */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleNext}
            disabled={(step.validate && !step.validate(values)) || submitting}
            className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white font-bold px-12 py-4 rounded-full text-base shadow-lg transition-all hover:scale-105 disabled:bg-gray-300 disabled:hover:scale-100 disabled:cursor-not-allowed min-w-[240px]"
          >
            {submitting ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Envoi…</>
            ) : isLast ? (
              <>Envoyer ma demande <i className="fa-solid fa-paper-plane"></i></>
            ) : (
              <>Continuer <i className="fa-solid fa-arrow-right"></i></>
            )}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 mt-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-gray-400">
            <Link href="/legal" className="hover:text-primary">Mentions légales</Link>
            <Link href="/privacy" className="hover:text-primary">Confidentialité</Link>
            <Link href="/terms" className="hover:text-primary">CGV</Link>
            <span>© Finarent {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Rend le champ correspondant au type du step. */
function StepField({ step, values, setValue, setValues }) {
  const v = values[step.field];

  switch (step.type) {
    case 'brand-grid':
      return (
        <BrandGrid
          brands={step.options}
          value={v}
          onChange={(val) => setValue(step.field, val)}
        />
      );
    case 'month-year':
      return (
        <MonthYear
          value={v}
          onChange={(val) => setValue(step.field, val)}
          helper={step.helper}
          placeholder={step.placeholder}
        />
      );
    case 'postal-city':
      return (
        <PostalCity
          postal={values.postal}
          city={values.city}
          onChange={({ postal, city }) => setValues((prev) => ({ ...prev, postal, city }))}
        />
      );
    case 'choice-cards':
      return (
        <ChoiceCards
          options={step.options}
          value={v}
          onChange={(val) => setValue(step.field, val)}
          columns={step.columns}
        />
      );
    case 'text':
    case 'email':
    case 'tel':
    case 'number':
      return (
        <TextInput
          type={step.type}
          value={v}
          onChange={(val) => setValue(step.field, val)}
          placeholder={step.placeholder}
          suffix={step.suffix}
          prefix={step.prefix}
          helper={step.helper}
        />
      );
    case 'fields':
      // Plusieurs champs sur une même étape
      return (
        <div className="space-y-5">
          {step.fields.map((f) => (
            <TextInput
              key={f.field}
              type={f.type}
              label={f.label}
              value={values[f.field]}
              onChange={(val) => setValue(f.field, val)}
              placeholder={f.placeholder}
              suffix={f.suffix}
              prefix={f.prefix}
              helper={f.helper}
            />
          ))}
        </div>
      );
    case 'summary':
      return (
        <div className="bg-sky-50 border-2 border-sky-100 rounded-3xl p-6 sm:p-8">
          {step.render ? step.render(values) : (
            <pre className="text-xs text-gray-600">{JSON.stringify(values, null, 2)}</pre>
          )}
        </div>
      );
    default:
      return <div className="text-red-500">Type d'étape inconnu : {step.type}</div>;
  }
}

function DoneScreen({ title, values, product }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-emerald-600 flex items-center justify-center text-white mx-auto mb-6 shadow-xl">
          <i className="fa-solid fa-check text-3xl"></i>
        </div>
        <h1 className="text-3xl font-black text-primary mb-3">Demande envoyée !</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Un conseiller Finarent vous contactera sous 48 h pour vous proposer le meilleur devis personnalisé pour votre {title.toLowerCase().replace('votre devis ', '')}.
        </p>
        <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-5 mb-8 text-left">
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-2">Récapitulatif</div>
          <ul className="space-y-1 text-sm text-emerald-800">
            {Object.entries(values).filter(([k, v]) => v && !['postal','city'].includes(k)).slice(0, 5).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span className="text-emerald-700">{labelForKey(k)}</span>
                <strong>{String(v)}</strong>
              </li>
            ))}
            {(values.postal || values.city) && (
              <li className="flex justify-between">
                <span className="text-emerald-700">Lieu</span>
                <strong>{values.postal} {values.city}</strong>
              </li>
            )}
          </ul>
        </div>
        <Link href="/" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white font-bold px-8 py-3.5 rounded-full">
          <i className="fa-solid fa-house"></i> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

function labelForKey(k) {
  const map = {
    brand: 'Marque', model: 'Modèle', dateMec: 'Mise en circulation',
    fuel: 'Énergie', usage: 'Usage', licenseYear: 'Permis',
    bonus: 'Bonus-malus', claims: 'Sinistres 3 ans', formula: 'Formule',
    firstName: 'Prénom', lastName: 'Nom', email: 'Email', phone: 'Téléphone',
    age: 'Âge', familySize: 'Foyer', housing: 'Logement',
    surface: 'Surface', rooms: 'Pièces', value: 'Valeur',
    activity: 'Activité', revenue: 'Chiffre d\'affaires', employees: 'Salariés',
    motoCategory: 'Type', motoPower: 'Cylindrée',
  };
  return map[k] || k;
}
