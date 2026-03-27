'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

const STATUS_COLORS = {
  PENDING: { color: 'bg-slate-100 text-slate-700', icon: 'fa-regular fa-clock' },
  REVIEWING: { color: 'bg-secondary/10 text-secondary', icon: 'fa-solid fa-magnifying-glass' },
  DOCUMENTS_NEEDED: { color: 'bg-red-100 text-red-700', icon: 'fa-solid fa-file' },
  QUOTE_SENT: { color: 'bg-secondary/10 text-secondary', icon: 'fa-solid fa-file-invoice' },
  QUOTE_ACCEPTED: { color: 'bg-accent/10 text-accent', icon: 'fa-solid fa-check' },
  PENDING_SIGNATURE: { color: 'bg-secondary/10 text-secondary', icon: 'fa-solid fa-pen' },
  SIGNED: { color: 'bg-accent/10 text-accent', icon: 'fa-solid fa-signature' },
  TRANSMITTED: { color: 'bg-secondary/10 text-secondary', icon: 'fa-solid fa-paper-plane' },
  APPROVED: { color: 'bg-emerald-100 text-emerald-800', icon: 'fa-solid fa-check-circle' },
  REJECTED: { color: 'bg-red-100 text-red-700', icon: 'fa-solid fa-xmark-circle' },
  COMPLETED: { color: 'bg-emerald-100 text-emerald-800', icon: 'fa-solid fa-flag-checkered' },
};

export default function NotificationsClient({ notifications, unreadMessages }) {
  const { t, locale } = useTranslation();
  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

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
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-secondary transition-colors"
            >
              <i className="fa-solid fa-arrow-left text-xs"></i>
              {t('espace.profile.back')}
            </Link>
          </motion.div>

          {/* Title + unread badge */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-primary">
              {t('espace.notifications.title')}
            </h1>
            {unreadMessages > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                <i className="fa-solid fa-envelope text-[10px]"></i>
                {unreadMessages} {t('espace.notifications.unreadMessages')}
              </span>
            )}
          </motion.div>

          {/* Empty state */}
          {notifications.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl sm:rounded-3xl p-12 shadow-sm border border-gray-100 text-center"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-bell-slash text-2xl text-slate-400"></i>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                {t('espace.notifications.noNotifications')}
              </p>
            </motion.div>
          ) : (
            /* Timeline */
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 sm:left-6 top-0 bottom-0 w-px bg-gray-200"></div>

              <div className="space-y-1">
                {notifications.map((notif, index) => {
                  const toStatusInfo = STATUS_COLORS[notif.toStatus] || STATUS_COLORS.PENDING;
                  const fromStatusInfo = STATUS_COLORS[notif.fromStatus] || STATUS_COLORS.PENDING;
                  const appName =
                    notif.application?.equipmentType || notif.application?.companyName || '—';

                  return (
                    <motion.div
                      key={notif.id}
                      variants={itemVariants}
                      className="relative flex gap-4 sm:gap-5 pl-0"
                    >
                      {/* Timeline dot */}
                      <div className="relative z-10 flex-shrink-0">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-sm ${toStatusInfo.color}`}
                        >
                          <i className={toStatusInfo.icon}></i>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 mb-3 hover:shadow-md transition-shadow">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <Link
                            href={`/espace/${notif.applicationId}`}
                            className="text-sm font-bold text-primary hover:text-secondary transition-colors"
                          >
                            {appName}
                          </Link>
                          <span className="text-[10px] sm:text-xs text-slate-400 font-medium whitespace-nowrap">
                            {new Date(notif.createdAt).toLocaleDateString(dateLocale, {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-slate-500 font-semibold">
                            {t('espace.notifications.statusChanged')}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${fromStatusInfo.color}`}
                          >
                            <i className={`${fromStatusInfo.icon} text-[8px]`}></i>
                            {t(`status.${notif.fromStatus}`) || notif.fromStatus}
                          </span>
                          <i className="fa-solid fa-arrow-right text-[10px] text-slate-300"></i>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${toStatusInfo.color}`}
                          >
                            <i className={`${toStatusInfo.icon} text-[8px]`}></i>
                            {t(`status.${notif.toStatus}`) || notif.toStatus}
                          </span>
                        </div>

                        {notif.comment && (
                          <p className="mt-2 text-xs text-slate-500 italic border-l-2 border-slate-200 pl-3">
                            {notif.comment}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
