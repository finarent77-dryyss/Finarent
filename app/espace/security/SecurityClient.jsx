'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { formatIban, isValidIban, normalizeIban, normalizeBic } from '@/lib/bank.js';

export default function SecurityClient({ user, dbUser, bank: initialBank, provider }) {
  const { t, locale } = useTranslation();
  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }

  // — Mot de passe —
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSentTo, setResetSentTo] = useState(null);

  // — Coordonnées bancaires —
  const [bank, setBank] = useState(initialBank);
  const [editingBank, setEditingBank] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [bankError, setBankError] = useState(null);
  const [bankForm, setBankForm] = useState({
    holder: initialBank?.holder || dbUser.name || '',
    iban: '',
    bic: initialBank?.bic || '',
  });

  const roleLabels = {
    CLIENT: 'Client',
    ADMIN: 'Administrateur',
    PARTNER: 'Partenaire',
    INSURER: 'Assureur',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const inputClass =
    'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all text-primary';

  const notify = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handlePasswordReset = async () => {
    setSendingReset(true);
    try {
      const res = await fetch('/api/profile/password', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResetSentTo(data.email || user.email);
      } else {
        notify('error', data.error || t('espace.security.genericError'));
      }
    } catch {
      notify('error', t('espace.security.genericError'));
    } finally {
      setSendingReset(false);
    }
  };

  const openBankForm = () => {
    setBankForm({ holder: bank?.holder || dbUser.name || '', iban: '', bic: bank?.bic || '' });
    setBankError(null);
    setConfirmDelete(false);
    setEditingBank(true);
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setBankError(null);

    if (!isValidIban(bankForm.iban)) {
      setBankError(t('espace.security.bankInvalidIban'));
      return;
    }

    setSavingBank(true);
    try {
      const res = await fetch('/api/profile/bank', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holder: bankForm.holder,
          iban: normalizeIban(bankForm.iban),
          bic: normalizeBic(bankForm.bic),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setBank(data);
        setEditingBank(false);
        notify('success', t('espace.security.bankSaved'));
      } else {
        setBankError(data.error || t('espace.security.genericError'));
      }
    } catch {
      setBankError(t('espace.security.genericError'));
    } finally {
      setSavingBank(false);
    }
  };

  const handleBankDelete = async () => {
    setSavingBank(true);
    try {
      const res = await fetch('/api/profile/bank', { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setBank(data);
        setConfirmDelete(false);
        notify('success', t('espace.security.bankRemoved'));
      } else {
        notify('error', data.error || t('espace.security.genericError'));
      }
    } catch {
      notify('error', t('espace.security.genericError'));
    } finally {
      setSavingBank(false);
    }
  };

  const tips = [
    {
      icon: 'fa-lock',
      titleKey: 'espace.security.strongPassword',
      descKey: 'espace.security.strongPasswordDesc',
      color: 'bg-secondary/10 text-secondary',
    },
    {
      icon: 'fa-shield-halved',
      titleKey: 'espace.security.enable2FA',
      descKey: 'espace.security.enable2FADesc',
      color: 'bg-accent/10 text-accent',
    },
    {
      icon: 'fa-user-secret',
      titleKey: 'espace.security.dontShare',
      descKey: 'espace.security.dontShareDesc',
      color: 'bg-red-100 text-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-32 pb-12 sm:pb-20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 sm:px-6"
      >
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <motion.div variants={itemVariants} className="mb-6">
            <Link
              href="/espace"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-secondary font-medium text-sm transition-colors"
            >
              <i className="fa-solid fa-arrow-left"></i>
              {t('espace.security.back')}
            </Link>
          </motion.div>

          {/* Title */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-primary">
              <i className="fa-solid fa-shield-halved text-secondary mr-3"></i>
              {t('espace.security.title')}
            </h1>
          </motion.div>

          {/* Feedback banner */}
          <AnimatePresence>
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
          </AnimatePresence>

          {/* Security Info Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 mb-6"
          >
            <div className="space-y-5">
              {/* Auth method */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-11 h-11 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-shield-halved text-lg"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t('espace.security.authMethod')}
                  </div>
                  <div className="text-sm font-bold text-primary mt-0.5">Auth0 (OAuth 2.0 / OpenID Connect)</div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-11 h-11 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-envelope-circle-check text-lg"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t('espace.security.emailAssociated')}
                  </div>
                  <div className="text-sm font-bold text-primary mt-0.5 flex items-center gap-2">
                    {user.email}
                    {user.email_verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <i className="fa-solid fa-circle-check"></i>
                        Vérifié
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Account created */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-11 h-11 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-calendar-plus text-lg"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t('espace.security.accountCreated')}
                  </div>
                  <div className="text-sm font-bold text-primary mt-0.5">
                    {new Date(dbUser.createdAt).toLocaleDateString(dateLocale, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Last login */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-11 h-11 bg-accent/10 text-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-right-to-bracket text-lg"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t('espace.security.lastLogin')}
                  </div>
                  <div className="text-sm font-bold text-primary mt-0.5">
                    {dbUser.lastLoginAt
                      ? new Date(dbUser.lastLoginAt).toLocaleDateString(dateLocale, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : t('espace.security.firstLogin')}
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-user-tag text-lg"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t('espace.security.role')}
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary/10 text-secondary">
                      <i className="fa-solid fa-circle text-[6px]"></i>
                      {roleLabels[dbUser.role] || dbUser.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lien vers les informations modifiables du profil */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-500">{t('espace.security.profileHint')}</p>
              <Link
                href="/espace/profile"
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-xs"
              >
                <i className="fa-solid fa-user-pen"></i>
                {t('espace.security.profileLink')}
              </Link>
            </div>
          </motion.div>

          {/* Password */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 mb-6"
          >
            <h2 className="text-base font-black text-primary mb-2 flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
                <i className="fa-solid fa-key text-sm"></i>
              </div>
              {t('espace.security.passwordTitle')}
            </h2>

            {provider?.isDatabase ? (
              <>
                <p className="text-sm text-slate-500 mb-5">{t('espace.security.passwordIntro')}</p>
                {resetSentTo ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <p className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                      <i className="fa-solid fa-paper-plane"></i>
                      {t('espace.security.passwordSentTitle')}
                    </p>
                    <p className="text-xs text-emerald-700/80 mt-1">
                      {t('espace.security.passwordSentDesc')} <strong>{resetSentTo}</strong>.
                    </p>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={sendingReset}
                    className="w-full sm:w-auto px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-lg shadow-secondary/25"
                  >
                    <i className={`fa-solid ${sendingReset ? 'fa-spinner fa-spin' : 'fa-envelope'}`}></i>
                    {sendingReset
                      ? t('espace.security.passwordSending')
                      : t('espace.security.passwordAction')}
                  </motion.button>
                )}
              </>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-sm font-bold text-primary flex items-center gap-2">
                  <i className="fa-solid fa-circle-info text-secondary"></i>
                  {t('espace.security.passwordSocialPrefix')} {provider?.label}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {t('espace.security.passwordSocialDesc')}
                </p>
              </div>
            )}
          </motion.div>

          {/* Coordonnées bancaires (RIB) */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 mb-6"
          >
            <h2 className="text-base font-black text-primary mb-2 flex items-center gap-2">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                <i className="fa-solid fa-building-columns text-sm"></i>
              </div>
              {t('espace.security.bankTitle')}
            </h2>
            <p className="text-sm text-slate-500 mb-5">{t('espace.security.bankIntro')}</p>

            {editingBank ? (
              <form onSubmit={handleBankSubmit} className="space-y-5">
                {bank?.hasIban && (
                  <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-start gap-2">
                    <i className="fa-solid fa-circle-info text-secondary mt-0.5"></i>
                    {t('espace.security.bankRetypeHint')}
                  </p>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    {t('espace.security.bankHolder')}
                  </label>
                  <input
                    type="text"
                    value={bankForm.holder}
                    onChange={(e) => setBankForm((p) => ({ ...p, holder: e.target.value }))}
                    placeholder="Nom du titulaire du compte"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    {t('espace.security.bankIban')}
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={bankForm.iban}
                    onChange={(e) => setBankForm((p) => ({ ...p, iban: e.target.value }))}
                    onBlur={(e) => setBankForm((p) => ({ ...p, iban: formatIban(e.target.value) }))}
                    placeholder="FR76 3000 1007 9412 3456 7890 185"
                    className={`${inputClass} font-mono tracking-wide`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    {t('espace.security.bankBic')}
                    <span className="ml-2 normal-case font-medium text-slate-400">
                      {t('espace.security.bankOptional')}
                    </span>
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={bankForm.bic}
                    onChange={(e) => setBankForm((p) => ({ ...p, bic: e.target.value }))}
                    onBlur={(e) => setBankForm((p) => ({ ...p, bic: normalizeBic(e.target.value) }))}
                    placeholder="BNPAFRPPXXX"
                    className={`${inputClass} font-mono tracking-wide`}
                  />
                </div>

                {bankError && (
                  <p className="text-xs font-semibold text-red-600 flex items-center gap-2">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {bankError}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={savingBank}
                    className="flex-1 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-secondary/25"
                  >
                    {savingBank && <i className="fa-solid fa-spinner fa-spin"></i>}
                    {savingBank ? t('espace.security.bankSaving') : t('espace.security.bankSave')}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setEditingBank(false)}
                    disabled={savingBank}
                    className="flex-1 sm:flex-none px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm disabled:opacity-50"
                  >
                    {t('espace.security.bankCancel')}
                  </button>
                </div>
              </form>
            ) : bank?.hasIban ? (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t('espace.security.bankIban')}
                  </div>
                  <div className="text-sm font-bold text-primary mt-0.5 font-mono tracking-wide break-all">
                    {bank.ibanMasked}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {t('espace.security.bankHolder')}
                    </div>
                    <div className="text-sm font-bold text-primary mt-0.5 truncate">
                      {bank.holder || '—'}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {t('espace.security.bankBic')}
                    </div>
                    <div className="text-sm font-bold text-primary mt-0.5 font-mono">
                      {bank.bic || '—'}
                    </div>
                  </div>
                </div>

                {bank.updatedAt && (
                  <p className="text-xs text-slate-400">
                    {t('espace.security.bankUpdatedAt')}{' '}
                    {new Date(bank.updatedAt).toLocaleDateString(dateLocale, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}

                {confirmDelete ? (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      {t('espace.security.bankConfirmDelete')}
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleBankDelete}
                        disabled={savingBank}
                        className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all text-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        {savingBank && <i className="fa-solid fa-spinner fa-spin"></i>}
                        {t('espace.security.bankConfirmYes')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        disabled={savingBank}
                        className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm disabled:opacity-50"
                      >
                        {t('espace.security.bankCancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                      type="button"
                      onClick={openBankForm}
                      className="px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm inline-flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-pen"></i>
                      {t('espace.security.bankEdit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="px-6 py-3 bg-white text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-50 transition-all text-sm inline-flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-trash"></i>
                      {t('espace.security.bankDelete')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                <div className="w-12 h-12 bg-white text-slate-300 rounded-xl flex items-center justify-center mx-auto mb-3 border border-slate-100">
                  <i className="fa-solid fa-building-columns text-xl"></i>
                </div>
                <p className="text-sm font-bold text-slate-500 mb-4">
                  {t('espace.security.bankEmpty')}
                </p>
                <button
                  type="button"
                  onClick={openBankForm}
                  className="px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm inline-flex items-center gap-2 shadow-lg shadow-secondary/25"
                >
                  <i className="fa-solid fa-plus"></i>
                  {t('espace.security.bankAdd')}
                </button>
              </div>
            )}
          </motion.div>

          {/* Security Tips */}
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-lg sm:text-xl font-black text-primary mb-4 flex items-center gap-2">
              <i className="fa-solid fa-lightbulb text-secondary"></i>
              {t('espace.security.securityTips')}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 ${tip.color} rounded-xl flex items-center justify-center mb-4`}>
                    <i className={`fa-solid ${tip.icon} text-xl`}></i>
                  </div>
                  <h3 className="text-sm font-bold text-primary mb-1.5">{t(tip.titleKey)}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{t(tip.descKey)}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Back button */}
          <motion.div variants={itemVariants} className="text-center">
            <Link
              href="/espace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-sm"
            >
              <i className="fa-solid fa-arrow-left"></i>
              {t('espace.security.back')}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
