import { describe, it, expect } from 'vitest';
import {
  snapDuration,
  inferProductType,
  canPrefillWizard,
  simulatorLabel,
  findSimulatorBySlug,
  buildPrefillFromParams,
} from '@/lib/simulators/prefill.js';

/**
 * Passage du simulateur public au formulaire de demande de financement.
 *
 * C'est la couture entre l'outil marketing et le dossier commercial : le
 * montant et la durée repris ici deviennent la demande que le prospect valide,
 * puis la base du devis. Un montant mal converti, c'est un dossier instruit sur
 * un chiffre que le client n'a jamais vu.
 */

describe('snapDuration', () => {
  it('ramène une durée à la valeur la plus proche du formulaire', () => {
    expect(snapDuration(12)).toBe(12);
    expect(snapDuration(13)).toBe(12);
    expect(snapDuration(59)).toBe(60);
    expect(snapDuration(84)).toBe(84);
  });

  it('tranche les ex æquo vers la durée la plus courte', () => {
    // 18 est à égale distance de 12 et 24 ; 30 de 24 et 36.
    expect(snapDuration(18)).toBe(12);
    expect(snapDuration(30)).toBe(24);
  });

  it('plafonne à 84 mois, la durée maximale proposée', () => {
    // Une simulation de prêt immobilier sur 20 ans arrive ici à 240 mois : le
    // wizard n a pas d option correspondante, la durée est ramenée à 84.
    expect(snapDuration(240)).toBe(84);
    expect(snapDuration(1000)).toBe(84);
  });

  it('accepte une durée transmise en chaîne par la query string', () => {
    expect(snapDuration('36')).toBe(36);
  });

  it('renvoie null pour une durée absente, nulle, négative ou illisible', () => {
    expect(snapDuration(0)).toBeNull();
    expect(snapDuration(-12)).toBeNull();
    expect(snapDuration(undefined)).toBeNull();
    expect(snapDuration('')).toBeNull();
    expect(snapDuration('trois ans')).toBeNull();
  });
});

describe('inferProductType', () => {
  it('associe chaque simulateur de location à son type de produit', () => {
    expect(inferProductType({ simulator: 'loa' })).toBe('LOA');
    expect(inferProductType({ simulator: 'leasing' })).toBe('LLD');
    expect(inferProductType({ simulator: 'leasing-pro' })).toBe('LEASING_OPS');
    expect(inferProductType({ simulator: 'rc-pro' })).toBe('RC_PRO');
  });

  it('retombe sur le prêt professionnel pour les autres catégories financées', () => {
    expect(inferProductType({ category: 'credit-immobilier' })).toBe('PRET_PRO');
    expect(inferProductType({ category: 'credit-professionnel' })).toBe('PRET_PRO');
  });

  it('donne la priorité au simulateur sur la catégorie', () => {
    expect(inferProductType({ simulator: 'loa', category: 'credit-immobilier' })).toBe('LOA');
  });

  it('renvoie une chaîne vide quand rien ne correspond, plutôt qu un type par défaut', () => {
    expect(inferProductType({})).toBe('');
    expect(inferProductType({ category: 'assurances' })).toBe('');
    expect(inferProductType({ simulator: 'simulateur-inconnu' })).toBe('');
  });
});

describe('canPrefillWizard', () => {
  it('exclut les simulateurs sans équivalent dans le formulaire', () => {
    expect(canPrefillWizard({ simulator: 'assurance-auto' })).toBe(false);
    expect(canPrefillWizard({ simulator: 'assurance-habitation' })).toBe(false);
    expect(canPrefillWizard({ simulator: 'cout-total-assurance' })).toBe(false);
  });

  it('autorise les simulateurs de financement et le cas sans simulateur', () => {
    expect(canPrefillWizard({ simulator: 'loa' })).toBe(true);
    expect(canPrefillWizard({ simulator: 'capacite-emprunt' })).toBe(true);
    expect(canPrefillWizard({})).toBe(true);
  });
});

describe('simulatorLabel', () => {
  it('reprend le nom officiel du registre', () => {
    expect(simulatorLabel('frais-notaire', 'credit-immobilier')).toBe('Frais de notaire');
    expect(simulatorLabel('loa')).toBe('LOA');
  });

  it('retrouve le simulateur même si la catégorie est fausse', () => {
    expect(simulatorLabel('loa', 'credit-immobilier')).toBe('LOA');
  });

  it('fabrique un libellé lisible pour un slug inconnu', () => {
    expect(simulatorLabel('mon-nouveau-simulateur')).toBe('Mon Nouveau Simulateur');
    expect(simulatorLabel(null)).toBe('');
  });

  it('findSimulatorBySlug ne retourne rien pour un slug absent', () => {
    expect(findSimulatorBySlug('inexistant')).toBeNull();
    expect(findSimulatorBySlug(null)).toBeNull();
    expect(findSimulatorBySlug('loa').category).toBe('credit-conso-auto');
  });
});

