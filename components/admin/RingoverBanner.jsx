'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function RingoverBanner({ className = '' }) {
  const [status, setStatus] = useState({ configured: false, loading: true });

  useEffect(() => {
    fetch('/api/webhooks/ringover')
      .then((r) => r.json())
      .then((data) => setStatus({ configured: !!data.configured, loading: false }))
      .catch(() => setStatus({ configured: false, loading: false }));
  }, []);

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/ringover`
    : 'https://finarent.fr/api/webhooks/ringover';

  if (status.loading) return null;

  return (
    <details className={`bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 ${className}`}>
      <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`shrink-0 w-2.5 h-2.5 rounded-full ${status.configured ? 'bg-emerald-500' : 'bg-amber-500'}`}
            aria-hidden
          />
          <div>
            <p className="text-sm font-bold text-primary">Téléphonie Ringover</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {status.configured
                ? 'Webhook connecté — les appels sont synchronisés automatiquement'
                : 'Configuration requise pour synchroniser les appels'}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-gray-400 shrink-0">Détails techniques</span>
      </summary>
      <div className="px-4 pb-4 pt-0 border-t border-gray-100 text-sm text-gray-600 space-y-2">
        {status.configured ? (
          <p>
            URL webhook :{' '}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded break-all">{webhookUrl}</code>
          </p>
        ) : (
          <p>
            Ajoutez <code className="bg-gray-100 px-1 rounded">RINGOVER_WEBHOOK_KEY</code> dans les variables
            d&apos;environnement (Vercel), puis configurez l&apos;URL dans Ringover → Developer → Webhooks.
          </p>
        )}
        <ul className="text-xs text-gray-500 list-disc list-inside space-y-0.5">
          <li>Événements : hangup, missed, voicemail, contact search</li>
          <li>Header Authorization = clé webhook Ringover</li>
          <li>Email agent Ringover = email compte Finarent (admin / agent centre)</li>
        </ul>
        <Link href="/admin/settings" className="inline-block text-xs font-bold text-secondary hover:underline">
          Paramètres →
        </Link>
      </div>
    </details>
  );
}
