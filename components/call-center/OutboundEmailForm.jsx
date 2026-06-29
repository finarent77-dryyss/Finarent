'use client';

import { useState } from 'react';

export default function OutboundEmailForm({ onSent }) {
  const [form, setForm] = useState({
    recipientEmail: '',
    recipientName: '',
    subject: '',
    messageHtml: '',
    prospectId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const r = await fetch('/api/call-center/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          ...form,
          messageHtml: form.messageHtml.replace(/\n/g, '<br/>'),
          prospectId: form.prospectId || undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Échec envoi');
      setSuccess('Email envoyé via Brevo.');
      setForm({ recipientEmail: '', recipientName: '', subject: '', messageHtml: '', prospectId: '' });
      onSent?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm">
          <span className="font-semibold text-gray-700">Email destinataire *</span>
          <input
            type="email"
            required
            value={form.recipientEmail}
            onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
            className="mt-1 w-full border rounded-xl px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-gray-700">Nom</span>
          <input
            type="text"
            value={form.recipientName}
            onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
            className="mt-1 w-full border rounded-xl px-3 py-2"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-semibold text-gray-700">Objet *</span>
        <input
          type="text"
          required
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="mt-1 w-full border rounded-xl px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="font-semibold text-gray-700">Message *</span>
        <textarea
          required
          rows={6}
          value={form.messageHtml}
          onChange={(e) => setForm({ ...form, messageHtml: e.target.value })}
          className="mt-1 w-full border rounded-xl px-3 py-2"
          placeholder="Votre message de prospection…"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 disabled:opacity-50"
      >
        {loading ? 'Envoi…' : 'Envoyer via Brevo'}
      </button>
    </form>
  );
}
