import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  validerEtape,
  premiereEtapeInvalide,
  etapeMaximaleAutorisee,
  ETAPES_DE_SAISIE,
} from '@/app/espace/demande/validationEtapes.js';
import {
  lireBrouillon,
  enregistrerBrouillon,
  supprimerBrouillon,
  calculerEtapeInitiale,
  construireFormulaireInitial,
  construireFormulaireVierge,
} from '@/app/espace/demande/brouillonDemande.js';
import { DRAFT_KEY, STEPS } from '@/app/espace/demande/constantes.js';

/**
 * Assistant de dépôt de demande (/espace/demande).
 *
 * C'est le parcours qui porte le chiffre d'affaires, et l'étape 4 y recueille
 * l'acceptation des CGU : une demande partie sans cette acceptation est un
 * dossier sans base contractuelle. Les tests ci-dessous verrouillent le chemin
 * par lequel elle pouvait être contournée — un brouillon rouvert directement
 * sur le récapitulatif, où le bouton d'envoi ne validait rien.
 */

// Traduction identité : on vérifie les clés d'erreur, pas les libellés.
const t = (cle) => cle;

const UTILISATEUR = { name: 'Camille Dupont', email: 'camille@exemple.fr' };
const PROFIL = {
  name: 'Camille Dupont',
  email: 'camille@exemple.fr',
  company: '',
  legalForm: '',
  phone: '',
};

/** Formulaire entièrement rempli, CGU comprises sauf surcharge contraire. */
function formulaireComplet(surcharges = {}) {
  return {
    ...construireFormulaireVierge({ user: UTILISATEUR, dbUser: PROFIL }),
    productType: 'CREDIT_BAIL',
    equipmentType: 'Chariot élévateur',
    amount: '45000',
    duration: '48',
    description: '',
    companyName: 'Dupont Logistique',
    siren: '123456789',
    legalForm: 'SAS',
    sector: 'Transport & Logistique',
    name: 'Camille Dupont',
    phone: '06 12 34 56 78',
    terms: true,
    ...surcharges,
  };
}

// ─── Message d'erreur du SIREN ──────────────────────────

describe('validerEtape — étape entreprise', () => {
  it('signale un SIREN vide comme un champ manquant, pas comme un SIREN invalide', () => {
    const errs = validerEtape(2, formulaireComplet({ siren: '' }), t);
    expect(errs.siren).toBe('espace.wizard.errors.required');
  });

  it('traite une saisie faite uniquement d espaces comme un champ manquant', () => {
    const errs = validerEtape(2, formulaireComplet({ siren: '   ' }), t);
    expect(errs.siren).toBe('espace.wizard.errors.required');
  });

  it('signale un SIREN saisi mais mal formé comme invalide', () => {
    const errs = validerEtape(2, formulaireComplet({ siren: '12345' }), t);
    expect(errs.siren).toBe('espace.wizard.errors.invalidSiren');
  });

  it('accepte 9 chiffres (SIREN) comme 14 (SIRET), espaces compris', () => {
    expect(validerEtape(2, formulaireComplet({ siren: '123 456 789' }), t).siren).toBeUndefined();
    expect(validerEtape(2, formulaireComplet({ siren: '12345678900012' }), t).siren).toBeUndefined();
  });
});

// ─── Contournement de l'acceptation des CGU ─────────────

describe('premiereEtapeInvalide', () => {
  it('renvoie null quand toutes les étapes de saisie sont valides', () => {
    expect(premiereEtapeInvalide(formulaireComplet(), t)).toBeNull();
  });

  it('bloque sur l étape des CGU quand elles ne sont pas acceptées', () => {
    const blocage = premiereEtapeInvalide(formulaireComplet({ terms: false }), t);
    expect(blocage).not.toBeNull();
    expect(blocage.etape).toBe(3);
    expect(blocage.errors.terms).toBe('espace.wizard.errors.termsRequired');
  });

  it('remonte la première étape en défaut, pas la dernière', () => {
    // Entreprise incomplète ET CGU non acceptées : c'est l'entreprise qui doit
    // être signalée en premier, sinon l'utilisateur corrige à l'aveugle.
    const blocage = premiereEtapeInvalide(
      formulaireComplet({ companyName: '', terms: false }),
      t,
    );
    expect(blocage.etape).toBe(2);
    expect(blocage.errors.companyName).toBe('espace.wizard.errors.required');
  });

  it('ne couvre que les étapes de saisie, le récapitulatif n ayant pas de champ propre', () => {
    expect(ETAPES_DE_SAISIE).toBe(STEPS.length - 1);
  });
});

describe('etapeMaximaleAutorisee', () => {
  it('autorise le récapitulatif quand tout est valide', () => {
    expect(etapeMaximaleAutorisee(formulaireComplet(), t)).toBe(STEPS.length - 1);
  });

  it('ramène à l étape des CGU un formulaire complet mais non accepté', () => {
    expect(etapeMaximaleAutorisee(formulaireComplet({ terms: false }), t)).toBe(3);
  });

  it('ramène à l étape entreprise si une étape antérieure est incomplète', () => {
    expect(etapeMaximaleAutorisee(formulaireComplet({ legalForm: '' }), t)).toBe(2);
  });

  it('ramène à la première étape un formulaire vierge', () => {
    const vierge = construireFormulaireVierge({ user: UTILISATEUR, dbUser: PROFIL });
    expect(etapeMaximaleAutorisee(vierge, t)).toBe(0);
  });
});

// ─── Brouillon localStorage ─────────────────────────────

