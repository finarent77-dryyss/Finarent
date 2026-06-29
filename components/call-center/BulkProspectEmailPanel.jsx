'use client';

import { useMemo, useState } from 'react';

export default function BulkProspectEmailPanel({ prospects }) {
  const [selected, setSelected] = useState(new Set());
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const withEmail = useMemo(
    () => prospects.filter((p) => p.email),
    [prospects],
  );

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(withEmail.slice(0, 25).map((p) => p.id)));
  };

  const sendBulk = async () => {
    if (!selected.size || !subject || !message) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch('/api/call-center/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk',
          prospectIds: [...selected],
          subject,
          messageHtml: message.replace(/\n/g, '<br/>'),
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Échec');
      setResult(data);
      setSelected(new Set());
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h2 className="font-bold text-primary">Envoi groupé (max 25)</h2>
        <button type="button" onClick={selectAll} className="text-sm text-secondary font-bold hover:underline">
          Tout sélectionner
        </button>
      </div>
      <div className="p-5 space-y-4">
        <div className="max-h-48 overflow-y-auto border rounded-xl divide-y">
          {withEmail.map((p) => (
            <label key={p.id} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
              <span className="font-medium">{p.name || 'Sans nom'}</span>
              <span className="text-gray-400">{p.email}</span>
            </label>
          ))}
          {!withEmail.length && (
            <p className="p-4 text-sm text-gray-400">Aucun prospect avec email.</p>
          )}
        </div>
        <input
          type="text"
          placeholder="Objet"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border rounded-xl px-3 py-2 text-sm"
        />
        <textarea
          rows={4}
          placeholder="Message commun…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border rounded-xl px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={sendBulk}
          disabled={loading || !selected.size}
          className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl disabled:opacity-50"
        >
          {loading ? 'Envoi…' : `Envoyer à ${selected.size} prospect(s)`}
        </button>
        {result && !result.error && (
          <p className="text-sm text-emerald-600">
            {result.sent} envoyé(s), {result.failed} échec(s).
          </p>
        )}
        {result?.error && <p className="text-sm text-red-600">{result.error}</p>}
      </div>
    </div>
  );
}
