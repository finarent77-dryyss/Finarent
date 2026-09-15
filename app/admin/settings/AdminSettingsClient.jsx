'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatIban, isValidBic, isValidIban, normalizeBic, normalizeIban } from '@/lib/bank';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const RIB_VIDE = { bankName: '', holder: '', iban: '', bic: '' };

/**
 * RIB de Finarent : imprimé en pied de facture et utilisé comme compte débiteur
 * des virements SEPA. Tant qu'il n'est pas saisi, ces deux usages sont bloqués
 * côté serveur (lib/invoicing/banque.js).
 */
function CoordonneesBancaires() {
  const [form, setForm] = useState(RIB_VIDE);
  const [etat, setEtat] = useState({ chargement: true, source: null, valide: false, updatedAt: null });
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState({ statut: 'idle', message: '' });

  const appliquer = (data) => {
    // Le gabarit n'est pas prérempli : il ne doit pas pouvoir être réenregistré tel quel.
    setForm(data.source === 'base'
      ? { bankName: data.bankName || '', holder: data.holder || '', iban: formatIban(data.iban), bic: data.bic || '' }
      : RIB_VIDE);
    setEtat({ chargement: false, source: data.source, valide: Boolean(data.valide), updatedAt: data.updatedAt });
  };

  useEffect(() => {
    let annule = false;
    fetch('/api/admin/settings/bank')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => { if (!annule) appliquer(data); })
      .catch(() => {
        if (annule) return;
        setEtat((e) => ({ ...e, chargement: false }));
        setEnvoi({ statut: 'erreur', message: 'Impossible de charger les coordonnées bancaires.' });
      });
    return () => { annule = true; };
  }, []);

  const verifier = () => {
    const e = {};
    if (!form.bankName.trim()) e.bankName = 'Nom de la banque requis';
    const iban = normalizeIban(form.iban);
    if (!isValidIban(iban) || /^0+$/.test(iban.slice(4))) e.iban = 'IBAN invalide : vérifiez la saisie (clé de contrôle)';
    const bic = normalizeBic(form.bic);
    if (!isValidBic(bic) || bic.startsWith('XXXX')) e.bic = 'BIC invalide (8 ou 11 caractères)';
    return e;
  };

  const enregistrer = async (ev) => {
    ev.preventDefault();
    const e = verifier();
    setErreurs(e);
    if (Object.keys(e).length) {
      setEnvoi({ statut: 'erreur', message: 'Corrigez les champs signalés.' });
      return;
    }
    setEnvoi({ statut: 'envoi', message: '' });
    try {
      const res = await fetch('/api/admin/settings/bank', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) setErreurs(data.errors);
        setEnvoi({ statut: 'erreur', message: data.error || 'Enregistrement refusé : vérifiez les champs.' });
        return;
      }
      appliquer(data);
      setEnvoi({ statut: 'ok', message: 'Coordonnées bancaires enregistrées.' });
    } catch {
      setEnvoi({ statut: 'erreur', message: 'Erreur réseau : rien n’a été enregistré.' });
    }
  };

  const champ = (cle, libelle, props = {}) => (
    <label className="block">
      <span className="text-[10px] font-bold text-slate-400 uppercase">{libelle}</span>
      <input
        value={form[cle]}
        onChange={(e) => setForm((p) => ({ ...p, [cle]: e.target.value }))}
        className={`mt-1 w-full px-4 py-3 border-2 rounded-xl focus:outline-none text-sm ${
          cle === 'iban' || cle === 'bic' ? 'font-mono uppercase' : ''
        } ${erreurs[cle] ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-secondary'}`}
        {...props}
      />
      {erreurs[cle] && <span className="block text-xs text-red-600 mt-1">{erreurs[cle]}</span>}
    </label>
  );

  return (
    <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
          <i className="fa-solid fa-building-columns text-sm"></i>
        </div>
        <div>
          <h2 className="font-bold text-primary text-lg">Coordonnées bancaires</h2>
          <p className="text-xs text-slate-400">RIB imprimé sur les factures et compte débiteur des virements SEPA</p>
        </div>
      </div>

      {!etat.chargement && (etat.valide ? (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-sm flex items-center gap-2">
          <i className="fa-solid fa-circle-check"></i>
          RIB valide{etat.updatedAt ? ` — mis à jour le ${new Date(etat.updatedAt).toLocaleDateString('fr-FR')}` : ''}
        </div>
      ) : (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm flex items-start gap-2">
          <i className="fa-solid fa-triangle-exclamation mt-0.5"></i>
          <span>Aucun RIB réel enregistré : l’envoi des factures et l’export SEPA restent bloqués tant qu’il n’est pas saisi.</span>
        </div>
      ))}

      <form onSubmit={enregistrer} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {champ('bankName', 'Banque', { placeholder: 'BNP Paribas', maxLength: 100 })}
          {champ('holder', 'Titulaire du compte', { placeholder: 'Finarent SAS', maxLength: 140 })}
          {champ('iban', 'IBAN', {
            placeholder: 'FR76 3000 1007 9412 3456 7890 185',
            autoComplete: 'off',
            spellCheck: false,
            onBlur: () => setForm((p) => ({ ...p, iban: formatIban(p.iban) })),
          })}
          {champ('bic', 'BIC', { placeholder: 'BNPAFRPPXXX', autoComplete: 'off', spellCheck: false, maxLength: 11 })}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={envoi.statut === 'envoi' || etat.chargement}
            className="px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all text-sm disabled:opacity-50"
          >
            {envoi.statut === 'envoi'
              ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Enregistrement…</>
              : <><i className="fa-solid fa-floppy-disk mr-2"></i>Enregistrer le RIB</>}
          </button>
          {envoi.message && (
            <span className={`text-sm font-bold ${envoi.statut === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>
              {envoi.message}
            </span>
          )}
        </div>
      </form>
    </motion.div>
  );
}

export default function AdminSettingsClient() {
  const [notifications, setNotifications] = useState({
    statusChange: true,
    newApplication: true,
    documentUploaded: false,
  });
  const [saved, setSaved] = useState(false);

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-primary">
          <i className="fa-solid fa-gear mr-3 text-secondary"></i>
          Param&egrave;tres
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configuration de la plateforme Finarent</p>
      </motion.div>

      {/* Company Info */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white">
            <i className="fa-solid fa-building text-sm"></i>
          </div>
          <div>
            <h2 className="font-bold text-primary text-lg">Informations soci&eacute;t&eacute;</h2>
            <p className="text-xs text-slate-400">Branding et coordonn&eacute;es</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Nom</div>
            <div className="text-sm font-bold text-primary">Finarent</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Activit&eacute;</div>
            <div className="text-sm font-bold text-primary">Courtage en financement professionnel</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Email de contact</div>
            <div className="text-sm font-bold text-secondary">contact@finarent.fr</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">T&eacute;l&eacute;phone</div>
            <div className="text-sm font-bold text-primary">01 60 28 59 41</div>
          </div>
        </div>
      </motion.div>

      {/* Coordonnées bancaires */}
      <CoordonneesBancaires />

      {/* Email Notifications */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
            <i className="fa-solid fa-bell text-sm"></i>
          </div>
          <div>
            <h2 className="font-bold text-primary text-lg">Notifications email</h2>
            <p className="text-xs text-slate-400">Configurer les alertes automatiques</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              key: 'statusChange',
              icon: 'fa-arrows-rotate',
              title: 'Changement de statut',
              desc: 'Recevoir un email quand le statut d\'une demande change',
            },
            {
              key: 'newApplication',
              icon: 'fa-file-circle-plus',
              title: 'Nouvelle demande',
              desc: 'Recevoir un email lors d\'une nouvelle demande de financement',
            },
            {
              key: 'documentUploaded',
              icon: 'fa-cloud-arrow-up',
              title: 'Document envoyé',
              desc: 'Recevoir un email quand un client envoie un document',
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <i className={`fa-solid ${item.icon} w-5 text-center text-secondary text-sm`}></i>
                <div>
                  <div className="text-sm font-bold text-primary">{item.title}</div>
                  <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
              </div>
              <button
                onClick={() => toggleNotification(item.key)}
                className={`relative w-12 h-7 shrink-0 rounded-full transition-colors ${
                  notifications[item.key] ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* System Info */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
            <i className="fa-solid fa-server text-sm"></i>
          </div>
          <div>
            <h2 className="font-bold text-primary text-lg">Syst&egrave;me</h2>
            <p className="text-xs text-slate-400">Informations techniques</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Version</div>
            <div className="text-sm font-bold text-primary">3.0.0</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Base de donn&eacute;es</div>
            <div className="text-sm font-bold text-primary">PostgreSQL (Prisma)</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Environnement</div>
            <div className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Production
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save button */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20"
        >
          <i className="fa-solid fa-check mr-2"></i>
          Enregistrer les modifications
        </button>

        {saved && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-emerald-600 text-sm font-bold"
          >
            <i className="fa-solid fa-circle-check"></i>
            Param&egrave;tres sauvegard&eacute;s
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
