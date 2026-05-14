'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Données assurances ──────────────────────────────────────
const PARTICULIERS = [
  {
    id: 'auto',
    icon: 'fa-car',
    bgGradient: 'from-sky-100 to-blue-200',
    textColor: 'text-sky-700',
    title: 'Auto',
    tagline: 'Tarif en 1 min, économisez jusqu\'à 40%',
    status: 'obligatoire',
    promo: '2 mois offerts',
    covers: ['Responsabilité civile (obligatoire)', 'Bris de glace, vol, incendie', 'Tous risques + assistance 0 km', 'Prêt de véhicule en cas de sinistre'],
    audience: 'Tout conducteur · jeune permis, malussé, expérimenté',
    price: 'À partir de 30 €/mois',
    fastQuote: '/assurance/auto/devis',
    quote: '/contact?type=assurance&product=auto',
  },
  {
    id: 'moto',
    icon: 'fa-motorcycle',
    bgGradient: 'from-amber-100 to-orange-200',
    textColor: 'text-amber-700',
    title: 'Moto / Scooter',
    tagline: 'Au kilomètre ou à l\'année',
    status: 'obligatoire',
    promo: '2 mois offerts',
    covers: ['RC obligatoire + dommages tous accidents', 'Formule au kilomètre (-30%)', 'Équipement du pilote (casque, blouson)', 'Vol + incendie + catastrophes naturelles'],
    audience: 'Motards, scootéristes, cyclomotoristes · BSR/permis A1/A2/A',
    price: 'À partir de 18 €/mois',
    fastQuote: '/assurance/moto/devis',
    quote: '/contact?type=assurance&product=moto',
  },
  {
    id: 'habitation',
    icon: 'fa-house-chimney',
    bgGradient: 'from-emerald-100 to-teal-200',
    textColor: 'text-emerald-700',
    title: 'Habitation',
    tagline: 'Multirisque locataire ou propriétaire',
    status: 'obligatoire',
    promo: '2 mois offerts',
    covers: ['Dégât des eaux, incendie, vol', 'Responsabilité civile vie privée', 'Catastrophes naturelles', 'Protection juridique vie privée incluse'],
    audience: 'Locataires (obligatoire) · propriétaires · résidences secondaires',
    price: 'À partir de 12 €/mois',
    fastQuote: '/assurance/habitation/devis',
    quote: '/contact?type=assurance&product=habitation',
  },
  {
    id: 'sante',
    icon: 'fa-heart-pulse',
    bgGradient: 'from-rose-100 to-pink-200',
    textColor: 'text-rose-700',
    title: 'Santé / Mutuelle',
    tagline: 'Complémentaire individuelle ou famille',
    status: 'recommande',
    covers: ['Hospitalisation + optique + dentaire', 'Médecines douces (option Confort+)', 'Tiers payant généralisé', 'Sans questionnaire, sans délai de carence'],
    audience: 'TNS, retraités, fonctionnaires, particuliers sans contrat collectif',
    price: 'À partir de 25 €/mois',
    fastQuote: '/assurance/sante/devis',
    quote: '/contact?type=assurance&product=sante',
  },
  {
    id: 'prevoyance',
    icon: 'fa-shield-heart',
    bgGradient: 'from-violet-100 to-purple-200',
    textColor: 'text-violet-700',
    title: 'Prévoyance',
    tagline: 'Décès, invalidité, incapacité',
    status: 'recommande',
    covers: ['Capital décès ou rente de conjoint', 'Invalidité absolue et définitive (IAD)', 'Incapacité temporaire de travail (ITT)', 'Maintien niveau de vie famille'],
    audience: 'Tous, particulièrement parents avec enfants à charge',
    price: 'À partir de 18 €/mois',
    quote: '/contact?type=assurance&product=prevoyance',
  },
  {
    id: 'emprunteur',
    icon: 'fa-house-medical',
    bgGradient: 'from-teal-100 to-emerald-200',
    textColor: 'text-teal-700',
    title: 'Emprunteur',
    tagline: 'Délégation Loi Lemoine — économies 40-60%',
    status: 'obligatoire',
    covers: ['Décès / PTIA / IPT / IPP', 'Incapacité de travail (ITT)', 'Perte d\'emploi (option)', 'Changement à tout moment depuis 2022'],
    audience: 'Emprunteurs immobiliers — toute banque accepte la délégation',
    price: '0,10 % à 0,30 % du capital',
    fastQuote: '/simulateurs/assurance-emprunteur/assurance-emprunteur',
    quote: '/contact?type=assurance&product=emprunteur',
  },
  {
    id: 'animaux',
    icon: 'fa-paw',
    bgGradient: 'from-fuchsia-100 to-pink-200',
    textColor: 'text-fuchsia-700',
    title: 'Chien & Chat',
    tagline: 'Frais véto + chirurgie + prévention',
    status: 'optionnel',
    covers: ['Frais vétérinaires (maladie + accident)', 'Chirurgie et hospitalisation', 'Médicaments et examens', 'Forfait prévention (vaccins, vermifuges)'],
    audience: 'Propriétaires de chiens, chats, NAC',
    price: 'À partir de 9 €/mois',
    quote: '/contact?type=assurance&product=animaux',
  },
  {
    id: 'gav',
    icon: 'fa-hands-holding-child',
    bgGradient: 'from-yellow-100 to-amber-200',
    textColor: 'text-yellow-800',
    title: 'Accidents de la vie',
    tagline: 'GAV — accidents domestiques, sport, loisirs',
    status: 'recommande',
    promo: '2 mois offerts',
    covers: ['Capital d\'invalidité jusqu\'à 1 M€', 'Rente d\'éducation pour les enfants', 'Frais médicaux + assistance', 'Couvre toute la famille (option)'],
    audience: 'Familles avec enfants · sportifs · bricoleurs · seniors',
    price: 'À partir de 11 €/mois',
    quote: '/contact?type=assurance&product=gav',
  },
  {
    id: 'protection-juridique-perso',
    icon: 'fa-scale-balanced',
    bgGradient: 'from-indigo-100 to-violet-200',
    textColor: 'text-indigo-700',
    title: 'Protection juridique',
    tagline: 'Litiges vie privée, voisinage, conso',
    status: 'optionnel',
    covers: ['Conseil juridique illimité', 'Frais d\'avocat et d\'expertise', 'Litiges consommation, travail, voisinage', 'Recouvrement de dommages-intérêts'],
    audience: 'Particuliers, locataires, propriétaires, salariés',
    price: 'À partir de 8 €/mois',
    quote: '/contact?type=assurance&product=protection-juridique-perso',
  },
  {
    id: 'scolaire',
    icon: 'fa-graduation-cap',
    bgGradient: 'from-cyan-100 to-sky-200',
    textColor: 'text-cyan-700',
    title: 'Scolaire & Extra-scolaire',
    tagline: 'Enfant 24h/24 dans et hors école',
    status: 'recommande',
    covers: ['Accidents corporels école + trajet', 'Activités extra-scolaires (sport, club)', 'Vol et casse de matériel', 'Couvre toute l\'année + vacances'],
    audience: 'Parents d\'enfants scolarisés (maternelle → université)',
    price: 'À partir de 12 €/an',
    quote: '/contact?type=assurance&product=scolaire',
  },
  {
    id: 'gli',
    icon: 'fa-building-user',
    bgGradient: 'from-orange-100 to-red-200',
    textColor: 'text-orange-700',
    title: 'Loyers impayés (GLI)',
    tagline: 'Propriétaires bailleurs',
    status: 'recommande',
    covers: ['Garantie loyers impayés jusqu\'à 96 000 €', 'Dégradations locataire', 'Protection juridique', 'PNO (Propriétaire Non Occupant)'],
    audience: 'Bailleurs particuliers · locations meublées, nues, saisonnières',
    price: '2 à 4 % du loyer annuel',
    quote: '/contact?type=assurance&product=gli',
  },
];

