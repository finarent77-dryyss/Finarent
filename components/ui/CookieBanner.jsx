'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('finarent_cookie_consent');
    if (!consent) setTimeout(() => setVisible(true), 1000);
  }, []);

  const accept = (type) => {
    localStorage.setItem('finarent_cookie_consent', JSON.stringify({ type, date: new Date().toISOString() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-5xl mx-auto bg-white border border-slate-200 shadow-2xl rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-primary mb-1 flex items-center gap-2">
                  <i className="fa-solid fa-cookie-bite text-secondary"></i>
                  Cookies & confidentialité
                </h3>
                <p className="text-sm text-slate-500">
                  Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez accepter tous les cookies ou uniquement ceux nécessaires.
                  <Link href="/privacy" className="text-secondary hover:underline ml-1">En savoir plus</Link>
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => accept('essential')}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
                >
                  Essentiels
                </button>
                <button
                  onClick={() => accept('all')}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm"
                >
                  Tout accepter
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
