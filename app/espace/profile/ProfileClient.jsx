'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

export default function ProfileClient({ user, dbUser }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: dbUser.name || '',
    phone: dbUser.phone || '',
    company: dbUser.company || '',
    legalForm: dbUser.legalForm || '',
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/profile/delete', { method: 'DELETE' });
      if (res.ok) {
        window.location.href = '/api/auth/logout';
      } else {
        setFeedback({ type: 'error', message: 'Erreur lors de la suppression du compte' });
        setShowDeleteDialog(false);
        setDeleting(false);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la suppression du compte' });
      setShowDeleteDialog(false);
      setDeleting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: t('espace.profile.saved') });
      } else {
        setFeedback({ type: 'error', message: t('espace.profile.error') });
      }
    } catch {
      setFeedback({ type: 'error', message: t('espace.profile.error') });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const inputClass =
    'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all text-primary';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 sm:pt-32 pb-12 sm:pb-20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 sm:px-6"
      >
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <motion.div variants={itemVariants} className="mb-6">
            <Link
              href="/espace"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-secondary transition-colors"
            >
              <i className="fa-solid fa-arrow-left text-xs"></i>
              {t('espace.profile.back')}
            </Link>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-2xl sm:text-3xl font-black text-primary mb-8"
          >
            {t('espace.profile.title')}
          </motion.h1>

          {/* Feedback banner */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <i
                className={`fa-solid ${
                  feedback.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'
                }`}
              ></i>
              {feedback.message}
            </motion.div>
          )}

          {/* Profile Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100"
          >
            {/* Avatar + email header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="relative">
                <img
                  src={user.picture || '/finarent-logo.jpg'}
                  alt={user.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-white shadow-lg object-cover"
                />
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-black text-primary truncate">
                  {user.name || formData.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <i className="fa-solid fa-envelope text-xs text-slate-400"></i>
                  <span className="text-sm text-slate-500 truncate">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <h3 className="text-base font-black text-primary mb-5 flex items-center gap-2">
                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
                  <i className="fa-solid fa-user-pen text-sm"></i>
                </div>
                {t('espace.profile.personalInfo')}
              </h3>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    {t('espace.profile.name')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleChange('name')}
                    className={inputClass}
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    {t('espace.profile.email')}
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    {t('espace.profile.phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    placeholder="06 12 34 56 78"
                    className={inputClass}
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    {t('espace.profile.company')}
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={handleChange('company')}
                    className={inputClass}
                  />
                </div>

                {/* Legal Form */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    {t('espace.profile.legalForm')}
                  </label>
                  <select
                    value={formData.legalForm}
                    onChange={handleChange('legalForm')}
                    className={inputClass}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="SAS">SAS</option>
                    <option value="SARL">SARL</option>
                    <option value="EURL">EURL</option>
                    <option value="SA">SA</option>
                    <option value="EI">EI</option>
                    <option value="SASU">SASU</option>
                    <option value="SCI">SCI</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              {/* Save button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={saving}
                className="w-full mt-8 py-3.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-secondary/25"
              >
                {saving && <i className="fa-solid fa-spinner fa-spin"></i>}
                {saving ? t('espace.profile.saving') : t('espace.profile.save')}
              </motion.button>
            </form>
          </motion.div>

          {/* Privacy & Personal Data Section (RGPD) */}
          <motion.div
            variants={itemVariants}
            className="mt-8 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200"
          >
            <h3 className="text-base font-black text-primary mb-2 flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
                <i className="fa-solid fa-shield-halved text-sm"></i>
              </div>
              Confidentialité et données personnelles
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de portabilité et de suppression de vos données.
            </p>

            <div className="space-y-4">
              {/* Export */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary flex items-center gap-2">
                    <i className="fa-solid fa-download text-secondary"></i>
                    Exporter mes données
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Téléchargez l&apos;ensemble de vos données au format JSON (article 20 RGPD).
                  </p>
                </div>
                <a
                  href="/api/profile/export"
                  download
                  className="shrink-0 px-5 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm flex items-center gap-2"
                >
                  <i className="fa-solid fa-file-arrow-down text-xs"></i>
                  Exporter
                </a>
              </div>

              {/* Delete */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-red-700 flex items-center gap-2">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    Supprimer mon compte
                  </p>
                  <p className="text-xs text-red-600/80 mt-1">
                    Votre compte sera anonymisé. Certaines données peuvent être conservées pour répondre à nos obligations légales.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="shrink-0 px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all text-sm flex items-center gap-2"
                >
                  <i className="fa-solid fa-trash text-xs"></i>
                  Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => !deleting && setShowDeleteDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-4">
                <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
              </div>
              <h3 className="text-xl font-black text-primary mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-slate-500 mb-6">
                Cette action est <strong className="text-red-600">irréversible</strong>. Vos données personnelles seront anonymisées et vous serez déconnecté. Souhaitez-vous continuer&nbsp;?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleting}
                  className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 px-5 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting && <i className="fa-solid fa-spinner fa-spin"></i>}
                  {deleting ? 'Suppression...' : 'Confirmer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
