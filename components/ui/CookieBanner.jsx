'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getConsent, setConsent, hasGivenConsent } from '@/lib/consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    if (!hasGivenConsent()) {
      setTimeout(() => setVisible(true), 1000);
    }
    const c = getConsent();
    setPrefs({ analytics: c.analytics, marketing: c.marketing });
  }, []);

  const acceptAll = () => {
    setConsent({ analytics: true, marketing: true });
    setVisible(false);
  };

  const acceptEssentialOnly = () => {
    setConsent({ analytics: false, marketing: false });
    setVisible(false);
  };

  const saveCustom = () => {
    setConsent(prefs);
    setVisible(false);
    setShowSettings(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-desc"
        >
          <div className="max-w-5xl mx-auto bg-white border border-slate-200 shadow-2xl rounded-2xl p-5 sm:p-6">
            {!showSettings ? (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <h3 id="cookie-banner-title" className="font-bold text-primary mb-1 flex items-center gap-2">
                    <i className="fa-solid fa-cookie-bite text-secondary"></i>
                    Cookies & confidentialité
                  </h3>
                  <p id="cookie-banner-desc" className="text-sm text-slate-500">
                    Nous utilisons des cookies essentiels au fonctionnement du site. Avec votre accord,
                    nous utilisons aussi des cookies analytics pour améliorer l'expérience.
                    <Link href="/privacy" className="text-secondary hover:underline ml-1">En savoir plus</Link>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-sm"
                  >
                    Personnaliser
                  </button>
                  <button
                    onClick={acceptEssentialOnly}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
                  >
                    Essentiels uniquement
                  </button>
                  <button
                    onClick={acceptAll}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm"
                  >
                    Tout accepter
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <i className="fa-solid fa-sliders text-secondary"></i>
                    Préférences cookies
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-slate-400 hover:text-slate-700"
                    aria-label="Retour"
                  >
                    <i className="fa-solid fa-arrow-left"></i>
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-not-allowed opacity-90">
                    <input type="checkbox" checked disabled className="mt-1 accent-secondary" />
                    <div className="flex-1">
                      <div className="font-bold text-sm text-primary">Essentiels <span className="text-xs text-slate-400 font-normal">— Toujours actifs</span></div>
                      <p className="text-xs text-slate-500 mt-0.5">Authentification, sécurité, panier. Indispensables au fonctionnement du site.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-secondary transition-colors">
                    <input
                      type="checkbox"
                      checked={prefs.analytics}
                      onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                      className="mt-1 accent-secondary"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-sm text-primary">Analytics</div>
                      <p className="text-xs text-slate-500 mt-0.5">Mesure d'audience anonymisée (PostHog) pour améliorer le site.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-secondary transition-colors">
                    <input
                      type="checkbox"
                      checked={prefs.marketing}
                      onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                      className="mt-1 accent-secondary"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-sm text-primary">Marketing</div>
                      <p className="text-xs text-slate-500 mt-0.5">Personnalisation des contenus et remarketing (désactivé tant que non utilisé).</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={saveCustom}
                    className="px-5 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm"
                  >
                    Enregistrer mes choix
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