describe('buildPrefillFromParams', () => {
  it('ne préremplit rien quand il n y a aucun contexte exploitable', () => {
    expect(buildPrefillFromParams({})).toBeNull();
    expect(buildPrefillFromParams(null)).toBeNull();
    expect(buildPrefillFromParams(new URLSearchParams(''))).toBeNull();
  });

  it('convertit une simulation LOA en valeurs du formulaire', () => {
    const r = buildPrefillFromParams({ simulator: 'loa', amount: '25000.7', months: '30' });
    expect(r.productType).toBe('LOA');
    expect(r.amount).toBe('25001'); // arrondi à l euro, en chaîne pour l input
    expect(r.duration).toBe('24'); // 30 mois ramenés à une durée proposée
    expect(r.equipmentType).toBe('LOA');
    expect(r.fromSimulatorSlug).toBe('loa');
  });

  it('lit aussi bien un objet plat qu un URLSearchParams', () => {
    const params = new URLSearchParams({ simulator: 'leasing', amount: '48000', months: '48' });
    const r = buildPrefillFromParams(params);
    expect(r.productType).toBe('LLD');
    expect(r.amount).toBe('48000');
    expect(r.duration).toBe('48');
    expect(r.rawParams).toEqual({ simulator: 'leasing', amount: '48000', months: '48' });
  });

  it('conserve la durée réellement simulée dans la description, même si elle a été ramenée', () => {
    // La durée du formulaire vaut 24 mois, mais le prospect a simulé sur 30 :
    // la description garde la valeur d origine pour que le conseiller la voie.
    const r = buildPrefillFromParams({ simulator: 'loa', amount: '25000', months: '30' });
    expect(r.duration).toBe('24');
    expect(r.description).toContain('30 mois');
  });

  it('récapitule la simulation dans la description', () => {
    const r = buildPrefillFromParams({
      simulator: 'mensualite',
      category: 'credit-immobilier',
      amount: '200000',
      months: '60',
      rate: '3.5',
      monthly: '3640',
      totalCost: '218400',
    });
    expect(r.description).toContain('Simulation : Mensualité de crédit');
    expect(r.description).toContain('Taux : 3.50 %');
    expect(r.description.replace(/\s/g, ' ')).toContain('Montant : 200 000 €');
    expect(r.description.replace(/\s/g, ' ')).toContain('Coût total : 218 400 €');
  });

  it('accepte les montants sous leurs autres noms de paramètre', () => {
    expect(buildPrefillFromParams({ simulator: 'pret-relais', loanAmount: '90000' }).amount)
      .toBe('90000');
    expect(buildPrefillFromParams({ simulator: 'frais-notaire', propertyPrice: '310000' }).amount)
      .toBe('310000');
  });

  it('convertit une durée exprimée en années', () => {
    const r = buildPrefillFromParams({ simulator: 'credit-auto', amount: '30000', years: '5' });
    expect(r.duration).toBe('60');
  });

  it('bascule sur les champs RC Pro et abandonne le montant', () => {
    const r = buildPrefillFromParams({
      simulator: 'rc-pro',
      amount: '50000',
      ca: '250000',
      employees: '3',
      sector_rcpro: 'batiment',
    });
    expect(r.productType).toBe('RC_PRO');
    expect(r.amount).toBe(''); // un montant financé n a pas de sens pour une RC Pro
    expect(r.ca).toBe('250000');
    expect(r.employees).toBe('3');
    expect(r.sector_rcpro).toBe('BTP & Construction');
  });

  it('range un secteur non reconnu dans « Autre » plutôt que de le perdre', () => {
    const r = buildPrefillFromParams({ simulator: 'rc-pro', ca: '80000', sector: 'apiculture' });
    expect(r.sector_rcpro).toBe('Autre');
  });

  it('reconnaît les secteurs écrits sans accent ni majuscule', () => {
    const r = buildPrefillFromParams({ simulator: 'rc-pro', ca: '80000', sector: 'sante' });
    expect(r.sector_rcpro).toBe('Médical & Santé');
  });

  it('ignore un montant nul ou négatif au lieu de le recopier', () => {
    const r = buildPrefillFromParams({ simulator: 'loa', amount: '0', months: '36' });
    expect(r.amount).toBe('');
    expect(r.duration).toBe('36');
  });
});