/** localStorage minimal, suffisant pour les fonctions testées. */
function installerStockage() {
  const donnees = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (cle) => (donnees.has(cle) ? donnees.get(cle) : null),
      setItem: (cle, valeur) => donnees.set(cle, String(valeur)),
      removeItem: (cle) => donnees.delete(cle),
    },
  };
  return donnees;
}

describe('brouillon de l assistant', () => {
  let stockage;

  beforeEach(() => {
    stockage = installerStockage();
  });

  afterEach(() => {
    delete globalThis.window;
  });

  it('n enregistre jamais l acceptation des CGU', () => {
    enregistrerBrouillon(null, formulaireComplet(), 4, 'camille@exemple.fr');
    const enregistre = JSON.parse(stockage.get(DRAFT_KEY));
    expect(enregistre.terms).toBeUndefined();
    expect(enregistre.step).toBe(4);
  });

  it('n écrase pas le brouillon quand un simulateur préremplit le formulaire', () => {
    enregistrerBrouillon(null, formulaireComplet(), 3, 'camille@exemple.fr');
    const avant = stockage.get(DRAFT_KEY);

    const prefill = { productType: 'LOA', amount: '20000' };
    enregistrerBrouillon(prefill, formulaireComplet({ companyName: 'Autre' }), 1, 'camille@exemple.fr');

    // La lecture renvoie null en présence d'un préremplissage : écrire ici
    // détruirait un brouillon que plus personne ne relirait jamais.
    expect(lireBrouillon(prefill, 'camille@exemple.fr')).toBeNull();
    expect(stockage.get(DRAFT_KEY)).toBe(avant);
  });

  it('ignore un brouillon appartenant à une autre adresse e-mail', () => {
    enregistrerBrouillon(null, formulaireComplet(), 2, 'autre@exemple.fr');
    expect(lireBrouillon(null, 'camille@exemple.fr')).toBeNull();
  });

  it('supprime le brouillon après envoi', () => {
    enregistrerBrouillon(null, formulaireComplet(), 2, 'camille@exemple.fr');
    supprimerBrouillon();
    expect(lireBrouillon(null, 'camille@exemple.fr')).toBeNull();
  });

  it('restaure le formulaire avec les CGU remises à « non acceptées »', () => {
    enregistrerBrouillon(null, formulaireComplet(), 4, 'camille@exemple.fr');
    const draft = lireBrouillon(null, 'camille@exemple.fr');
    const form = construireFormulaireInitial({
      prefill: null,
      draft,
      user: UTILISATEUR,
      dbUser: PROFIL,
    });
    expect(form.companyName).toBe('Dupont Logistique');
    expect(form.terms).toBe(false);
  });
});

// ─── Scénario complet du contournement ──────────────────

describe('brouillon rouvert au récapitulatif', () => {
  let stockage;

  beforeEach(() => {
    stockage = installerStockage();
  });

  afterEach(() => {
    delete globalThis.window;
  });

  it('ne permet pas d envoyer sans acceptation des CGU', () => {
    // 1. L'utilisateur remplit tout, accepte les CGU et atteint le récapitulatif.
    enregistrerBrouillon(null, formulaireComplet(), 4, 'camille@exemple.fr');
    expect(JSON.parse(stockage.get(DRAFT_KEY)).step).toBe(4);

    // 2. Il revient plus tard : le brouillon réclame l'étape d'index 4…
    const draft = lireBrouillon(null, 'camille@exemple.fr');
    const etapeSouhaitee = calculerEtapeInitiale(null, draft);
    expect(etapeSouhaitee).toBe(4);

    // … mais les CGU, elles, ne sont pas restaurées.
    const form = construireFormulaireInitial({
      prefill: null,
      draft,
      user: UTILISATEUR,
      dbUser: PROFIL,
    });
    expect(form.terms).toBe(false);

    // 3. L'assistant ne doit donc pas ouvrir sur le récapitulatif : l'étape
    //    restaurée est bornée à la première étape encore incomplète.
    const etapeOuverte = Math.min(etapeSouhaitee, etapeMaximaleAutorisee(form, t));
    expect(etapeOuverte).toBe(3);

    // 4. Et si l'étape était forcée malgré tout, la garde d'envoi refuse.
    const blocage = premiereEtapeInvalide(form, t);
    expect(blocage.etape).toBe(3);
    expect(blocage.errors.terms).toBe('espace.wizard.errors.termsRequired');
  });

  it('laisse envoyer une fois les CGU effectivement acceptées', () => {
    enregistrerBrouillon(null, formulaireComplet(), 4, 'camille@exemple.fr');
    const draft = lireBrouillon(null, 'camille@exemple.fr');
    const form = {
      ...construireFormulaireInitial({ prefill: null, draft, user: UTILISATEUR, dbUser: PROFIL }),
      terms: true,
    };
    expect(premiereEtapeInvalide(form, t)).toBeNull();
    expect(Math.min(calculerEtapeInitiale(null, draft), etapeMaximaleAutorisee(form, t))).toBe(4);
  });

  it('ne laisse pas non plus sauter la validation d une étape antérieure', () => {
    // Brouillon enregistré au récapitulatif alors que la forme juridique
    // manque : même raisonnement, l'assistant rouvre sur l'étape entreprise.
    enregistrerBrouillon(null, formulaireComplet({ legalForm: '' }), 4, 'camille@exemple.fr');
    const draft = lireBrouillon(null, 'camille@exemple.fr');
    const form = construireFormulaireInitial({
      prefill: null,
      draft,
      user: UTILISATEUR,
      dbUser: PROFIL,
    });
    expect(Math.min(calculerEtapeInitiale(null, draft), etapeMaximaleAutorisee(form, t))).toBe(2);
  });
});
