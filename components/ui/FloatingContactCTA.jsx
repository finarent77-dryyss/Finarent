'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FloatingContactCTA() {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
      {open && (
        <div className="mb-3 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-br from-primary to-[#0A2540] p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <i className="fa-solid fa-headset text-white text-sm"></i>
              </div>
              <div>
                <div className="font-bold text-sm">Une question ?</div>
                <div className="text-xs text-white/60">Réponse sous 1h ouvrée</div>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mt-3">
              Nos conseillers sont là pour vous orienter vers la meilleure solution de financement.
            </p>
          </div>
          <div className="p-4 space-y-2">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/5 hover:bg-secondary text-secondary hover:text-white transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-secondary/10 group-hover:bg-white/20 flex items-center justify-center">
                <i className="fa-solid fa-paper-plane text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">Démarrer ma demande</div>
                <div className="text-[11px] opacity-70">Formulaire en 2 min</div>
              </div>
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </Link>
            <Link
              href="/simulator"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-accent/5 hover:bg-accent text-accent hover:text-white transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-accent/10 group-hover:bg-white/20 flex items-center justify-center">
                <i className="fa-solid fa-calculator text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">Simuler ma mensualité</div>
                <div className="text-[11px] opacity-70">Calcul instantané</div>
              </div>
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </Link>
            <a
              href="tel:0123456789"
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary text-primary hover:text-white transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 group-hover:bg-white/20 flex items-center justify-center">
                <i className="fa-solid fa-phone text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">Appelez-nous</div>
                <div className="text-[11px] opacity-70">Lun–Ven 9h-18h</div>
              </div>
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Contactez-nous"
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-secondary to-accent text-white shadow-2xl shadow-secondary/30 flex items-center justify-center hover:scale-110 transition-transform"
      >
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white">
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping"></span>
          </span>
        )}
        <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-comments'} text-xl`}></i>
      </button>
    </div>
  );
}
