'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SliderInput } from '@/components/simulators/inputs';
import { monthlyPayment, totalCost, totalInterest, formatEUR } from '@/lib/simulators/calculations/pret';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import AuroraBackground from '@/components/ui/AuroraBackground';

export default function HomeQuickSimulator() {
  const [amount, setAmount] = useState(150000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(3.8);
  const [pulseKey, setPulseKey] = useState(0);
  const firstRender = useRef(true);

  const m = useMemo(() => monthlyPayment(amount, months, rate), [amount, months, rate]);
  const cost = useMemo(() => totalCost(m, months), [m, months]);
  const interest = useMemo(() => totalInterest(m, months, amount), [m, months, amount]);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    setPulseKey((k) => k + 1);
  }, [m]);

  return (
    <section className="relative py-12 sm:py-16 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 mesh-bg"></div>
      <AuroraBackground variant="vivid" />
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full mb-4 shadow-lg border border-secondary/20 animate-bounce-soft">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-secondary font-bold text-[10px] sm:text-xs uppercase tracking-widest">Simulateur rapide</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary mb-4 tracking-tight">
            Estimez votre <span className="text-transparent bg-clip-text bg-linear-to-r from-secondary via-purple-500 to-accent animate-gradient-sweep">mensualité</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Glissez les curseurs ou <span className="font-semibold text-secondary">cliquez sur les chiffres</span> pour saisir vos valeurs au clavier.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-7">
              <SliderInput
                label="Montant emprunté"
                value={amount}
                onChange={setAmount}
                min={5000}
                max={1000000}
                step={1000}
                accent="secondary"
              />
              <SliderInput
                label="Durée"
                value={months}
                onChange={setMonths}
                min={12}
                max={300}
                step={12}
                suffix="mois"
                format="number"
                accent="accent"
              />
              <SliderInput
                label="Taux nominal annuel"
                value={rate}
                onChange={setRate}
                min={0.5}
                max={15}
                step={0.05}
                suffix="%"
                format="number"
                accent="secondary"
              />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="relative rounded-3xl p-[2px] bg-linear-to-r from-secondary via-accent to-purple-500 animate-gradient-sweep shadow-2xl">
                <div
                  key={pulseKey}
                  className="relative bg-linear-to-br from-primary via-primary to-primary/85 rounded-[22px] p-6 sm:p-7 text-white flex-1 overflow-hidden animate-ring-pulse"
                >
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-accent/30 rounded-full blur-3xl animate-blob pointer-events-none"></div>
                  <div className="absolute -bottom-16 -left-12 w-44 h-44 bg-secondary/40 rounded-full blur-3xl animate-blob-delay pointer-events-none"></div>
                  <div className="relative">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold opacity-70 mb-2">
                      <i className="fa-solid fa-bolt text-accent animate-pulse"></i>
                      <span>Mensualité estimée</span>
                    </div>
                    <div className="text-5xl sm:text-6xl font-black tracking-tight mb-1">
                      <AnimatedNumber
                        value={m}
                        format={formatEUR}
                        className="bg-clip-text text-transparent bg-linear-to-r from-white via-accent to-white animate-gradient-sweep"
                      />
                    </div>
                  <div className="text-xs opacity-70">/ mois pendant {Math.round(months / 12)} ans</div>
                  <div className="h-px bg-white/10 my-5"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Coût total</div>
                      <div className="text-lg font-bold"><AnimatedNumber value={cost} format={formatEUR} /></div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Intérêts</div>
                      <div className="text-lg font-bold"><AnimatedNumber value={interest} format={formatEUR} /></div>
                    </div>
                  </div>
                </div>
              </div>
              </div>

              <Link
                href={`/simulateurs/credit-immobilier/mensualite?amount=${amount}&months=${months}&rate=${rate}`}
                className="group flex items-center justify-center gap-2 px-5 py-4 bg-secondary text-white font-bold rounded-2xl hover:bg-secondary/90 transition-all hover:scale-[1.02] shadow-lg"
              >
                <i className="fa-solid fa-calculator"></i>
                <span>Simulation complète</span>
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </Link>

              <Link
                href="/simulateurs"
                className="text-center text-xs font-semibold text-gray-500 hover:text-secondary transition-colors"
              >
                Voir les 40+ simulateurs disponibles
              </Link>
            </div>
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-6 italic">
            Estimation indicative — hors assurance emprunteur, frais de dossier et garanties.
          </p>
        </div>
      </div>
    </section>
  );
}
