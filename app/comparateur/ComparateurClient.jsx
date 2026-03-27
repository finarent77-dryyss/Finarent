'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

// ─── Solution definitions ───────────────────────────────────────────────
const SOLUTIONS = [
  {
    id: 'pret-pro',
    icon: 'fa-coins',
    rate: 3.5,
    purchaseOption: true,
    ownershipEnd: true,
    taxDeductible: 'partial',
    accounting: 'onBalance',
    durationRange: '12-84',
    depositRequired: true,
    bestFor: 'bestForPretPro',
  },
  {
    id: 'credit-bail',
    icon: 'fa-file-contract',
    rate: 4.2,
    purchaseOption: true,
    ownershipEnd: true,
    taxDeductible: 'rentDeductible',
    accounting: 'offBalance',
    durationRange: '12-84',
    depositRequired: false,
    bestFor: 'bestForCreditBail',
  },
  {
    id: 'loa',
    icon: 'fa-car',
    rate: 4.8,
    purchaseOption: true,
    ownershipEnd: true,
    taxDeductible: 'rentDeductible',
    accounting: 'offBalance',
    durationRange: '24-72',
    depositRequired: false,
    bestFor: 'bestForLoa',
  },
  {
    id: 'lld',
    icon: 'fa-rotate',
    rate: 5.5,
    purchaseOption: false,
    ownershipEnd: false,
    taxDeductible: 'total',
    accounting: 'offBalance',
    durationRange: '24-60',
    depositRequired: false,
    bestFor: 'bestForLld',
  },
];

