import Link from 'next/link';

/**
 * Écran "compte requis" affiché à la place d'un simulateur premium
 * quand l'utilisateur n'est pas authentifié.
 */
export default function LoginGate({ simulator, returnPath }) {
  const returnTo = encodeURIComponent(returnPath || '/simulateurs');
  return (
    <div className="relative">
      {/* Aperçu flouté en arrière-plan */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-40 blur-sm" aria-hidden>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 h-24"></div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 h-40"></div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 h-28"></div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 h-28"></div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 h-28"></div>
          </div>
        </div>
      </div>

      {/* Card centrale */}
      <div className="relative bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mb-5">
          <i className="fa-solid fa-lock text-2xl"></i>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-violet-50 text-violet-700 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
          Simulateur premium
        </div>
        <h2 className="font-black text-primary leading-tight mb-3"
            style={{ fontSize: 'clamp(26px, 3.4vw, 36px)' }}>
          Créez votre compte pour accéder à{' '}
          <span className="gradient-text">{simulator?.name || 'ce simulateur'}</span>
        </h2>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          Ce simulateur manipule des données financières sensibles. Un compte gratuit vous permet de
          sauvegarder vos simulations, suivre l'évolution de vos dossiers et échanger avec votre conseiller dédié.
        </p>

        <ul className="text-left max-w-md mx-auto space-y-2 mb-8">
          {[
            'Sauvegarde automatique des simulations',
            'Suivi de dossier + messages avec un conseiller',
            'Documents centralisés (justificatifs, contrats)',
            '100 % gratuit, sans engagement',
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-primary">
              <i className="fa-solid fa-check text-emerald-500 mt-1 text-xs"></i>
              <span>{t}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/api/auth/login?returnTo=${returnTo}&screen_hint=signup`}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-3.5 rounded-2xl shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] transition hover:-translate-y-px"
          >
            <i className="fa-solid fa-user-plus"></i>
            Créer un compte gratuit
          </Link>
          <Link
            href={`/api/auth/login?returnTo=${returnTo}`}
            className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-primary font-semibold px-6 py-3.5 rounded-2xl hover:bg-gray-50 transition"
          >
            J'ai déjà un compte
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          <i className="fa-solid fa-shield-halved mr-1"></i>
          Vos données sont chiffrées et hébergées en Europe.
        </p>
      </div>
    </div>
  );
}
