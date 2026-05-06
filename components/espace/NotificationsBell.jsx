'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'finassur_notif_lastread';
const POLL_INTERVAL = 60_000;

const STATUS_LABEL = {
  PENDING: 'En attente',
  REVIEWING: 'En analyse',
  DOCUMENTS_NEEDED: 'Documents demandés',
  QUOTE_SENT: 'Offre envoyée',
  QUOTE_ACCEPTED: 'Offre acceptée',
  PENDING_SIGNATURE: 'En attente de signature',
  SIGNED: 'Signé',
  TRANSMITTED: 'Transmis au partenaire',
  APPROVED: 'Approuvé',
  REJECTED: 'Refusé',
  COMPLETED: 'Fonds débloqués',
};

function relTime(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return 'à l\'instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return new Date(date).toLocaleDateString('fr-FR');
}

export default function NotificationsBell({ isOverDarkHero = false }) {
  const [data, setData] = useState({ unread: 0, items: [] });
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);

  const lastRead = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

  const fetchData = useCallback(async () => {
    try {
      const headers = {};
      if (lastRead) headers['x-last-read'] = lastRead;
      const res = await fetch('/api/notifications', { headers, cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {}
  }, [lastRead]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    function handleClick(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleOpen = () => {
    setOpen((o) => !o);
    if (!open) {
      // Marquer comme lu quand on ouvre la cloche
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, now);
      // Re-fetch sans incrémenter la dernière lecture immédiatement (visuel)
      setTimeout(() => setData((d) => ({ ...d, unread: 0 })), 200);
    }
  };

  const buttonClass = isOverDarkHero
    ? 'text-white hover:bg-white/15'
    : 'text-gray-600 hover:bg-gray-100 hover:text-primary';

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-colors relative ${buttonClass}`}
      >
        <i className="fa-solid fa-bell text-sm"></i>
        {data.unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {data.unread > 9 ? '9+' : data.unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-primary text-sm">Notifications</h3>
                {data.unreadMessages > 0 && (
                  <p className="text-xs text-secondary mt-0.5">
                    <i className="fa-solid fa-envelope text-[10px] mr-1"></i>
                    {data.unreadMessages} message{data.unreadMessages > 1 ? 's' : ''} non lu{data.unreadMessages > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <Link href="/espace/notifications" onClick={() => setOpen(false)} className="text-xs font-bold text-secondary hover:underline">
                Tout voir
              </Link>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {data.items.length === 0 ? (
                <div className="py-10 text-center text-gray-400">
                  <i className="fa-solid fa-bell-slash text-3xl mb-2 block"></i>
                  <p className="text-sm">Aucune notification récente</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {data.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/espace/${item.applicationId}`}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0 text-xs">
                          <i className="fa-solid fa-arrow-right-arrow-left"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-primary font-semibold truncate">{item.label}</p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            <span className="text-gray-400">{STATUS_LABEL[item.fromStatus] || item.fromStatus}</span>
                            <span className="mx-1.5 text-gray-300">→</span>
                            <span className="font-semibold text-secondary">{STATUS_LABEL[item.toStatus] || item.toStatus}</span>
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{relTime(item.createdAt)}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
