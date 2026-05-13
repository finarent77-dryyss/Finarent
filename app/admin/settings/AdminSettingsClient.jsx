'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

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
            <div className="text-sm font-bold text-primary">01 23 45 67 89</div>
          </div>
        </div>
      </motion.div>

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
              title: 'Document envoy\u00e9',
              desc: 'Recevoir un email quand un client envoie un document',
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100/70 transition-colors"
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
                className={`relative w-12 h-7 rounded-full transition-colors ${
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
      <motion.div variants={itemVariants} className="flex items-center gap-4">
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
