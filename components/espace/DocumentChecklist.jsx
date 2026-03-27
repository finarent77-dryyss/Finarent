'use client';

import { motion } from 'framer-motion';

const REQUIRED_DOCS = {
  PRET_PRO: [
    { type: 'KBIS', label: 'Extrait KBIS', desc: 'Moins de 3 mois' },
    { type: 'RIB', label: 'RIB professionnel', desc: 'Compte bancaire entreprise' },
    { type: 'BILAN', label: 'Bilan comptable', desc: '2 derniers exercices' },
    { type: 'CNI', label: 'Pièce d\'identité', desc: 'CNI ou passeport du dirigeant' },
  ],
  CREDIT_BAIL: [
    { type: 'KBIS', label: 'Extrait KBIS', desc: 'Moins de 3 mois' },
    { type: 'RIB', label: 'RIB professionnel', desc: 'Compte bancaire entreprise' },
    { type: 'BILAN', label: 'Bilan comptable', desc: '2 derniers exercices' },
    { type: 'CNI', label: 'Pièce d\'identité', desc: 'CNI ou passeport' },
  ],
  LOA: [
    { type: 'KBIS', label: 'Extrait KBIS', desc: 'Moins de 3 mois' },
    { type: 'RIB', label: 'RIB professionnel', desc: 'Compte bancaire entreprise' },
    { type: 'CNI', label: 'Pièce d\'identité', desc: 'CNI ou passeport' },
  ],
  LLD: [
    { type: 'KBIS', label: 'Extrait KBIS', desc: 'Moins de 3 mois' },
    { type: 'RIB', label: 'RIB professionnel', desc: 'Compte bancaire' },
    { type: 'CNI', label: 'Pièce d\'identité', desc: 'CNI ou passeport' },
  ],
  RC_PRO: [
    { type: 'KBIS', label: 'Extrait KBIS', desc: 'Moins de 3 mois' },
    { type: 'CNI', label: 'Pièce d\'identité', desc: 'CNI ou passeport' },
  ],
  LEASING_OPS: [
    { type: 'KBIS', label: 'Extrait KBIS', desc: 'Moins de 3 mois' },
    { type: 'RIB', label: 'RIB professionnel', desc: 'Compte bancaire' },
    { type: 'BILAN', label: 'Bilan comptable', desc: 'Dernier exercice' },
    { type: 'CNI', label: 'Pièce d\'identité', desc: 'CNI ou passeport' },
  ],
};

// Default if product type not found
const DEFAULT_DOCS = [
  { type: 'KBIS', label: 'Extrait KBIS', desc: 'Moins de 3 mois' },
  { type: 'RIB', label: 'RIB professionnel', desc: 'Compte bancaire' },
  { type: 'CNI', label: 'Pièce d\'identité', desc: 'CNI ou passeport' },
];

export default function DocumentChecklist({ productType, uploadedDocuments = [] }) {
  const required = REQUIRED_DOCS[productType] || DEFAULT_DOCS;
  const uploadedTypes = uploadedDocuments.map(d => d.type);
  const completedCount = required.filter(r => uploadedTypes.includes(r.type)).length;
  const progress = required.length > 0 ? Math.round((completedCount / required.length) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-primary flex items-center gap-2">
          <i className="fa-solid fa-list-check text-secondary"></i>
          Documents requis
        </h3>
        <span className={`text-sm font-bold ${progress === 100 ? 'text-accent' : 'text-slate-500'}`}>
          {completedCount}/{required.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full mb-5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${progress === 100 ? 'bg-accent' : 'bg-secondary'}`}
        />
      </div>

      <div className="space-y-3">
        {required.map((doc, i) => {
          const isUploaded = uploadedTypes.includes(doc.type);
          return (
            <motion.div
              key={doc.type}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isUploaded
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-slate-50/50 border-slate-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isUploaded ? 'bg-accent text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                <i className={`fa-solid ${isUploaded ? 'fa-check' : 'fa-file'} text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold ${isUploaded ? 'text-accent' : 'text-primary'}`}>{doc.label}</div>
                <div className="text-[10px] text-slate-400">{doc.desc}</div>
              </div>
              {isUploaded && (
                <span className="text-[10px] font-bold text-accent uppercase">Fourni</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {progress === 100 && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <span className="text-sm font-bold text-accent">
            <i className="fa-solid fa-circle-check mr-1.5"></i>
            Dossier complet
          </span>
        </div>
      )}
    </div>
  );
}
