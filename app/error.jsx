'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fa-solid fa-triangle-exclamation text-red-500 text-3xl"></i>
        </div>
        <h1 className="text-2xl font-black text-primary mb-3">Une erreur est survenue</h1>
        <p className="text-slate-500 mb-8 text-sm">{error?.message || "Quelque chose s'est mal passé. Veuillez réessayer."}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm">
            Réessayer
          </button>
          <Link href="/" className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm">
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
