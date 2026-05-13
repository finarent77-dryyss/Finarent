import { notFound } from 'next/navigation';
import { getSimulator, getCategory, SIMULATORS } from '@/lib/simulators/registry';
import SimulatorShell from '@/components/simulators/SimulatorShell';
import ComingSoonStub from '@/components/simulators/ComingSoonStub';

// ─── 38 simulateurs fonctionnels ─────────────────────────────
// Crédit immobilier
import MensualiteSimulator from '@/components/simulators/working/MensualiteSimulator';
import CapaciteEmpruntSimulator from '@/components/simulators/working/CapaciteEmpruntSimulator';
import CoutCreditSimulator from '@/components/simulators/working/CoutCreditSimulator';
import FraisNotaireSimulator from '@/components/simulators/working/FraisNotaireSimulator';
import TauxEndettementSimulator from '@/components/simulators/working/TauxEndettementSimulator';
import ResteAVivreSimulator from '@/components/simulators/working/ResteAVivreSimulator';
import TaegSimulator from '@/components/simulators/working/TaegSimulator';
import AmortissementSimulator from '@/components/simulators/working/AmortissementSimulator';
import CapitalRestantDuSimulator from '@/components/simulators/working/CapitalRestantDuSimulator';
import RemboursementAnticipeSimulator from '@/components/simulators/working/RemboursementAnticipeSimulator';
import ModulationSimulator from '@/components/simulators/working/ModulationSimulator';
import DiffereSimulator from '@/components/simulators/working/DiffereSimulator';
import RegroupementSimulator from '@/components/simulators/working/RegroupementSimulator';
import ComparateurBancaireSimulator from '@/components/simulators/working/ComparateurBancaireSimulator';
import FixeVsVariableSimulator from '@/components/simulators/working/FixeVsVariableSimulator';
import ApportPersonnelSimulator from '@/components/simulators/working/ApportPersonnelSimulator';
import PTZSimulator from '@/components/simulators/working/PTZSimulator';
import PretRelaisSimulator from '@/components/simulators/working/PretRelaisSimulator';
import PlusValueSimulator from '@/components/simulators/working/PlusValueSimulator';
import ValorisationSimulator from '@/components/simulators/working/ValorisationSimulator';

// Crédit conso / auto
import CreditConsoSimulator from '@/components/simulators/working/CreditConsoSimulator';
import CreditAutoSimulator from '@/components/simulators/working/CreditAutoSimulator';
import LOASimulator from '@/components/simulators/working/LOASimulator';
import LeasingSimulator from '@/components/simulators/working/LeasingSimulator';
import LeasingProSimulator from '@/components/simulators/working/LeasingProSimulator';

// Crédit professionnel
import PretProSimulator from '@/components/simulators/working/PretProSimulator';
import CapaciteFinancementProSimulator from '@/components/simulators/working/CapaciteFinancementProSimulator';
import AnalyseRevenusChargesSimulator from '@/components/simulators/working/AnalyseRevenusChargesSimulator';
import ScoringBancaireSimulator from '@/components/simulators/working/ScoringBancaireSimulator';

// Assurance emprunteur
import AssuranceEmprunteurSimulator from '@/components/simulators/working/AssuranceEmprunteurSimulator';
import AssuranceCrdSimulator from '@/components/simulators/working/AssuranceCrdSimulator';
import AssuranceCapitalInitialSimulator from '@/components/simulators/working/AssuranceCapitalInitialSimulator';
import ComparateurAssuranceSimulator from '@/components/simulators/working/ComparateurAssuranceSimulator';
import QuotiteSimulator from '@/components/simulators/working/QuotiteSimulator';
import CoEmprunteurSimulator from '@/components/simulators/working/CoEmprunteurSimulator';

// Assurances IARD & santé
import AssuranceAutoSimulator from '@/components/simulators/working/AssuranceAutoSimulator';
import AssuranceHabitationSimulator from '@/components/simulators/working/AssuranceHabitationSimulator';
import RcProSimulator from '@/components/simulators/working/RcProSimulator';
import SantePrevoyanceSimulator from '@/components/simulators/working/SantePrevoyanceSimulator';
import ComparateurIardSimulator from '@/components/simulators/working/ComparateurIardSimulator';
import CoutTotalAssuranceSimulator from '@/components/simulators/working/CoutTotalAssuranceSimulator';

