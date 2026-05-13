'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { SliderInput } from '@/components/simulators/inputs';
import { monthlyPayment, totalCost, totalInterest, formatEUR } from '@/lib/simulators/calculations/pret';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import AuroraBackground from '@/components/ui/AuroraBackground';

export default function HomeQuickSimulator() {
  const [amount, setAmount] = useState(150000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(3.8);

  const m = useMemo(() => monthlyPayment(amount, months, rate), [amount, months, rate]);
  const cost = useMemo(() => totalCost(m, months), [m, months]);
  const interest = useMemo(() => totalInterest(m, months, amount), [m, months, amount]);

  return (
    <section className="relative py-12 sm:py-16 lg:py-24 bg-linear-to-br from-white via-secondary/5 to-accent/5 overflow-hidden">
      <AuroraBackground variant="soft" />
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block px-3 py-1.5 bg-secondary/10 rounded-full mb-4 animate-bounce-soft">
            <span className="text-secondary font-bold text-[10px] sm:text-xs uppercase tracking-widest">Simulateur rapide</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary mb-4 tracking-tight">
            Estimez votre <span className="text-transparent bg-clip-text bg-linear-to-r from-secondary via-accent to-secondary animate-gradient">mensualité</span>
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
              <div className="relative bg-linear-to-br from-primary via-primary to-primary/85 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex-1 overflow-hidden hover-lift">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-blob pointer-events-none"></div>
                <div className="absolute -bottom-16 -left-12 w-44 h-44 bg-secondary/30 rounded-full blur-3xl animate-blob-delay pointer-events-none"></div>
                <div className="relative">
                  <div className="text-xs uppercase tracking-widest font-bold opacity-70 mb-2">Mensualité estimée</div>
                  <div className="text-4xl sm:text-5xl font-black tracking-tight mb-1">
                    <AnimatedNumber value={m} format={formatEUR} />
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
