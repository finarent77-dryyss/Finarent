'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const TIMELINE_STEPS = [
  { key: 'submitted', label: 'Dépôt', icon: 'fa-paper-plane', statuses: ['en_attente'] },
  { key: 'review', label: 'Étude', icon: 'fa-magnifying-glass', statuses: ['en_cours', 'documents_manquants'] },
  { key: 'offer', label: 'Offre', icon: 'fa-file-invoice', statuses: ['devis_envoye', 'devis_accepte'] },
  { key: 'sign', label: 'Signature', icon: 'fa-pen-fancy', statuses: ['signature_en_attente', 'signe'] },
  { key: 'funds', label: 'Fonds', icon: 'fa-flag-checkered', statuses: ['transmis', 'validee', 'finalise'] },
];

const NEXT_ACTION = {
  en_attente: { tone: 'info', icon: 'fa-clock', message: 'Votre dossier est en file d\'attente. Réponse sous 48h.' },
  documents_manquants: { tone: 'warn', icon: 'fa-circle-exclamation', message: 'Action requise : complétez les documents demandés.' },
  en_cours: { tone: 'info', icon: 'fa-magnifying-glass', message: 'Étude en cours par notre équipe. Réponse sous 48h.' },
  devis_envoye: { tone: 'warn', icon: 'fa-file-invoice', message: 'Action requise : examinez et acceptez votre offre.' },
  devis_accepte: { tone: 'success', icon: 'fa-check', message: 'Offre acceptée. Signature en préparation.' },
  signature_en_attente: { tone: 'warn', icon: 'fa-pen-fancy', message: 'Action requise : signez votre contrat.' },
  signe: { tone: 'success', icon: 'fa-circle-check', message: 'Contrat signé. Déblocage des fonds en cours.' },
  transmis: { tone: 'info', icon: 'fa-truck-fast', message: 'Dossier transmis au partenaire. Déblocage imminent.' },
  validee: { tone: 'success', icon: 'fa-circle-check', message: 'Dossier validé. Bravo !' },
};

function findStepIndex(status) {
  return TIMELINE_STEPS.findIndex((s) => s.statuses.includes(status));
}

export default function ActiveFileTimeline({ dossier, dateLocale = 'fr-FR' }) {
  if (!dossier) return null;
  const currentStep = findStepIndex(dossier.status);
  const action = NEXT_ACTION[dossier.status];
  const toneStyles = {
    info: 'bg-secondary/10 text-secondary border-secondary/20',
    warn: 'bg-amber-50 text-amber-800 border-amber-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100 mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-black text-primary flex items-center gap-2">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
            Mon dossier en cours
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            <span className="font-mono font-bold text-secondary">{dossier.reference}</span>
            {dossier.equipmentType && <> · {dossier.equipmentType}</>}
            {dossier.amount && <> · <span className="font-semibold">{dossier.amount.toLocaleString('fr-FR')}€</span></>}
          </p>
        </div>
        <Link
          href={`/espace/${dossier.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/5 text-secondary font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-secondary hover:text-white transition-all"
        >
          Voir le détail
          <i className="fa-solid fa-arrow-right text-[10px]"></i>
        </Link>
      </div>

      {/* Timeline */}
      <div className="relative mb-6">
        {/* Connecting line behind */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 mx-6" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: currentStep < 0 ? 0 : `${(currentStep / (TIMELINE_STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute top-5 left-6 h-0.5 bg-gradient-to-r from-secondary to-accent"
          style={{ maxWidth: 'calc(100% - 3rem)' }}
        />
        <div className="relative grid grid-cols-5 gap-2">
          {TIMELINE_STEPS.map((step, idx) => {
            const isPast = idx < currentStep;
            const isCurrent = idx === currentStep;
            const isFuture = idx > currentStep;
            return (
              <div key={step.key} className="flex flex-col items-center gap-2">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isCurrent ? 1.1 : 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    isPast
                      ? 'bg-secondary border-secondary text-white shadow-md'
                      : isCurrent
                        ? 'bg-white border-secondary text-secondary ring-4 ring-secondary/20'
                        : 'bg-white border-slate-200 text-slate-300'
                  }`}
                >
                  {isPast ? <i className="fa-solid fa-check text-xs"></i> : <i className={`fa-solid ${step.icon} text-xs`}></i>}
                </motion.div>
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center ${
                  isPast ? 'text-secondary' : isCurrent ? 'text-primary' : 'text-slate-300'
                }`}>
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="text-[9px] font-medium text-secondary -mt-1">En cours</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next action callout */}
      {action && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${toneStyles[action.tone]}`}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/60">
            <i className={`fa-solid ${action.icon}`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">{action.message}</p>
            <p className="text-[11px] opacity-70 mt-1">
              Dernière mise à jour : {new Date(dossier.updatedAt || dossier.createdAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