const WORKING = {
  // Crédit immobilier
  'credit-immobilier/mensualite': MensualiteSimulator,
  'credit-immobilier/capacite-emprunt': CapaciteEmpruntSimulator,
  'credit-immobilier/cout-credit': CoutCreditSimulator,
  'credit-immobilier/frais-notaire': FraisNotaireSimulator,
  'credit-immobilier/taux-endettement': TauxEndettementSimulator,
  'credit-immobilier/reste-a-vivre': ResteAVivreSimulator,
  'credit-immobilier/taeg': TaegSimulator,
  'credit-immobilier/amortissement': AmortissementSimulator,
  'credit-immobilier/capital-restant-du': CapitalRestantDuSimulator,
  'credit-immobilier/remboursement-anticipe': RemboursementAnticipeSimulator,
  'credit-immobilier/modulation-echeances': ModulationSimulator,
  'credit-immobilier/differe': DiffereSimulator,
  'credit-immobilier/regroupement-credits': RegroupementSimulator,
  'credit-immobilier/comparateur-bancaire': ComparateurBancaireSimulator,
  'credit-immobilier/fixe-vs-variable': FixeVsVariableSimulator,
  'credit-immobilier/apport-personnel': ApportPersonnelSimulator,
  'credit-immobilier/ptz': PTZSimulator,
  'credit-immobilier/pret-relais': PretRelaisSimulator,
  'credit-immobilier/plus-value': PlusValueSimulator,
  'credit-immobilier/valorisation': ValorisationSimulator,
  // Crédit conso / auto
  'credit-conso-auto/credit-consommation': CreditConsoSimulator,
  'credit-conso-auto/credit-auto': CreditAutoSimulator,
  'credit-conso-auto/loa': LOASimulator,
  'credit-conso-auto/leasing': LeasingSimulator,
  'credit-conso-auto/leasing-pro': LeasingProSimulator,
  // Crédit professionnel
  'credit-professionnel/pret-professionnel': PretProSimulator,
  'credit-professionnel/capacite-financement-pro': CapaciteFinancementProSimulator,
  'credit-professionnel/analyse-revenus-charges': AnalyseRevenusChargesSimulator,
  'credit-professionnel/scoring-bancaire': ScoringBancaireSimulator,
  // Assurance emprunteur
  'assurance-emprunteur/assurance-emprunteur': AssuranceEmprunteurSimulator,
  'assurance-emprunteur/assurance-crd': AssuranceCrdSimulator,
  'assurance-emprunteur/assurance-capital-initial': AssuranceCapitalInitialSimulator,
  'assurance-emprunteur/comparateur-assurance': ComparateurAssuranceSimulator,
  'assurance-emprunteur/quotite': QuotiteSimulator,
  'assurance-emprunteur/co-emprunteur': CoEmprunteurSimulator,
  // Assurances IARD & santé
  'assurances/assurance-auto': AssuranceAutoSimulator,
  'assurances/assurance-habitation': AssuranceHabitationSimulator,
  'assurances/rc-pro': RcProSimulator,
  'assurances/sante-prevoyance': SantePrevoyanceSimulator,
  'assurances/comparateur-iard': ComparateurIardSimulator,
  'assurances/cout-total-assurance': CoutTotalAssuranceSimulator,
};

export function generateStaticParams() {
  return SIMULATORS.map((s) => ({ category: s.category, slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { category, slug } = await params;
  const sim = getSimulator(category, slug);
  if (!sim) return { title: 'Simulateur introuvable' };
  return {
    title: `Simulateur ${sim.name}`,
    description: sim.desc,
    alternates: { canonical: `/simulateurs/${category}/${slug}` },
    openGraph: {
      title: `Simulateur ${sim.name} | Finarent`,
      description: sim.desc,
      url: `/simulateurs/${category}/${slug}`,
      type: 'website',
    },
  };
}

export default async function SimulatorPage({ params }) {
  const { category, slug } = await params;
  const sim = getSimulator(category, slug);
  if (!sim) notFound();

  const key = `${category}/${slug}`;
  const Working = WORKING[key];

  return (
    <SimulatorShell category={category} simulator={sim}>
      {Working ? <Working /> : <ComingSoonStub simulator={sim} />}
    </SimulatorShell>
  );
}