const ENTREPRISES = [
  {
    id: 'rc-pro',
    icon: 'fa-shield-halved',
    bgGradient: 'from-secondary/20 to-indigo-300',
    textColor: 'text-secondary',
    title: 'RC Professionnelle',
    tagline: 'Couvre les dommages causés à vos clients',
    status: 'obligatoire',
    promo: '3 mois offerts',
    covers: ['Erreurs, omissions, négligences', 'Dommages corporels et matériels', 'Frais de défense juridique', 'Couverture monde entier (option)'],
    audience: 'Médical, immobilier, conseil, formation, transport',
    price: '250 à 2 000 €/an',
    fastQuote: '/assurance/rc-pro/devis',
    quote: '/contact?type=assurance&product=rc-pro',
  },
  {
    id: 'multirisque-pro',
    icon: 'fa-building-shield',
    bgGradient: 'from-slate-200 to-blue-300',
    textColor: 'text-primary',
    title: 'Multirisque pro',
    tagline: 'Locaux, matériel & pertes d\'exploitation',
    status: 'recommande',
    covers: ['Incendie, dégât des eaux, catastrophes', 'Vol et vandalisme', 'Bris de machine', 'Pertes d\'exploitation (12-24 mois)'],
    audience: 'Commerçants, restaurateurs, artisans avec local',
    price: '400 à 3 000 €/an',
    quote: '/contact?type=assurance&product=multirisque',
  },
  {
    id: 'decennale',
    icon: 'fa-hard-hat',
    bgGradient: 'from-amber-200 to-orange-300',
    textColor: 'text-amber-800',
    title: 'Décennale BTP',
    tagline: 'Loi Spinetta — 10 ans après réception',
    status: 'obligatoire',
    promo: '3 mois offerts',
    covers: ['Dommages compromettant la solidité', 'Désordres rendant l\'ouvrage impropre', 'Étanchéité (toiture, façades)', 'Sous-traitants couverts'],
    audience: 'Tous les métiers du bâtiment (loi 4 janvier 1978)',
    price: '1 200 à 3 000 €/an',
    quote: '/contact?type=assurance&product=decennale',
  },
  {
    id: 'cyber',
    icon: 'fa-shield-virus',
    bgGradient: 'from-violet-200 to-purple-300',
    textColor: 'text-violet-700',
    title: 'Cyber-risques',
    tagline: 'Exigée par 70% des appels d\'offres B2B',
    status: 'recommande',
    covers: ['Rançongiciel : remédiation + extorsion', 'Pertes d\'exploitation (arrêt SI)', 'Notifications RGPD & frais CNIL', 'Cyber-fraude (faux IBAN, président)'],
    audience: 'TPE/PME numériques, e-commerce, cabinets données sensibles',
    price: '500 à 2 000 €/an',
    quote: '/contact?type=assurance&product=cyber',
  },
  {
    id: 'flotte',
    icon: 'fa-truck-fast',
    bgGradient: 'from-emerald-200 to-teal-300',
    textColor: 'text-emerald-700',
    title: 'Flotte automobile',
    tagline: 'À partir de 3 véhicules — économie 15-30%',
    status: 'obligatoire',
    covers: ['Tous risques flotte (1 seul contrat)', 'Marchandises transportées', 'Conducteurs (gestion centralisée)', 'Auto-mission / déplacements pro'],
    audience: 'Entreprises avec 3+ véhicules : VL, VU, poids lourds',
    price: 'Économie 15-30 % vs contrats individuels',
    quote: '/contact?type=assurance&product=flotte',
  },
  {
    id: 'protection-juridique',
    icon: 'fa-gavel',
    bgGradient: 'from-sky-200 to-blue-300',
    textColor: 'text-sky-700',
    title: 'Protection juridique pro',
    tagline: 'Litiges clients, fournisseurs, fiscal',
    status: 'recommande',
    covers: ['Conseil juridique illimité', 'Frais d\'avocat et d\'expertise', 'Recouvrement de créances', 'Contrôle URSSAF / fiscal'],
    audience: 'TPE sans juriste interne',
    price: '150 à 600 €/an',
    quote: '/contact?type=assurance&product=protection-juridique-pro',
  },
  {
    id: 'homme-cle',
    icon: 'fa-user-shield',
    bgGradient: 'from-rose-200 to-pink-300',
    textColor: 'text-rose-700',
    title: 'Homme-clé & associé',
    tagline: 'Si le dirigeant disparaît, l\'entreprise tient',
    status: 'recommande',
    covers: ['Capital en cas de décès/invalidité du dirigeant', 'Assurance croisée entre associés', 'Indemnité de perte d\'activité', 'Rachat de parts par les survivants'],
    audience: 'SARL, SAS, SCI avec dirigeants indispensables',
    price: '~5 ans de CA en capital assuré',
    quote: '/contact?type=assurance&product=homme-cle',
  },
  {
    id: 'do',
    icon: 'fa-user-tie',
    bgGradient: 'from-slate-200 to-slate-400',
    textColor: 'text-slate-700',
    title: 'D&O — Mandataires sociaux',
    tagline: 'Faute de gestion du dirigeant',
    status: 'recommande',
    covers: ['Mise en cause personnelle du dirigeant', 'Frais de défense (avocat, expert)', 'Indemnités à verser aux tiers', 'Procédures collectives & ITPC'],
    audience: 'Dirigeants SAS, SARL, SA · administrateurs',
    price: '600 à 2 500 €/an',
    quote: '/contact?type=assurance&product=do',
  },
  {
    id: 'mutuelle-collective',
    icon: 'fa-user-doctor',
    bgGradient: 'from-teal-200 to-emerald-300',
    textColor: 'text-teal-700',
    title: 'Mutuelle collective',
    tagline: 'Obligatoire ANI depuis 2016',
    status: 'obligatoire',
    promo: '3 mois offerts',
    covers: ['Panier de soins minimum ANI', 'Hospitalisation, optique, dentaire', 'Médecines douces (option)', 'Conjoint et enfants en option'],
    audience: 'Toute entreprise avec au moins 1 salarié',
    price: '30 à 80 €/mois/salarié',
    quote: '/contact?type=assurance&product=mutuelle-collective',
  },
  {
    id: 'prevoyance-collective',
    icon: 'fa-piggy-bank',
    bgGradient: 'from-indigo-200 to-violet-300',
    textColor: 'text-indigo-700',
    title: 'Prévoyance & Madelin',
    tagline: 'TNS, salariés, dirigeants',
    status: 'recommande',
    covers: ['Décès, invalidité, incapacité salariés', 'Madelin TNS (déductible fiscal)', 'PER Entreprise (PERECO, PERO)', 'Indemnités de fin de carrière'],
    audience: 'TNS · entreprises avec convention prévoyance',
    price: '0,8 à 2,5 % de la masse salariale',
    quote: '/contact?type=assurance&product=prevoyance-collective',
  },
];

