import { describe, it, expect } from 'vitest';
import {
  monthlyPayment,
  totalCost,
  totalInterest,
  amortizationSchedule,
} from '@/lib/simulators/calculations/pret.js';

/**
 * Ces formules alimentent les 45 simulateurs publics. Un chiffre faux affiché
 * à un prospect est un engagement commercial : c'est la logique du projet où
 * une erreur coûte le plus cher.
 *
 * Les valeurs de référence exactes ne sont pas recopiées d'un tableur — elles
 * sont vérifiées par des invariants (le prêt se rembourse, l'inverse de la
 * mensualité redonne le capital), qui restent vrais si les formules changent
 * de forme mais faux si elles changent de sens.
 */

describe('monthlyPayment', () => {
  it('retourne 0 quand le capital ou la durée manque', () => {
    expect(monthlyPayment(0, 240, 3.5)).toBe(0);
    expect(monthlyPayment(200000, 0, 3.5)).toBe(0);
    expect(monthlyPayment(undefined, 240, 3.5)).toBe(0);
  });

  it('à taux nul, répartit le capital à parts égales', () => {
    expect(monthlyPayment(10000, 12, 0)).toBe(833); // arrondi de 833,33
    expect(monthlyPayment(24000, 24, 0)).toBe(1000);
  });

  it('produit une mensualité supérieure au capital divisé par la durée dès qu il y a un taux', () => {
    const sansInteret = 200000 / 240;
    expect(monthlyPayment(200000, 240, 3.5)).toBeGreaterThan(sansInteret);
  });

  it('croît avec le taux, à capital et durée constants', () => {
    const bas = monthlyPayment(200000, 240, 2);
    const haut = monthlyPayment(200000, 240, 4);
    expect(haut).toBeGreaterThan(bas);
  });

  it('décroît quand la durée s allonge, à capital et taux constants', () => {
    const court = monthlyPayment(200000, 120, 3.5);
    const long = monthlyPayment(200000, 300, 3.5);
    expect(long).toBeLessThan(court);
  });

  it('reste dans l ordre de grandeur attendu sur un cas courant', () => {
    // 200 000 € sur 20 ans à 3,5 % : ~1 160 €/mois.
    const m = monthlyPayment(200000, 240, 3.5);
    expect(m).toBeGreaterThan(1140);
    expect(m).toBeLessThan(1180);
  });
});

describe('totalCost et totalInterest', () => {
  it('multiplie la mensualité par la durée', () => {
    expect(totalCost(1000, 240)).toBe(240000);
  });

  it('déduit le capital pour isoler les intérêts', () => {
    expect(totalInterest(1160, 240, 200000)).toBe(78400);
  });

  it('ne renvoie jamais d intérêts négatifs, même quand l arrondi passe sous le capital', () => {
    // 833 × 12 = 9 996 < 10 000 : sans la borne, le coût serait négatif.
    expect(totalInterest(833, 12, 10000)).toBe(0);
  });
});

describe('amortizationSchedule', () => {
  it('retourne un tableau vide quand le capital ou la durée manque', () => {
    expect(amortizationSchedule(0, 240, 3.5)).toEqual([]);
    expect(amortizationSchedule(200000, 0, 3.5)).toEqual([]);
  });

  it('produit exactement une ligne par mois', () => {
    expect(amortizationSchedule(200000, 240, 3.5)).toHaveLength(240);
    expect(amortizationSchedule(50000, 60, 2.1)).toHaveLength(60);
  });

  it('rembourse le prêt : le capital restant tend vers zéro', () => {
    const lignes = amortizationSchedule(200000, 240, 3.5);
    const derniere = lignes[lignes.length - 1];
    // Tolérance d un euro par ligne, imputable aux arrondis mensuels.
    expect(derniere.remaining).toBeLessThan(240);
    expect(derniere.remaining).toBeGreaterThanOrEqual(0);
  });

  it('fait décroître le capital restant sans jamais remonter', () => {
    const lignes = amortizationSchedule(120000, 180, 3);
    for (let i = 1; i < lignes.length; i++) {
      expect(lignes[i].remaining).toBeLessThanOrEqual(lignes[i - 1].remaining);
    }
  });

  it('déplace la charge des intérêts vers le capital au fil du temps', () => {
    const lignes = amortizationSchedule(200000, 240, 3.5);
    const premiere = lignes[0];
    const derniere = lignes[lignes.length - 1];
    expect(premiere.interest).toBeGreaterThan(premiere.principal * 0.5);
    expect(derniere.interest).toBeLessThan(derniere.principal);
  });

  it('somme des parts de capital ≈ capital emprunté', () => {
    const montant = 200000;
    const lignes = amortizationSchedule(montant, 240, 3.5);
    const cumul = lignes.reduce((s, l) => s + l.principal, 0);
    expect(Math.abs(cumul - montant)).toBeLessThan(montant * 0.01);
  });
});