// ─── Monthly payment calculation (standard amortization) ────────────────
function calcMonthly(principal, annualRate, months) {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

// ─── Animated number display ────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '', prefix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef(null);

  useEffect(() => {
    const start = display;
    const end = value;
    if (start === end) return;

    const duration = 500;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    }

    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);

  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(display);

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

// ─── FAQ Accordion Item ─────────────────────────────────────────────────
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-[#0A2540]">{question}</span>
        <i
          className={`fa-solid fa-chevron-down text-sm text-slate-400 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-4 text-slate-600 text-sm leading-relaxed">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function ComparateurClient() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(50000);
  const [duration, setDuration] = useState(36);
  const [viewMode, setViewMode] = useState('cards');
  const [hasCompared, setHasCompared] = useState(false);
  const resultsRef = useRef(null);

  // ─── Calculated results ─────────────────────────────────────────────
  const results = useMemo(() => {
    return SOLUTIONS.map((sol) => {
      const monthly = calcMonthly(amount, sol.rate, duration);
      const totalCost = monthly * duration;
      const totalInterest = totalCost - amount;
      return { ...sol, monthly, totalCost, totalInterest };
    });
  }, [amount, duration]);

  const recommendedIdx = useMemo(() => {
    let minCost = Infinity;
    let idx = 0;
    results.forEach((r, i) => {
      if (r.totalCost < minCost) {
        minCost = r.totalCost;
        idx = i;
      }
    });
    return idx;
  }, [results]);

  const handleCompare = useCallback(() => {
    setHasCompared(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  // ─── Helper for i18n boolean/enum values ────────────────────────────
  const taxLabel = (val) => {
    if (val === 'partial') return t('comparator.partial');
    if (val === 'total') return t('comparator.total');
    if (val === 'rentDeductible') return t('comparator.rentDeductible');
    return val;
  };

  const yesNo = (val) => (val ? t('comparator.yes') : t('comparator.no'));
  const accountingLabel = (val) =>
    val === 'onBalance' ? t('comparator.onBalance') : t('comparator.offBalance');

  const solutionName = (id) => {
    const map = {
      'pret-pro': t('comparator.pretPro'),
      'credit-bail': t('comparator.creditBail'),
      loa: t('comparator.loa'),
      lld: t('comparator.lld'),
    };
    return map[id] || id;
  };

  const durationOptions = [12, 24, 36, 48, 60, 72];

  // ─── Slider percentage ──────────────────────────────────────────────
  const sliderPercent = ((amount - 5000) / (500000 - 5000)) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#0A2540] to-[#0A2540]/80 pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-[#6366F1]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#10B981] text-sm font-semibold mb-6 border border-white/10">
              <i className="fa-solid fa-scale-balanced" />
              {t('comparator.badge')}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              {t('comparator.title')}
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">{t('comparator.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 1: INPUT FORM ────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-10"
          >
            {/* Amount */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-[#0A2540] mb-3">
                {t('comparator.amount')}
              </label>
              <div className="flex items-center gap-4 mb-3">
                <input
                  type="number"
                  min={5000}
                  max={500000}
                  step={1000}
                  value={amount}
                  onChange={(e) => {
                    let v = parseInt(e.target.value, 10);
                    if (isNaN(v)) v = 5000;
                    v = Math.max(5000, Math.min(500000, v));
                    setAmount(v);
                  }}
                  className="w-40 px-4 py-3 border border-slate-200 rounded-xl text-[#0A2540] font-bold text-lg focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] outline-none transition"
                />
                <span className="text-slate-500 font-medium text-lg">&euro;</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={5000}
                  max={500000}
                  step={1000}
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value, 10))}
                  className="comparator-slider w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #10B981 0%, #10B981 ${sliderPercent}%, #e2e8f0 ${sliderPercent}%, #e2e8f0 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>5 000 &euro;</span>
                  <span>500 000 &euro;</span>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-[#0A2540] mb-3">
                {t('comparator.duration')}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {durationOptions.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                      duration === d
                        ? 'bg-[#6366F1] text-white border-[#6366F1] shadow-lg shadow-[#6366F1]/25'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#6366F1]/40 hover:text-[#6366F1]'
                    }`}
                  >
                    {d} {t('comparator.months')}
                  </button>
                ))}
              </div>
            </div>

            {/* Compare button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCompare}
              className="w-full py-4 bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold text-lg rounded-xl shadow-lg shadow-[#10B981]/25 transition-colors"
            >
              <i className="fa-solid fa-scale-balanced mr-2" />
              {t('comparator.compare')}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ─── RESULTS SECTIONS (visible after compare) ─────────────────── */}
      {hasCompared && (
        <>
          {/* ─── SECTION 2: COMPARISON CARDS ──────────────────────────── */}
          <section ref={resultsRef} className="py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0A2540]">
                  {t('comparator.resultsTitle')}
                </h2>
                <p className="text-slate-500 mt-2">
                  {new Intl.NumberFormat('fr-FR').format(amount)} &euro; &mdash; {duration}{' '}
                  {t('comparator.months')}
                </p>
              </motion.div>

              {/* View toggle */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      viewMode === 'cards'
                        ? 'bg-white text-[#0A2540] shadow-sm'
                        : 'text-slate-500 hover:text-[#0A2540]'
                    }`}
                  >
                    <i className="fa-solid fa-th-large mr-2" />
                    {t('comparator.cardView')}
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      viewMode === 'table'
                        ? 'bg-white text-[#0A2540] shadow-sm'
                        : 'text-slate-500 hover:text-[#0A2540]'
                    }`}
                  >
                    <i className="fa-solid fa-table mr-2" />
                    {t('comparator.tableView')}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {viewMode === 'cards' ? (
                  /* ─── CARDS VIEW ─────────────────────────────────────── */
                  <motion.div
                    key="cards"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
                  >
                    {results.map((sol, idx) => {
                      const isRecommended = idx === recommendedIdx;
                      return (
                        <motion.div
                          key={sol.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1, duration: 0.4 }}
                          className={`relative bg-white rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                            isRecommended
                              ? 'border-[#10B981] shadow-lg shadow-[#10B981]/10'
                              : 'border-slate-200 hover:border-[#6366F1]/40'
                          }`}
                        >
                          {/* Recommended badge */}
                          {isRecommended && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <span className="inline-flex items-center gap-1.5 px-4 py-1 bg-[#10B981] text-white text-xs font-bold rounded-full shadow-lg shadow-[#10B981]/30">
                                <i className="fa-solid fa-star text-[10px]" />
                                {t('comparator.recommended')}
                              </span>
                            </div>
                          )}

                          {/* Header */}
                          <div className="text-center mb-6 pt-2">
                            <div
                              className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
                                isRecommended ? 'bg-[#10B981]/10' : 'bg-[#6366F1]/10'
                              }`}
                            >
                              <i
                                className={`fa-solid ${sol.icon} text-xl ${
                                  isRecommended ? 'text-[#10B981]' : 'text-[#6366F1]'
                                }`}
                              />
                            </div>
                            <h3 className="text-lg font-bold text-[#0A2540]">
                              {solutionName(sol.id)}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">{t(`comparator.${sol.bestFor}`)}</p>
                          </div>

                          {/* Monthly payment */}
                          <div className="text-center bg-slate-50 rounded-xl py-4 mb-4">
                            <div className="text-sm text-slate-500 mb-1">{t('comparator.monthly')}</div>
                            <div className="text-2xl font-bold text-[#0A2540]">
                              <AnimatedNumber value={sol.monthly} decimals={2} suffix=" &euro;" />
                            </div>
                          </div>

                          {/* Details */}
                          <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">{t('comparator.totalCost')}</span>
                              <span className="font-semibold text-[#0A2540]">
                                <AnimatedNumber value={sol.totalCost} decimals={0} suffix=" &euro;" />
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">{t('comparator.rate')}</span>
                              <span className="font-semibold text-[#0A2540]">{sol.rate} %</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">{t('comparator.purchaseOption')}</span>
                              <span
                                className={`font-semibold ${sol.purchaseOption ? 'text-[#10B981]' : 'text-red-500'}`}
                              >
                                {yesNo(sol.purchaseOption)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">{t('comparator.ownershipEnd')}</span>
                              <span
                                className={`font-semibold ${sol.ownershipEnd ? 'text-[#10B981]' : 'text-red-500'}`}
                              >
                                {yesNo(sol.ownershipEnd)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">{t('comparator.taxDeductible')}</span>
                              <span className="font-semibold text-[#0A2540]">
                                {taxLabel(sol.taxDeductible)}
                              </span>
                            </div>
                          </div>

                          {/* CTA */}
                          <Link
                            href="/contact"
                            className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                              isRecommended
                                ? 'bg-[#10B981] text-white hover:bg-[#10B981]/90 shadow-md shadow-[#10B981]/20'
                                : 'bg-[#0A2540] text-white hover:bg-[#0A2540]/90'
                            }`}
                          >
                            {t('comparator.chooseSolution')}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  /* ─── TABLE VIEW ─────────────────────────────────────── */
                  <motion.div
                    key="table"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-x-auto"
                  >
                    <table className="w-full border-collapse min-w-[700px]">
                      <thead>
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-slate-500 bg-slate-50 rounded-tl-xl">
                            {t('comparator.criteria')}
                          </th>
                          {results.map((sol, idx) => (
                            <th
                              key={sol.id}
                              className={`p-4 text-center text-sm font-bold ${
                                idx === results.length - 1 ? 'rounded-tr-xl' : ''
                              } ${
                                idx === recommendedIdx
                                  ? 'bg-[#10B981]/5 text-[#10B981]'
                                  : 'bg-slate-50 text-[#0A2540]'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <i className={`fa-solid ${sol.icon} text-lg`} />
                                <span>{solutionName(sol.id)}</span>
                                {idx === recommendedIdx && (
                                  <span className="text-[10px] bg-[#10B981] text-white px-2 py-0.5 rounded-full">
                                    {t('comparator.recommended')}
                                  </span>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            label: t('comparator.monthly'),
                            render: (sol) =>
                              `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(sol.monthly)} \u20AC`,
                          },
                          {
                            label: t('comparator.totalCost'),
                            render: (sol) =>
                              `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(sol.totalCost)} \u20AC`,
                          },
                          { label: t('comparator.rate'), render: (sol) => `${sol.rate} %` },
                          {
                            label: t('comparator.purchaseOption'),
                            render: (sol) => yesNo(sol.purchaseOption),
                            color: (sol) => (sol.purchaseOption ? 'text-[#10B981]' : 'text-red-500'),
                          },
                          {
                            label: t('comparator.ownershipEnd'),
                            render: (sol) => yesNo(sol.ownershipEnd),
                            color: (sol) => (sol.ownershipEnd ? 'text-[#10B981]' : 'text-red-500'),
                          },
                          {
                            label: t('comparator.taxDeductible'),
                            render: (sol) => taxLabel(sol.taxDeductible),
                          },
                          {
                            label: t('comparator.accountingLabel'),
                            render: (sol) => accountingLabel(sol.accounting),
                          },
                          {
                            label: t('comparator.durationRange'),
                            render: (sol) => `${sol.durationRange} ${t('comparator.months')}`,
                          },
                          {
                            label: t('comparator.depositRequired'),
                            render: (sol) => yesNo(sol.depositRequired),
                            color: (sol) => (sol.depositRequired ? 'text-red-500' : 'text-[#10B981]'),
                          },
                        ].map((row, rIdx) => (
                          <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="p-4 text-sm font-medium text-slate-600 border-t border-slate-100">
                              {row.label}
                            </td>
                            {results.map((sol, cIdx) => (
                              <td
                                key={sol.id}
                                className={`p-4 text-center text-sm font-semibold border-t border-slate-100 ${
                                  cIdx === recommendedIdx ? 'bg-[#10B981]/5' : ''
                                } ${row.color ? row.color(sol) : 'text-[#0A2540]'}`}
                              >
                                {row.render(sol)}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {/* CTA row */}
                        <tr>
                          <td className="p-4 border-t border-slate-100" />
                          {results.map((sol, idx) => (
                            <td
                              key={sol.id}
                              className={`p-4 text-center border-t border-slate-100 ${
                                idx === recommendedIdx ? 'bg-[#10B981]/5' : ''
                              }`}
                            >
                              <Link
                                href="/contact"
                                className={`inline-block px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                  idx === recommendedIdx
                                    ? 'bg-[#10B981] text-white hover:bg-[#10B981]/90'
                                    : 'bg-[#0A2540] text-white hover:bg-[#0A2540]/90'
                                }`}
                              >
                                {t('comparator.chooseSolution')}
                              </Link>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* ─── SECTION 4: FAQ ────────────────────────────────────────── */}
          <section className="py-12 sm:py-16 bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0A2540]">
                  {t('comparator.faqTitle')}
                </h2>
              </motion.div>
              <div className="max-w-3xl mx-auto space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                  >
                    <FaqItem
                      question={t(`comparator.faq${i}Q`)}
                      answer={t(`comparator.faq${i}A`)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ─── Slider custom styles ──────────────────────────────────────── */}
      <style jsx>{`
        .comparator-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
          transition: transform 0.2s;
        }
        .comparator-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .comparator-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </div>
  );
}
