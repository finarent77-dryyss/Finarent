import { describe, it, expect } from 'vitest';
import { calculateScore } from '@/lib/scoring.js';

/**
 * Le score de pré-qualification oriente le traitement commercial d'une demande.
 * Trois de ses six composantes sont aujourd'hui des valeurs figées, faute des
 * champs correspondants au schéma (constat P2-9) : ces tests décrivent le
 * comportement réel, y compris ses limites, pour qu'un changement de barème
 * soit un choix visible et non un effet de bord.
 */

const demandeVide = {};
const tousLesDocuments = [{ type: 'KBIS' }, { type: 'RIB' }, { type: 'CNI' }];

describe('calculateScore — barème', () => {
  it('attribue 44 points à une demande sans forme juridique, secteur ni document', () => {
    // 10 ancienneté + 12 ratio CA + 8 forme par défaut + 8 effectif + 0 doc + 6 secteur
    const { score, label } = calculateScore(demandeVide, []);
    expect(score).toBe(44);
    expect(label).toBe('moyen');
  });

  it('valorise les formes sociétaires au-dessus de l entreprise individuelle', () => {
    const sas = calculateScore({ legalForm: 'SAS' }, []).score;
    const eurl = calculateScore({ legalForm: 'EURL' }, []).score;
    const ei = calculateScore({ legalForm: 'EI' }, []).score;
    const auto = calculateScore({ legalForm: 'Auto-entrepreneur' }, []).score;
    expect(sas).toBeGreaterThan(eurl);
    expect(eurl).toBeGreaterThan(ei);
    expect(ei).toBeGreaterThan(auto);
  });

  it('retombe sur une valeur par défaut pour une forme juridique inconnue', () => {
    expect(calculateScore({ legalForm: 'SCOP' }, []).details.legalForm).toBe(8);
  });

  it('accorde les 15 points de complétude quand KBIS, RIB et CNI sont fournis', () => {
    expect(calculateScore(demandeVide, tousLesDocuments).details.documents).toBe(15);
  });

  it('proratise la complétude documentaire', () => {
    expect(calculateScore(demandeVide, []).details.documents).toBe(0);
    expect(calculateScore(demandeVide, [{ type: 'KBIS' }]).details.documents).toBe(5);
    expect(calculateScore(demandeVide, [{ type: 'KBIS' }, { type: 'RIB' }]).details.documents).toBe(10);
  });

  it('ignore les documents hors liste requise', () => {
    const avecIntrus = calculateScore(demandeVide, [{ type: 'KBIS' }, { type: 'AUTRE' }, { type: 'BILAN' }]);
    expect(avecIntrus.details.documents).toBe(5);
  });

  it('différencie les secteurs', () => {
    expect(calculateScore({ sector: 'medical' }, []).details.sector).toBe(10);
    expect(calculateScore({ sector: 'restaurant' }, []).details.sector).toBe(5);
    expect(calculateScore({ sector: 'inconnu' }, []).details.sector).toBe(6);
  });
});

describe('calculateScore — libellés', () => {
  it('classe « moyen » à partir de 40 points', () => {
    expect(calculateScore(demandeVide, []).label).toBe('moyen');
  });

  it('classe « bon » à partir de 60 points', () => {
    const { score, label } = calculateScore(
      { legalForm: 'SAS', sector: 'medical' },
      tousLesDocuments,
    );
    expect(score).toBe(70);
    expect(label).toBe('bon');
  });

  it('ne dépasse jamais 100', () => {
    const { score } = calculateScore({ legalForm: 'SAS', sector: 'it' }, tousLesDocuments);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("le libellé « excellent » est aujourd'hui inatteignable", () => {
    // Meilleur cas possible : 10 + 12 + 15 (SAS) + 8 + 15 (docs) + 10 (médical) = 70.
    // Le seuil « excellent » est à 75 : aucune demande ne peut l atteindre tant que
    // ancienneté, chiffre d affaires et effectif restent des constantes (P2-9).
    const meilleurCas = calculateScore(
      { legalForm: 'SAS', sector: 'medical' },
      tousLesDocuments,
    );
    expect(meilleurCas.score).toBe(70);
    expect(meilleurCas.label).not.toBe('excellent');
  });

  it('expose le détail de chaque composante', () => {
    const { details } = calculateScore({ legalForm: 'SARL', sector: 'btp' }, [{ type: 'RIB' }]);
    expect(Object.keys(details).sort()).toEqual(
      ['anciennete', 'documents', 'effectif', 'legalForm', 'ratioCA', 'sector'].sort(),
    );
  });
});
