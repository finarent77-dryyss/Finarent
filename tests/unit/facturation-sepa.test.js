import { describe, it, expect } from 'vitest';
import { generateSepaXml, nextBusinessDay } from '@/lib/sepa-xml.js';
import {
  isValidIban,
  isValidSiret,
  affiliateDisplayName,
  computeAffiliatePayoutTTC,
} from '@/lib/affiliate-fiscal.js';

/**
 * Versement des commissions d'apport. Un fichier SEPA malformé est rejeté en
 * bloc par la banque, sans indication de la ligne fautive : le contrôle doit
 * donc se faire ici.
 */

const lotMinimal = {
  debtorName: 'FINARENT SAS',
  debtorIban: 'FR7630001007941234567890185',
  requestedExecutionDate: '2026-09-15',
  creditors: [
    { name: 'Jean Dupont', iban: 'FR7630006000011234567890189', amount: 250 },
  ],
};

describe('generateSepaXml — structure', () => {
  it('refuse un lot vide plutôt que de produire un fichier que la banque rejettera', () => {
    expect(() => generateSepaXml({ ...lotMinimal, creditors: [] })).toThrow(
      'Aucun virement dans le lot SEPA',
    );
  });

  it('produit un document pain.001.001.03', () => {
    const xml = generateSepaXml(lotMinimal);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('urn:iso:std:iso:20022:tech:xsd:pain.001.001.03');
    expect(xml).toContain('<PmtMtd>TRF</PmtMtd>');
    expect(xml).toContain('<ChrgBr>SLEV</ChrgBr>');
  });

  it('reporte la date d exécution demandée', () => {
    expect(generateSepaXml(lotMinimal)).toContain('<ReqdExctnDt>2026-09-15</ReqdExctnDt>');
  });

  it('déclare un BIC fictif quand celui du donneur d ordre est absent', () => {
    expect(generateSepaXml(lotMinimal)).toContain('<Id>NOTPROVIDED</Id>');
  });

  it('reprend le BIC du donneur d ordre quand il est fourni', () => {
    const xml = generateSepaXml({ ...lotMinimal, debtorBic: 'bnpafrpp' });
    expect(xml).toContain('<BIC>BNPAFRPP</BIC>');
  });
});

describe('generateSepaXml — totaux', () => {
  it('compte les transactions et somme les montants', () => {
    const xml = generateSepaXml({
      ...lotMinimal,
      creditors: [
        { name: 'A', iban: 'FR7630006000011234567890189', amount: 100.5 },
        { name: 'B', iban: 'FR7630006000011234567890189', amount: 249.5 },
        { name: 'C', iban: 'FR7630006000011234567890189', amount: 50 },
      ],
    });
    expect(xml).toContain('<NbOfTxs>3</NbOfTxs>');
    expect(xml).toContain('<CtrlSum>400.00</CtrlSum>');
  });

  it('formate les montants à deux décimales', () => {
    const xml = generateSepaXml({
      ...lotMinimal,
      creditors: [{ name: 'A', iban: 'FR7630006000011234567890189', amount: 1234.5 }],
    });
    expect(xml).toContain('<InstdAmt Ccy="EUR">1234.50</InstdAmt>');
  });

  it('génère une ligne par bénéficiaire', () => {
    const xml = generateSepaXml({
      ...lotMinimal,
      creditors: [
        { name: 'A', iban: 'FR7630006000011234567890189', amount: 10 },
        { name: 'B', iban: 'FR7630006000011234567890189', amount: 20 },
      ],
    });
    expect(xml.match(/<CdtTrfTxInf>/g)).toHaveLength(2);
  });
});

describe('generateSepaXml — assainissement des chaînes', () => {
  it('retire des noms les caractères hors jeu SEPA avant même de les échapper', () => {
    const xml = generateSepaXml({
      ...lotMinimal,
      debtorName: 'Dupont & Fils <SAS>',
      creditors: [{ name: 'A', iban: 'FR7630006000011234567890189', amount: 10 }],
    });
    expect(xml).not.toContain('<SAS>');
    expect(xml).toContain('<Nm>Dupont Fils SAS</Nm>');
  });

  it('ne laisse subsister aucune esperluette non échappée', () => {
    const xml = generateSepaXml({
      ...lotMinimal,
      debtorName: 'Dupont & Fils',
      creditors: [{ name: 'Martin & Cie', iban: 'FR7630006000011234567890189', amount: 10 }],
    });
    // Toute « & » restante doit ouvrir une entité XML valide.
    const esperluettes = xml.match(/&(?!(amp|lt|gt|quot|apos);)/g);
    expect(esperluettes).toBeNull();
  });

  it('translittère les accents, que la norme SEPA n admet pas', () => {
    const xml = generateSepaXml({
      ...lotMinimal,
      creditors: [{ name: 'Éléonore Ngô', iban: 'FR7630006000011234567890189', amount: 10 }],
    });
    expect(xml).toContain('<Nm>Eleonore Ngo</Nm>');
  });

  it('normalise l IBAN du bénéficiaire (espaces et casse)', () => {
    const xml = generateSepaXml({
      ...lotMinimal,
      creditors: [
        { name: 'A', iban: 'fr76 3000 6000 0112 3456 7890 189', amount: 10 },
      ],
    });
    expect(xml).toContain('<IBAN>FR7630006000011234567890189</IBAN>');
  });

  it('tronque une référence trop longue au lieu de produire un champ invalide', () => {
    const xml = generateSepaXml({
      ...lotMinimal,
      creditors: [
        { name: 'A', iban: 'FR7630006000011234567890189', amount: 10, reference: 'X'.repeat(300) },
      ],
    });
    const ustrd = xml.match(/<Ustrd>(.*?)<\/Ustrd>/)[1];
    expect(ustrd.length).toBeLessThanOrEqual(140);
  });
});

