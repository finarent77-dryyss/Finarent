'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
                  src={user.picture || '/Finassurs_logo.jpeg'}
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
        </div>
      </motion.div>
    </div>
  );
}
