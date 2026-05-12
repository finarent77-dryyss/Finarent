'use client';

import Link from 'next/link';

/**
 * Tunnel de conversion partagé par tous les simulateurs.
 * Reçoit le contexte de la simulation pour pré-remplir le formulaire contact.
 */
export default function ConversionCTA({ simulatorName, params = {}, variant = 'default' }) {
  const queryString = new URLSearchParams({
    fromSimulator: simulatorName || '1',
    ...Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')),
  }).toString();

  if (variant === 'inline') {
    return (
      <Link
        href={`/contact?${queryString}`}
        className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-secondary text-white font-bold rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition"
      >
        <i className="fa-solid fa-handshake"></i>
        <span>Être recontacté par un expert</span>
        <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition"></i>
      </Link>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary via-primary to-[#0F2748] text-white rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Concrétisez votre projet</div>
          <h3 className="text-xl sm:text-2xl font-black mb-2">Échangez avec un expert Finassur</h3>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed">
            Un conseiller dédié analyse votre simulation et vous propose une offre personnalisée
            sous <span className="text-accent font-bold">48 h</span>. Sans engagement, sans frais.
          </p>
        </div>
        <Link
          href={`/contact?${queryString}`}
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-xl hover:scale-105 hover:shadow-2xl transition"
        >
          <span>Demander mon étude</span>
          <i className="fa-solid fa-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
}
