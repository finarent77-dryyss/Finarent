'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

export default function SecurityClient({ user, dbUser }) {
  const { t, locale } = useTranslation();
  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

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
    <div className="min-h-screen bg-[#F8FAFC] pt-24 sm:pt-32 pb-12 sm:pb-20">
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
