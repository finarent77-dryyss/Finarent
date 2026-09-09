'use client';

// Assistant de dépôt d'une demande (/espace/demande).
// Ce composant orchestre uniquement : étape courante, données accumulées,
// navigation, brouillon et envoi final. Le rendu de chaque étape vit dans
// « etapes/ », les champs partagés dans « champs/ », et la logique hors rendu
// dans constantes.js, validationEtapes.js, brouillonDemande.js et
// chargeUtileDemande.js.

import { Suspense, useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { buildPrefillFromParams } from '@/lib/simulators/prefill';
import { STEPS, slideVariants } from './constantes';
import { validerEtape, premiereEtapeInvalide, etapeMaximaleAutorisee } from './validationEtapes';
import { construireCorpsDemande } from './chargeUtileDemande';
import {
  lireBrouillon,
  enregistrerBrouillon,
  supprimerBrouillon,
  calculerEtapeInitiale,
  construireFormulaireInitial,
  construireFormulaireVierge,
} from './brouillonDemande';
import EnteteAssistant from './EnteteAssistant';
import BarreDeProgression from './BarreDeProgression';
import NavigationAssistant from './NavigationAssistant';
import EtapeTypeDeProduit from './etapes/EtapeTypeDeProduit';
import EtapeProjet from './etapes/EtapeProjet';
import EtapeEntreprise from './etapes/EtapeEntreprise';
import EtapeContact from './etapes/EtapeContact';
import EtapeRecapitulatif from './etapes/EtapeRecapitulatif';

// ─── COMPOSANT PRINCIPAL ────────────────────────────────

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

  // Brouillon localStorage (uniquement si pas de préremplissage simulateur, pour éviter d'écraser)
  const draft = useMemo(
    () => lireBrouillon(prefill, dbUser.email || user.email),
    [prefill, dbUser.email, user.email],
  );

  const formulaireInitial = useMemo(
    () => construireFormulaireInitial({ prefill, draft, user, dbUser }),
    [prefill, draft, user, dbUser],
  );

  // L'étape mémorisée dans le brouillon n'est qu'un souhait : on la borne à la
  // première étape encore incomplète. Sans cela, un brouillon enregistré au
  // récapitulatif rouvrait l'assistant directement sur l'envoi, alors que les
  // CGU ne sont jamais persistées et revenaient donc à « non acceptées ».
  const [step, setStep] = useState(() => Math.min(
    calculerEtapeInitiale(prefill, draft),
    etapeMaximaleAutorisee(formulaireInitial, t),
  ));
  const [direction, setDirection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDraftHint, setShowDraftHint] = useState(!!draft);

  const [form, setForm] = useState(formulaireInitial);

  // Sauvegarde du brouillon à chaque modification (sauf les CGU).
  // Aucun enregistrement quand un simulateur préremplit le formulaire : la
  // lecture est alors neutralisée, écrire détruirait le brouillon précédent.
  useEffect(() => {
    enregistrerBrouillon(prefill, form, step, dbUser.email || user.email);
  }, [prefill, form, step, dbUser.email, user.email]);

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // ─── NAVIGATION ──────────────────────────────────────

  const goNext = useCallback(() => {
    const errs = validerEtape(step, form, t);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }, [step, form, t]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const goToStep = useCallback((target) => {
    // Retour autorisé uniquement vers une étape déjà validée
    if (target < step) {
      setDirection(-1);
      setStep(target);
    }
  }, [step]);

  // ─── ENVOI ───────────────────────────────────────────

  const handleSubmit = async () => {
    // Garde d'envoi : le récapitulatif n'envoyait jusqu'ici aucune validation.
    // Toute étape de saisie encore en défaut — au premier chef l'acceptation
    // des CGU — ramène l'utilisateur sur l'étape concernée au lieu d'envoyer.
    const blocage = premiereEtapeInvalide(form, t);
    if (blocage) {
      setErrors(blocage.errors);
      setDirection(-1);
      setStep(blocage.etape);
      return;
    }

    setSubmitting(true);
    try {
      const body = construireCorpsDemande(form, prefill);

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur serveur');
      }

      // Nettoyage du brouillon après envoi réussi
      supprimerBrouillon();

      router.push('/espace');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const clearDraft = useCallback(() => {
    supprimerBrouillon();
    setShowDraftHint(false);
    setForm(construireFormulaireVierge({ user, dbUser }));
    setStep(0);
    setErrors({});
  }, [dbUser, user]);

  // ─── LIBELLÉS DES ÉTAPES ─────────────────────────────

  const stepLabels = [
    t('espace.wizard.steps.type'),
    t('espace.wizard.steps.project'),
    t('espace.wizard.steps.company'),
    t('espace.wizard.steps.contact'),
    t('espace.wizard.steps.summary'),
  ];

  // ─── RENDU ───────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <EnteteAssistant
        prefill={prefill}
        showDraftHint={showDraftHint}
        onRetour={() => router.push('/espace')}
        onEffacerBrouillon={clearDraft}
        t={t}
      />

      <BarreDeProgression step={step} stepLabels={stepLabels} goToStep={goToStep} />

      {/* Contenu de l'étape */}
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
            {step === 0 && <EtapeTypeDeProduit form={form} update={update} errors={errors} t={t} />}
            {step === 1 && <EtapeProjet form={form} update={update} errors={errors} t={t} />}
            {step === 2 && <EtapeEntreprise form={form} update={update} errors={errors} t={t} />}
            {step === 3 && <EtapeContact form={form} update={update} errors={errors} t={t} />}
            {step === 4 && (
              <EtapeRecapitulatif form={form} goToStep={(s) => { setDirection(-1); setStep(s); }} t={t} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Message d'erreur */}
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

        <NavigationAssistant
          step={step}
          submitting={submitting}
          goPrev={goPrev}
          goNext={goNext}
          onSubmit={handleSubmit}
          t={t}
        />
      </div>

      {submitting && (
        <div className="fin-loader-overlay" aria-live="polite">
          <div className="fin-loader-overlay__icon" />
          <p className="fin-loader-overlay__text">Envoi de votre demande à nos partenaires…</p>
        </div>
      )}
    </div>
  );
}
