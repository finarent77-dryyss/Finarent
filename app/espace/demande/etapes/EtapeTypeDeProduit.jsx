'use client';

// Étape 1 — choix du type de produit (financement ou RC Pro).
// Extraite telle quelle de DemandeWizardClient.jsx (ex-StepType).

import { motion } from 'framer-motion';
import { PRODUCT_TYPES } from '../constantes';

export default function EtapeTypeDeProduit({ form, update, errors, t }) {
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
