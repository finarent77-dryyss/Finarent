'use client';

import { useState, useTransition } from 'react';

export default function RingoverProspectActions({ prospectId, phone, ringoverApi, smsNumbers }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState(null);
  const [smsOpen, setSmsOpen] = useState(false);
  const [smsBody, setSmsBody] = useState('');
  const [fromNumber, setFromNumber] = useState(smsNumbers[0] ?? '');

  const smsAvailable = smsNumbers.length > 0;

  if (!ringoverApi || !phone) return null;

  function notify(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), type === 'error' ? 12000 : 8000);
  }

  function handleCall() {
    start(async () => {
      try {
        const res = await fetch('/api/call-center/ringover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'call', prospectId }),
        });
        const data = await res.json();
        if (data.ok) {
          notify('success', 'Ringover appelle votre poste — décrochez pour joindre le prospect.');
        } else {
          notify('error', data.error || 'Échec du lancement d\'appel.');
        }
      } catch {
        notify('error', 'Impossible de lancer l\'appel. Rechargez la page.');
      }
    });
  }

  function handleSms(e) {
    e.preventDefault();
    if (!smsBody.trim()) return;
    const chosen = smsNumbers.length > 1 ? fromNumber : smsNumbers[0];
    start(async () => {
      try {
        const res = await fetch('/api/call-center/ringover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sms',
            prospectId,
            content: smsBody.trim(),
            fromNumber: chosen,
          }),
        });
        const data = await res.json();
        if (data.ok) {
          notify('success', 'SMS envoyé via Ringover.');
          setSmsBody('');
          setSmsOpen(false);
        } else {
          notify('error', data.error || 'Échec envoi SMS.');
        }
      } catch {
        notify('error', 'Impossible d\'envoyer le SMS.');
      }
    });
  }

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 space-y-3">
      {message && (
        <div className={`text-sm font-semibold rounded-xl px-4 py-2 ${
          message.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }`}>
          {message.text}
        </div>
      )}
      <h2 className="font-bold text-violet-900 flex items-center gap-2 text-sm">
        <i className="fa-solid fa-phone" />
        Téléphonie Ringover
      </h2>
      <p className="text-xs text-violet-800/80">
        Le click-to-call sonne d&apos;abord votre softphone Ringover, puis le prospect ({phone}).
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCall}
          disabled={pending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 disabled:opacity-50"
        >
          {pending ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-phone" />}
          Appeler via Ringover
        </button>
        {smsAvailable && (
          <button
            type="button"
            onClick={() => setSmsOpen((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-violet-200 text-violet-800 text-sm font-bold hover:bg-violet-100"
          >
            <i className="fa-solid fa-comment-sms" />
            SMS
          </button>
        )}
      </div>
      {smsOpen && smsAvailable && (
        <form onSubmit={handleSms} className="space-y-2 pt-2 border-t border-violet-200">
          {smsNumbers.length > 1 && (
            <select
              value={fromNumber}
              onChange={(e) => setFromNumber(e.target.value)}
              className="w-full border border-violet-200 rounded-xl px-3 py-2 text-sm bg-white"
            >
              {smsNumbers.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          )}
          <textarea
            value={smsBody}
            onChange={(e) => setSmsBody(e.target.value)}
            rows={3}
            maxLength={480}
            placeholder="Message SMS…"
            className="w-full border border-violet-200 rounded-xl px-3 py-2 text-sm bg-white"
            required
          />
          <button
            type="submit"
            disabled={pending || !smsBody.trim()}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold disabled:opacity-50"
          >
            Envoyer le SMS
          </button>
        </form>
      )}
      {!smsAvailable && (
        <p className="text-[10px] text-violet-700/70">
          SMS : configurez les numéros Ringover du centre (admin → Centres d&apos;appel).
        </p>
      )}
    </div>
  );
}
