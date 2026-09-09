import { describe, it, expect } from 'vitest';
import {
  approximateTaeg,
  monthlyPayment,
  formatEUR,
  formatPct,
} from '@/lib/simulators/calculations/pret.js';

/**
 * TAEG et mise en forme des montants.
 *
 * Le TAEG est la seule mesure légalement comparable entre deux offres (art.
 * L. 314-1 du code de la consommation) : il doit intégrer les frais et
 * l'assurance, et rester au moins égal au taux nominal. Les fonctions de
 * formatage, elles, produisent la chaîne effectivement lue par le prospect.
 *
 * Espaces : `Intl.NumberFormat('fr-FR')` insère des espaces insécables
 * (U+202F et U+00A0). Les comparaisons ci-dessous les normalisent plutôt que
 * de les recopier, pour ne pas casser au prochain changement d'ICU.
 */

const sansEspaces = (s) => s.replace(/\s/g, ' ');

describe('approximateTaeg', () => {
  it('retrouve le taux nominal quand il n y a ni frais ni assurance', () => {
    expect(approximateTaeg({ amount: 200000, months: 240, rate: 3.5 })).toBeCloseTo(3.5, 1);
  });

  it('dépasse toujours le taux nominal dès qu il y a des frais', () => {
    const nominal = 3.5;
    const avecFrais = approximateTaeg({ amount: 200000, months: 240, rate: nominal, fees: 1500 });
    expect(avecFrais).toBeGreaterThan(nominal);
  });

  it('croît avec les frais de dossier', () => {
    const taeg = [0, 500, 1500, 5000].map((fees) =>
      approximateTaeg({ amount: 200000, months: 240, rate: 3.5, fees }),
    );
    for (let i = 1; i < taeg.length; i++) {
      expect(taeg[i]).toBeGreaterThan(taeg[i - 1]);
    }
  });

  it('croît avec le taux d assurance', () => {
    const sans = approximateTaeg({ amount: 200000, months: 240, rate: 3.5 });
    const avec = approximateTaeg({ amount: 200000, months: 240, rate: 3.5, insuranceRate: 0.36 });
    expect(avec).toBeGreaterThan(sans);
    // 0,36 % d assurance sur 20 ans pèse environ un demi-point de TAEG.
    expect(avec - sans).toBeGreaterThan(0.4);
    expect(avec - sans).toBeLessThan(0.7);
  });

  it('reste crédible sur un crédit à la consommation', () => {
    // 15 000 € sur 4 ans à 6,9 %, 400 € de frais : le TAEG dépasse 8 %.
    const taeg = approximateTaeg({ amount: 15000, months: 48, rate: 6.9, fees: 400 });
    expect(taeg).toBeGreaterThan(7.9);
    expect(taeg).toBeLessThan(8.2);
  });

  it('rend un résultat à deux décimales', () => {
    const taeg = approximateTaeg({ amount: 200000, months: 240, rate: 3.5, fees: 1500 });
    expect(Math.round(taeg * 100)).toBe(taeg * 100);
  });

  it('chiffre un prêt à taux zéro assorti de frais de dossier', () => {
    // L inversion par Newton-Raphson divisait par (1 − (1+i)^−n), nul lorsque
    // i vaut 0, et rendait NaN. La recherche par dichotomie passe à la limite
    // i → 0 (mensualité = capital / durée) et reste définie partout.
    //
    // 10 000 € sur 12 mois, taux nominal nul : sans frais le crédit est
    // réellement gratuit, le TAEG vaut 0 %.
    expect(approximateTaeg({ amount: 10000, months: 12, rate: 0 })).toBe(0);
    // Avec 300 € de frais de dossier, le « crédit gratuit » ne l est plus :
    // le TAEG doit être strictement positif, c est tout l objet de l article
    // L. 314-1 du code de la consommation.
    const avecFrais = approximateTaeg({ amount: 10000, months: 12, rate: 0, fees: 300 });
    expect(avecFrais).toBeGreaterThan(0);
    expect(avecFrais).toBeCloseTo(5.42, 2);
  });

  it('ne descend jamais sous 0 %, malgré l arrondi à l euro de la mensualité', () => {
    // 10 000 / 12 = 833,33 € arrondis à 833 € : le total remboursé (9 996 €)
    // passe sous le capital et impliquerait un taux négatif. Le plancher est 0.
    expect(approximateTaeg({ amount: 10000, months: 12, rate: 0 })).toBe(0);
    expect(approximateTaeg({ amount: 10000, months: 12, rate: 0.01 })).toBeGreaterThanOrEqual(0);
  });

  it('refuse de répondre pour une durée nulle, plutôt que d annoncer 0 %', () => {
    // Aucun taux périodique n a de sens sans durée. NaN est ici délibéré : le
    // formatage l affiche « — » et non « 0,00 % », qui se lirait « gratuit ».
    expect(Number.isNaN(approximateTaeg({ amount: 100000, months: 0, rate: 3.5 }))).toBe(true);
    expect(formatPct(approximateTaeg({ amount: 100000, months: 0, rate: 3.5 }))).toBe('—');
  });

  it('retombe sur le taux nominal quand le montant est nul', () => {
    expect(approximateTaeg({ amount: 0, months: 240, rate: 3.5 })).toBe(3.5);
  });
});

