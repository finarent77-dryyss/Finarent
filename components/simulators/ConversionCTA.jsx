'use client';

import Link from 'next/link';
import { findSimulatorBySlug } from '@/lib/simulators/prefill';

/**
 * Tunnel de conversion partagé par tous les simulateurs.
 * - "Faire ma demande" → /espace/demande (wizard prérempli depuis la simulation)
 * - "Demander mon étude" → /contact (mise en relation conseiller)
 */
export default function ConversionCTA({ simulatorName, params = {}, variant = 'default' }) {
  const sim = findSimulatorBySlug(simulatorName);
  const category = sim?.category || '';

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );

  // /contact — formulaire historique de mise en relation
  const contactQuery = new URLSearchParams({
    fromSimulator: simulatorName || '1',
    ...cleanParams,
  }).toString();

  // /espace/demande — préremplissage du wizard
  const demandeParams = {
    simulator: simulatorName || '',
    ...(category ? { category } : {}),
    ...cleanParams,
  };
  const demandeQuery = new URLSearchParams(
    Object.fromEntries(Object.entries(demandeParams).filter(([, v]) => v !== '')),
  ).toString();
  const demandeHref = `/espace/demande${demandeQuery ? `?${demandeQuery}` : ''}`;

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-3">
        <Link
          href={demandeHref}
          className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-secondary text-white font-bold rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition"
        >
          <i className="fa-solid fa-paper-plane"></i>
          <span>Faire ma demande</span>
          <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition"></i>
        </Link>
        <Link
          href={`/contact?${contactQuery}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary border border-gray-200 font-bold rounded-xl hover:border-secondary hover:shadow-md transition"
        >
          <i className="fa-solid fa-handshake"></i>
          <span>Être recontacté</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary via-primary to-[#0F2748] text-white rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col gap-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Concrétisez votre projet</div>
          <h3 className="text-xl sm:text-2xl font-black mb-2">Lancez votre demande en quelques minutes</h3>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed">
            Vos chiffres de simulation sont déjà prêts — démarrez votre dossier ou échangez avec un conseiller Finarent
            sous <span className="text-accent font-bold">48 h</span>. Sans engagement, sans frais.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={demandeHref}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-primary font-black rounded-xl hover:scale-105 hover:shadow-2xl transition"
          >
            <i className="fa-solid fa-paper-plane"></i>
            <span>Faire ma demande</span>
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
          <Link
            href={`/contact?${contactQuery}`}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition border border-white/20"
          >
            <i className="fa-solid fa-handshake"></i>
            <span>Demander mon étude</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
