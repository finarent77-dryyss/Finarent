'use client';

// Barre de progression de l'assistant : pastilles cliquables vers les étapes
// déjà validées et libellés des étapes.
// Extraite telle quelle de DemandeWizardClient.jsx.

import { motion } from 'framer-motion';
import { STEPS } from './constantes';

export default function BarreDeProgression({ step, stepLabels, goToStep }) {
  return (
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
  );
}