const STATUS_BADGE = {
  obligatoire: { label: 'Obligatoire', cls: 'bg-red-100 text-red-700' },
  recommande:  { label: 'Recommandée', cls: 'bg-amber-100 text-amber-700' },
  optionnel:   { label: 'Optionnelle', cls: 'bg-slate-100 text-slate-600' },
};

function InsuranceCard({ data }) {
  const badge = STATUS_BADGE[data.status] || STATUS_BADGE.optionnel;
  return (
    <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl border border-gray-100 hover:border-secondary/30 transition-all hover:-translate-y-1 overflow-hidden flex flex-col">
      {/* Illustration colorée Allianz-style */}
      <div className={`relative bg-linear-to-br ${data.bgGradient} h-40 flex items-center justify-center overflow-hidden`}>
        {/* Cercles décoratifs en arrière-plan */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/30 rounded-full blur-xl"></div>
        <div className="absolute -bottom-12 -left-8 w-28 h-28 bg-white/40 rounded-full blur-lg"></div>
        {/* Icône principale grosse */}
        <i className={`fa-solid ${data.icon} ${data.textColor} text-7xl relative z-10 group-hover:scale-110 transition-transform drop-shadow-sm`}></i>
        {/* Badge promo en haut à droite */}
        {data.promo && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
            <i className="fa-solid fa-gift mr-1 text-[8px]"></i>
            {data.promo}
          </div>
        )}
        {/* Badge statut en haut à gauche */}
        <div className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badge.cls}`}>
          {badge.label}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className={`text-2xl font-black mb-1 ${data.textColor}`}>{data.title}</h3>
        <p className="text-sm text-gray-500 mb-4">{data.tagline}</p>

        <ul className="space-y-1.5 mb-5 flex-1">
          {data.covers.slice(0, 3).map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
              <i className="fa-solid fa-check text-accent text-[10px] mt-1 shrink-0"></i>
              <span>{c}</span>
            </li>
          ))}
        </ul>

        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tarif</span>
            <span className="text-sm font-bold text-primary text-right">{data.price}</span>
          </div>
        </div>

        {/* Double CTA Allianz-style */}
        <div className="flex gap-2">
          {data.fastQuote ? (
            <Link
              href={data.fastQuote}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-secondary text-secondary text-xs font-bold rounded-full hover:bg-secondary hover:text-white transition-all"
            >
              <i className="fa-solid fa-bolt text-[10px]"></i>
              Tarif rapide
            </Link>
          ) : null}
          <Link
            href={data.quote}
            className={`${data.fastQuote ? 'flex-1' : 'w-full'} inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/90 transition-all`}
          >
            <i className="fa-solid fa-file-lines text-[10px]"></i>
            Devis
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AssuranceClient() {
  const [segment, setSegment] = useState('particuliers');
  const items = segment === 'particuliers' ? PARTICULIERS : ENTREPRISES;

  return (
    <div className="min-h-screen">
      {/* ─── HERO ───────────────────────────────────────── */}
      <section className="pt-32 pb-12 sm:pb-16 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full mb-6">
              <span className="text-secondary font-semibold text-sm uppercase tracking-widest">Courtage indépendant · 20+ assureurs</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary mb-6 tracking-tight">
              Besoin d'un <span className="gradient-text">devis d'assurance</span> ?
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              22 types d'assurance pour particuliers et professionnels. Un seul interlocuteur Finarent, des contrats négociés sur-mesure.
            </p>
          </div>
        </div>
      </section>

      {/* ─── BANDEAU PROMO ──────────────────────────────── */}
      <section className="bg-emerald-50/80 border-y border-emerald-100">
        <div className="container mx-auto px-6 py-8 sm:py-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-base sm:text-lg text-primary leading-relaxed">
              En ce moment, jusqu'à <strong className="text-red-600 text-xl">2 mois offerts</strong> sur les assurances :
              <span className="text-gray-600"> auto, moto, habitation, garantie accidents de la vie, scolaire…</span>
              <br className="hidden sm:block" />
              et jusqu'à <strong className="text-red-600 text-xl">3 mois offerts</strong> sur l'assurance des professionnels.
              <span className="block text-xs text-gray-400 mt-2 italic">Offres soumises à conditions — voir détails ci-dessous.</span>
            </p>
            <Link
              href="/contact?fromInsurance=1&fast=1"
              className="mt-6 inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 hover:scale-105 transition-all shadow-lg"
            >
              <i className="fa-solid fa-bolt"></i>
              <span>Tarif auto en 1 min</span>
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SEGMENT TABS ───────────────────────────────── */}
      <section className="py-8 bg-white border-b border-gray-100 sticky top-0 z-20 backdrop-blur-md bg-white/90">
        <div className="container mx-auto px-6">
          <div className="flex justify-center">
            <div className="inline-flex bg-gray-100 rounded-2xl p-1.5">
              <button
                type="button"
                onClick={() => setSegment('particuliers')}
                className={`px-5 sm:px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                  segment === 'particuliers'
                    ? 'bg-white shadow-md text-primary'
                    : 'text-gray-500 hover:text-primary'
                }`}
              >
                <i className="fa-solid fa-user mr-2"></i>
                Particuliers <span className="ml-1 text-xs opacity-60">({PARTICULIERS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSegment('entreprises')}
                className={`px-5 sm:px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                  segment === 'entreprises'
                    ? 'bg-white shadow-md text-primary'
                    : 'text-gray-500 hover:text-primary'
                }`}
              >
                <i className="fa-solid fa-briefcase mr-2"></i>
                Pros & Entreprises <span className="ml-1 text-xs opacity-60">({ENTREPRISES.length})</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CARDS GRID (4 col Allianz-style) ───────────── */}
      <section className="py-12 sm:py-16 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {items.map((data) => <InsuranceCard key={data.id} data={data} />)}
          </div>
          <div className="text-center mt-10">
            <Link href="/contact?fromInsurance=1" className="text-sm font-semibold text-secondary hover:text-accent transition">
              → Voir les conditions des offres promotionnelles
            </Link>
          </div>
        </div>
      </section>

      {/* ─── POURQUOI FINARENT ──────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-accent/10 rounded-full mb-6">
                <span className="text-accent font-semibold text-sm uppercase tracking-widest">Pourquoi un courtier</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-primary mb-6 tracking-tight">
                Un courtier indépendant, pas un commercial.
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Finarent compare 20+ assureurs (Generali, Allianz, AXA, MMA, Macif, Maaf, Swiss Life, April, MetLife…) pour vous proposer la meilleure couverture au meilleur prix. Sans engagement, sans frais de dossier côté client.
              </p>
              <div className="space-y-5">
                {[
                  { icon: 'fa-handshake',     bg: 'bg-secondary/10', color: 'text-secondary', title: 'Un seul interlocuteur', desc: 'Vous nous appelez, on s\'occupe de tout : devis, comparaison, souscription, sinistres.' },
                  { icon: 'fa-clock',         bg: 'bg-accent/10',    color: 'text-accent',    title: 'Devis sous 48 h',       desc: 'Étude personnalisée et envoi du devis comparatif sous 2 jours ouvrés.' },
                  { icon: 'fa-scale-balanced',bg: 'bg-secondary/10', color: 'text-secondary', title: 'Tarifs négociés en gros', desc: 'Notre volume d\'affaires nous permet d\'obtenir 15 à 40 % d\'économies vs guichet.' },
                  { icon: 'fa-headset',       bg: 'bg-accent/10',    color: 'text-accent',    title: 'Sinistres gérés pour vous', desc: 'On déclare, on suit, on relance. Vous restez focalisé sur votre métier.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                      <i className={`fa-solid ${item.icon} ${item.color} text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary mb-1">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary to-[#0F2748] rounded-3xl p-8 text-white shadow-2xl">
              <div className="mb-8">
                <div className="text-xs font-bold uppercase tracking-widest text-accent mb-3">Finarent · Courtier ORIAS</div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4 leading-tight">Financement + Assurance, c'est plus malin avec un seul interlocuteur.</h3>
                <p className="text-white/80 leading-relaxed">
                  Quand on finance votre projet, on optimise aussi son assurance (emprunteur, flotte, multirisque). Cohérence garantie, économies cumulées.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                  <div className="text-3xl font-black text-accent">20+</div>
                  <div className="text-xs text-white/70 mt-1">Assureurs partenaires</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                  <div className="text-3xl font-black text-accent">48 h</div>
                  <div className="text-xs text-white/70 mt-1">Devis garanti</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                  <div className="text-3xl font-black text-accent">−30 %</div>
                  <div className="text-xs text-white/70 mt-1">Économies moyennes</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                  <div className="text-3xl font-black text-accent">0 €</div>
                  <div className="text-xs text-white/70 mt-1">Frais côté client</div>
                </div>
              </div>
              <Link href="/contact?fromInsurance=1" className="block bg-white text-primary font-bold py-4 rounded-xl text-center hover:bg-accent hover:text-white transition-all">
                Démarrer mon étude gratuite →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROCESSUS 3 ÉTAPES ─────────────────────────── */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 via-white to-secondary/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-primary mb-4 tracking-tight">Obtenez votre devis en 3 étapes</h2>
            <p className="text-lg text-gray-600">100 % en ligne ou par téléphone, comme vous préférez.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {[
              { step: '1', icon: 'fa-pen-to-square', title: 'Décrivez votre besoin', desc: 'Formulaire en ligne 3 min ou appel avec un conseiller.' },
              { step: '2', icon: 'fa-magnifying-glass', title: 'Étude personnalisée', desc: 'On compare 20+ assureurs et on négocie pour vous.' },
              { step: '3', icon: 'fa-file-signature', title: 'Devis & souscription', desc: 'Comparatif clair, souscription en ligne, contrat sous 48 h.' },
            ].map((item) => (
              <div key={item.step} className="relative text-center bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                  <i className={`fa-solid ${item.icon} text-white text-2xl`}></i>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">{item.step}</div>
                <h3 className="text-xl font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ──────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-secondary/10 via-white to-accent/10">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-primary mb-6 tracking-tight">Protégez ce qui compte aujourd'hui.</h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Un courtier indépendant, des contrats sur-mesure, 0 € de frais. Devis gratuit en 48 h.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/contact?fromInsurance=1" className="btn-primary inline-flex items-center gap-2">
                <i className="fa-solid fa-file-lines"></i>
                <span>Demander un devis</span>
              </Link>
              <Link href="/contact" className="btn-outline inline-flex items-center gap-2">
                <i className="fa-solid fa-phone"></i>
                <span>Nous appeler</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