describe('monthlyPayment — bornes non couvertes par le simulateur', () => {
  it('sur un seul mois, rembourse le capital majoré d un mois d intérêts', () => {
    // 10 000 € à 12 % annuel = 1 % mensuel : 10 100 €.
    expect(monthlyPayment(10000, 1, 12)).toBe(10100);
  });

  it('renvoie 0 pour un capital négatif au lieu d une mensualité négative', () => {
    // Cas réel : un apport supérieur au prix fait passer le montant financé
    // sous zéro dans les simulateurs qui soustraient l apport sans le borner.
    // La formule PMT propageait le signe et affichait « -437 € » de mensualité.
    expect(monthlyPayment(-5000, 12, 3.5)).toBe(0);
    expect(monthlyPayment(-5000, 12, 0)).toBe(0);
  });

  it('renvoie 0 pour une durée nulle ou négative, sans division par zéro', () => {
    expect(monthlyPayment(100000, 0, 3.5)).toBe(0);
    expect(monthlyPayment(100000, -12, 3.5)).toBe(0);
  });

  it('renvoie 0 plutôt que NaN sur des entrées non numériques', () => {
    expect(monthlyPayment(undefined, 240, 3.5)).toBe(0);
    expect(monthlyPayment(200000, 'douze', 3.5)).toBe(0);
  });

  it('traite un taux négatif sans lever d exception', () => {
    const m = monthlyPayment(100000, 120, -1);
    expect(Number.isFinite(m)).toBe(true);
    expect(m).toBeLessThan(100000 / 120);
  });
});

describe('formatEUR', () => {
  it('affiche un montant en euros, sans décimale', () => {
    expect(sansEspaces(formatEUR(1234.5))).toBe('1 235 €');
    expect(sansEspaces(formatEUR(1234567.89))).toBe('1 234 568 €');
  });

  it('affiche zéro et les montants négatifs', () => {
    expect(sansEspaces(formatEUR(0))).toBe('0 €');
    expect(sansEspaces(formatEUR(-1500))).toBe('-1 500 €');
  });

  it('remplace toute valeur non finie par « 0 € » plutôt que d afficher NaN', () => {
    for (const valeur of [NaN, Infinity, -Infinity, undefined, null, 'abc']) {
      expect(sansEspaces(formatEUR(valeur))).toBe('0 €');
    }
  });

  it('utilise la même espace insécable dans le repli que dans le format normal', () => {
    // Le repli était écrit « 0 € » en dur, avec une espace ordinaire, alors qu
    // Intl produit une espace insécable (U+00A0) : les deux s affichaient
    // pareil, mais `formatEUR(NaN) === formatEUR(0)` était faux, ce qui piège
    // toute comparaison de chaînes (déduplication, diff de devis, tests).
    expect(formatEUR(NaN)).toBe(formatEUR(0));
    expect(formatEUR(NaN)).toContain(' ');
    expect(formatEUR(0)).toContain(' ');
  });
});

describe('formatPct', () => {
  it('affiche deux décimales et une virgule décimale', () => {
    expect(formatPct(3.5)).toBe('3,50 %');
    expect(formatPct(3.456)).toBe('3,46 %');
    expect(formatPct(-1.5)).toBe('-1,50 %');
  });

  it('accepte un nombre de décimales imposé', () => {
    expect(formatPct(3.5, 0)).toBe('4 %');
    expect(formatPct(3.456, 3)).toBe('3,456 %');
  });

  it('affiche « — » pour une valeur non calculable, jamais « 0,00 % »', () => {
    // Le repli sur « 0,00 % » rendait un calcul raté indiscernable d une offre
    // à taux nul : le prospect lisait un taux de 0 % là où il n y avait aucun
    // taux. Un tiret cadratin ne peut être confondu avec un engagement.
    for (const valeur of [NaN, Infinity, -Infinity, null, undefined, 'abc', {}]) {
      expect(formatPct(valeur)).toBe('—');
    }
  });

  it('affiche bien « 0,00 % » pour un vrai zéro', () => {
    // Un taux réellement nul reste affiché comme tel : seul l indéfini bascule
    // sur « — ».
    expect(formatPct(0)).toBe('0,00 %');
    expect(formatPct(-0)).toBe('0,00 %');
  });
});
