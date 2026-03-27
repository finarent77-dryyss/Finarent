'use client';
export default function AdminError({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <i className="fa-solid fa-triangle-exclamation text-red-500 text-2xl"></i>
      </div>
      <h2 className="text-xl font-black text-primary mb-2">Erreur</h2>
      <p className="text-slate-400 text-sm mb-6 max-w-sm">{error?.message || 'Une erreur est survenue.'}</p>
      <button onClick={reset} className="px-6 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm">
        Réessayer
      </button>
    </div>
  );
}
