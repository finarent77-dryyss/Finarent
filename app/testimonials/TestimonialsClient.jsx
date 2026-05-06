'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TestimonialCard from '@/components/ui/TestimonialCard';
import { testimonialsData } from '@/assets/data/testimonials';
import { useTranslation } from '@/lib/i18n';

const SECTORS = ['BTP', 'Médical', 'IT', 'Transport', 'Industrie', 'Restauration', 'Commerce', 'Services'];
const EMPTY_FORM = { authorName: '', position: '', company: '', sector: '', rating: 5, text: '', amount: '' };

export default function TestimonialsClient() {
  const { t } = useTranslation();
  const [items, setItems] = useState(testimonialsData);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    fetch('/api/testimonials')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data.map((t) => ({
            id: t.id,
            initials: t.initials,
            position: t.position || '',
            sector: t.sector || '',
            rating: t.rating,
            text: t.text,
            amount: t.amount || '',
          })));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState({ status: 'loading', message: '' });
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitState({ status: 'success', message: data.message || 'Merci ! Votre témoignage a été envoyé pour modération.' });
        setForm(EMPTY_FORM);
        setTimeout(() => { setShowForm(false); setSubmitState({ status: 'idle', message: '' }); }, 3000);
      } else {
        setSubmitState({ status: 'error', message: data.error || 'Erreur lors de l\'envoi' });
      }
    } catch {
      setSubmitState({ status: 'error', message: 'Erreur réseau' });
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">{t('testimonials.title')}</h1>
          <p className="text-gray-600">Découvrez l'expérience de nos clients à travers leurs témoignages.</p>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 transition-colors text-sm"
          >
            <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-pen-to-square'}`}></i>
            {showForm ? 'Annuler' : 'Laisser un témoignage'}
          </button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-12"
          >
            <h2 className="text-xl font-bold text-primary mb-4">Partagez votre expérience</h2>
            {submitState.status === 'success' ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm flex items-center gap-2">
                <i className="fa-solid fa-circle-check"></i>
                {submitState.message}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input required value={form.authorName} onChange={(e) => setForm((p) => ({ ...p, authorName: e.target.value }))} placeholder="Nom complet *" className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm" />
                  <input value={form.position} onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))} placeholder="Poste (Gérant, DAF…)" className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} placeholder="Entreprise (optionnel)" className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm" />
                  <select value={form.sector} onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))} className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm">
                    <option value="">— Secteur d'activité —</option>
                    {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Montant financé (ex: 50 000€)" className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm" />
                  <div className="flex items-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl">
                    <span className="text-sm text-slate-500">Note :</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, rating: n }))}
                          className={`text-xl transition-colors ${n <= form.rating ? 'text-amber-400' : 'text-slate-300'}`}
                          aria-label={`Note ${n} sur 5`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <textarea
                  required
                  value={form.text}
                  onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
                  placeholder="Votre témoignage (entre 30 et 1000 caractères) *"
                  minLength={30}
                  maxLength={1000}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm"
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{form.text.length}/1000 caractères</span>
                  <span>* Champs obligatoires</span>
                </div>
                {submitState.status === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm flex items-center gap-2">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    {submitState.message}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitState.status === 'loading'}
                  className="w-full px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitState.status === 'loading' ? (
                    <><i className="fa-solid fa-spinner fa-spin"></i> Envoi…</>
                  ) : (
                    <><i className="fa-solid fa-paper-plane"></i> Envoyer mon témoignage</>
                  )}
                </button>
                <p className="text-xs text-slate-400 text-center">Votre témoignage sera publié après validation par notre équipe.</p>
              </form>
            )}
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <TestimonialCard key={item.id} testimonial={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