describe('nextBusinessDay', () => {
  it('ne retourne jamais un samedi ni un dimanche', () => {
    // Une semaine complète, quel que soit le jour de départ.
    for (let i = 0; i < 7; i++) {
      const depart = new Date(2026, 8, 7 + i); // septembre 2026
      const resultat = new Date(`${nextBusinessDay(depart)}T00:00:00Z`);
      expect(resultat.getUTCDay()).not.toBe(0);
      expect(resultat.getUTCDay()).not.toBe(6);
    }
  });

  it('renvoie une date au format ISO court', () => {
    expect(nextBusinessDay(new Date(2026, 8, 9))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('avance toujours d au moins un jour', () => {
    const depart = new Date(2026, 8, 9);
    expect(nextBusinessDay(depart) > depart.toISOString().slice(0, 10)).toBe(true);
  });
});

describe('isValidIban', () => {
  it('accepte un IBAN français, avec ou sans espaces', () => {
    expect(isValidIban('FR7630001007941234567890185')).toBe(true);
    expect(isValidIban('FR76 3000 1007 9412 3456 7890 185')).toBe(true);
    expect(isValidIban('fr7630001007941234567890185')).toBe(true);
  });

  it('refuse une chaîne trop courte, mal formée ou absente', () => {
    expect(isValidIban('FR76')).toBe(false);
    expect(isValidIban('1234567890123456')).toBe(false);
    expect(isValidIban('')).toBe(false);
    expect(isValidIban(null)).toBe(false);
  });
});

describe('isValidSiret', () => {
  it('accepte un SIRET dont la clé de Luhn est correcte', () => {
    expect(isValidSiret('35600000000048')).toBe(true);
    expect(isValidSiret('356 0000 0000 048')).toBe(true);
  });

  it('refuse un SIRET dont un chiffre a été altéré', () => {
    expect(isValidSiret('35600000000049')).toBe(false);
  });

  it('refuse ce qui n a pas 14 chiffres', () => {
    expect(isValidSiret('356000000')).toBe(false);
    expect(isValidSiret('3560000000004A')).toBe(false);
    expect(isValidSiret(null)).toBe(false);
  });
});

describe('affiliateDisplayName', () => {
  it('préfère la raison sociale', () => {
    expect(affiliateDisplayName({ legalName: 'DUPONT SAS', name: 'Jean', code: 'JD01' }))
      .toBe('DUPONT SAS');
  });

  it('retombe sur le nom, puis sur le code', () => {
    expect(affiliateDisplayName({ name: 'Jean', code: 'JD01' })).toBe('Jean');
    expect(affiliateDisplayName({ code: 'JD01' })).toBe('JD01');
  });

  it('ignore une raison sociale vide ou faite d espaces', () => {
    expect(affiliateDisplayName({ legalName: '   ', name: 'Jean', code: 'JD01' })).toBe('Jean');
  });
});

describe('computeAffiliatePayoutTTC', () => {
  it('applique 20 % de TVA quand l apporteur y est assujetti', () => {
    expect(computeAffiliatePayoutTTC(1000, true)).toEqual({
      vatRate: 20,
      vatAmount: 200,
      amountTTC: 1200,
    });
  });

  it('n applique aucune TVA sinon', () => {
    expect(computeAffiliatePayoutTTC(1000, false)).toEqual({
      vatRate: 0,
      vatAmount: 0,
      amountTTC: 1000,
    });
  });

  it('arrondit au centime, sans dérive de virgule flottante', () => {
    const { vatAmount, amountTTC } = computeAffiliatePayoutTTC(33.33, true);
    expect(vatAmount).toBe(6.67);
    expect(amountTTC).toBe(40);
  });

  it('gère un montant nul', () => {
    expect(computeAffiliatePayoutTTC(0, true).amountTTC).toBe(0);
  });
});
