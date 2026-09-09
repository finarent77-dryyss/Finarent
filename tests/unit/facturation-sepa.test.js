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

/**
 * Cas limites du lot SEPA (complément) : ce sont les situations qui font
 * rejeter un fichier par la banque après coup, alors que sa structure paraît
 * correcte à la lecture.
 */

describe('generateSepaXml — identifiants du lot', () => {
  it('produit un identifiant de message différent à chaque génération', () => {
    const a = generateSepaXml(lotMinimal).match(/<MsgId>(.*?)<\/MsgId>/)[1];
    const b = generateSepaXml(lotMinimal).match(/<MsgId>(.*?)<\/MsgId>/)[1];
    expect(a).not.toBe(b);
  });

  it('respecte la limite de 35 caractères de la norme, même sur un identifiant imposé', () => {
    const xml = generateSepaXml({ ...lotMinimal, messageId: 'X'.repeat(80) });
    const msgId = xml.match(/<MsgId>(.*?)<\/MsgId>/)[1];
    expect(msgId).toHaveLength(35);
  });

  it('dérive un identifiant de bout en bout par virement, unique dans le lot', () => {
    const xml = generateSepaXml({
      ...lotMinimal,
      messageId: 'LOT-TEST-1',
      creditors: [
        { name: 'A', iban: 'FR7630006000011234567890189', amount: 10 },
        { name: 'B', iban: 'FR7630006000011234567890189', amount: 20 },
      ],
    });
    const ids = [...xml.matchAll(/<EndToEndId>(.*?)<\/EndToEndId>/g)].map((m) => m[1]);
    expect(ids).toEqual(['LOT-TEST-1-1', 'LOT-TEST-1-2']);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('assainit un identifiant de bout en bout fourni par l appelant', () => {
    const xml = generateSepaXml({
      ...lotMinimal,
      creditors: [
        { name: 'A', iban: 'FR7630006000011234567890189', amount: 10, endToEndId: 'Réf#2026/09' },
      ],
    });
    const e2e = xml.match(/<EndToEndId>(.*?)<\/EndToEndId>/)[1];
    expect(e2e).toBe('Ref 2026/09');
    expect(e2e.length).toBeLessThanOrEqual(35);
  });

  it('horodate le lot sans millisecondes, comme l attend pain.001', () => {
    const creDtTm = generateSepaXml(lotMinimal).match(/<CreDtTm>(.*?)<\/CreDtTm>/)[1];
    expect(creDtTm).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });
});

describe('generateSepaXml — montants et totaux', () => {
  it('reste cohérent sur un lot volumineux', () => {
    const creditors = Array.from({ length: 150 }, (_, i) => ({
      name: `Apporteur ${i}`,
      iban: 'FR7630006000011234567890189',
      amount: 12.5,
    }));
    const xml = generateSepaXml({ ...lotMinimal, creditors });
    expect(xml.match(/<CdtTrfTxInf>/g)).toHaveLength(150);
    expect(xml).toContain('<NbOfTxs>150</NbOfTxs>');
    expect(xml).toContain('<CtrlSum>1875.00</CtrlSum>');
  });

  it('reprend le BIC du bénéficiaire quand il est fourni, et l omet sinon', () => {
    const avec = generateSepaXml({
      ...lotMinimal,
      creditors: [
        { name: 'A', iban: 'FR7630006000011234567890189', amount: 10, bic: 'cepafrpp751' },
      ],
    });
    expect(avec).toContain('<CdtrAgt><FinInstnId><BIC>CEPAFRPP751</BIC></FinInstnId></CdtrAgt>');
    expect(generateSepaXml(lotMinimal)).not.toContain('<CdtrAgt>');
  });

  it('refuse un montant nul ou négatif au lieu de faire rejeter le lot entier', () => {
    // Un montant à 0 € (commission annulée mais laissée dans le lot) ou négatif
    // (régularisation) produisait un XML bien formé mais invalide au sens
    // pain.001, rejeté par la banque sans indication de la ligne fautive.
    // Le contrôle se fait donc ici, et le message nomme le bénéficiaire.
    expect(() =>
      generateSepaXml({
        ...lotMinimal,
        creditors: [{ name: 'A', iban: 'FR7630006000011234567890189', amount: 0 }],
      }),
    ).toThrow(/Montant nul ou négatif.*bénéficiaire 1 \(A\)/);

    expect(() =>
      generateSepaXml({
        ...lotMinimal,
        creditors: [
          { name: 'A', iban: 'FR7630006000011234567890189', amount: 10 },
          { name: 'B', iban: 'FR7630006000011234567890189', amount: -50 },
        ],
      }),
    ).toThrow(/bénéficiaire 2 \(B\)/);
  });

  it('refuse un montant illisible', () => {
    expect(() =>
      generateSepaXml({
        ...lotMinimal,
        creditors: [{ name: 'A', iban: 'FR7630006000011234567890189', amount: undefined }],
      }),
    ).toThrow(/Montant invalide/);
  });

  it('annonce un total strictement égal à la somme des lignes', () => {
    // Le total était arrondi APRÈS la somme, alors que chaque ligne l était
    // séparément : sur des commissions au demi-centime (calcul en pourcentage),
    // 33,335 + 66,665 donnait deux lignes à 100,01 € pour un CtrlSum de
    // 100,00 €, et la banque rejetait le fichier pour incohérence de total.
    // Les montants sont désormais arrondis une seule fois, en centimes entiers,
    // avant d alimenter à la fois <InstdAmt> et <CtrlSum>.
    const xml = generateSepaXml({
      ...lotMinimal,
      creditors: [
        { name: 'A', iban: 'FR7630006000011234567890189', amount: 33.335 },
        { name: 'B', iban: 'FR7630006000011234567890189', amount: 66.665 },
      ],
    });
    const montants = [...xml.matchAll(/<InstdAmt Ccy="EUR">(.*?)<\/InstdAmt>/g)].map((m) => m[1]);
    expect(montants).toEqual(['33.34', '66.67']);
    const lignes = montants.reduce((s, v) => s + Math.round(Number(v) * 100), 0);
    const totaux = [...xml.matchAll(/<CtrlSum>(.*?)<\/CtrlSum>/g)].map((m) => m[1]);
    // <CtrlSum> figure deux fois : en-tête de groupe et bloc de paiement.
    expect(totaux).toEqual(['100.01', '100.01']);
    expect(Math.round(Number(totaux[0]) * 100)).toBe(lignes);
  });

  it('garde total et lignes cohérents sur cent commissions au demi-centime', () => {
    // Cas réel : une commission calculée en pourcentage tombe très souvent sur
    // un demi-centime. C est en volume que la dérive faisait basculer le total.
    const creditors = Array.from({ length: 100 }, (_, i) => ({
      name: `Apporteur ${i}`,
      iban: 'FR7630006000011234567890189',
      amount: 12.345,
    }));
    const xml = generateSepaXml({ ...lotMinimal, creditors });
    const lignes = [...xml.matchAll(/<InstdAmt Ccy="EUR">(.*?)<\/InstdAmt>/g)].reduce(
      (s, m) => s + Math.round(Number(m[1]) * 100),
      0,
    );
    const total = Math.round(Number(xml.match(/<CtrlSum>(.*?)<\/CtrlSum>/)[1]) * 100);
    expect(total).toBe(lignes);
    expect(total).toBe(123500); // 100 × 12,35 €
  });
});

describe('generateSepaXml — entrées incomplètes', () => {
  it('nomme le champ manquant quand le donneur d ordre n a pas d IBAN', () => {
    // Ce cas remontait en TypeError brute (« Cannot read properties of
    // undefined »), illisible pour l administrateur qui lance le lot.
    expect(() => generateSepaXml({ ...lotMinimal, debtorIban: undefined })).toThrow(
      "IBAN manquant pour le donneur d'ordre",
    );
  });

  it('nomme le bénéficiaire quand c est le sien qui manque', () => {
    expect(() =>
      generateSepaXml({ ...lotMinimal, creditors: [{ name: 'A', amount: 10 }] }),
    ).toThrow(/IBAN manquant pour le bénéficiaire 1 \(A\)/);
    expect(() =>
      generateSepaXml({
        ...lotMinimal,
        creditors: [{ name: 'A', iban: '   ', amount: 10 }],
      }),
    ).toThrow(/IBAN manquant/);
  });

  it('refuse un bénéficiaire sans nom exploitable', () => {
    // Après translittération SEPA, « 東京 » ne laisse rien : <Nm> serait vide.
    expect(() =>
      generateSepaXml({
        ...lotMinimal,
        creditors: [{ name: '東京', iban: 'FR7630006000011234567890189', amount: 10 }],
      }),
    ).toThrow(/Nom manquant/);
  });

  it('retombe sur le prochain jour ouvré quand la date d exécution est absente', () => {
    // Absente, elle produisait « <ReqdExctnDt>undefined</ReqdExctnDt> ».
    const xml = generateSepaXml({ ...lotMinimal, requestedExecutionDate: undefined });
    const date = xml.match(/<ReqdExctnDt>(.*?)<\/ReqdExctnDt>/)[1];
    expect(date).toBe(nextBusinessDay());
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('refuse une date d exécution mal formée plutôt que de l écrire telle quelle', () => {
    expect(() =>
      generateSepaXml({ ...lotMinimal, requestedExecutionDate: '15/09/2026' }),
    ).toThrow(/Date d'exécution SEPA invalide/);
  });
});

describe('nextBusinessDay — semaine, mois, année', () => {
  it('reporte un vendredi au lundi suivant', () => {
    expect(nextBusinessDay(new Date(2026, 8, 11))).toBe('2026-09-14');
  });

  it('reporte samedi et dimanche au même lundi', () => {
    expect(nextBusinessDay(new Date(2026, 8, 12))).toBe('2026-09-14');
    expect(nextBusinessDay(new Date(2026, 8, 13))).toBe('2026-09-14');
  });

  it('avance d un jour en pleine semaine', () => {
    expect(nextBusinessDay(new Date(2026, 8, 10))).toBe('2026-09-11');
  });

  it('franchit un changement de mois', () => {
    expect(nextBusinessDay(new Date(2026, 8, 30))).toBe('2026-10-01');
  });

  it('franchit un changement d année en sautant le Jour de l an', () => {
    // Le 1er janvier 2027 est un vendredi férié : le lot part le lundi 4.
    expect(nextBusinessDay(new Date(2026, 11, 31))).toBe('2027-01-04');
  });

  it('saute les jours fériés fixes', () => {
    // Le 1er janvier n est pas un jour ouvré bancaire : le virement daté de ce
    // jour est différé ou rejeté selon l établissement.
    expect(nextBusinessDay(new Date(2026, 11, 31))).toBe('2027-01-04');
    // 30 avril 2027 (vendredi) → 1er mai férié, week-end → lundi 3 mai.
    expect(nextBusinessDay(new Date(2027, 3, 30))).toBe('2027-05-03');
    // 13 juillet 2026 (lundi) → 14 juillet férié → mercredi 15.
    expect(nextBusinessDay(new Date(2026, 6, 13))).toBe('2026-07-15');
    // 24 décembre 2026 (jeudi) → Noël, 26 décembre (TARGET2), week-end → lundi 28.
    expect(nextBusinessDay(new Date(2026, 11, 24))).toBe('2026-12-28');
  });

  it('saute les jours fériés mobiles, calés sur Pâques', () => {
    // Pâques 2027 : dimanche 28 mars. Depuis le jeudi 25, le week-end pascal
    // enchaîne Vendredi saint (26, TARGET2 fermé), samedi, dimanche et Lundi
    // de Pâques (29) : le premier jour ouvré est le mardi 30.
    expect(nextBusinessDay(new Date(2027, 2, 25))).toBe('2027-03-30');
    expect(nextBusinessDay(new Date(2027, 2, 28))).toBe('2027-03-30'); // Lundi de Pâques sauté
    expect(nextBusinessDay(new Date(2027, 4, 5))).toBe('2027-05-07'); // Ascension (6 mai) sautée
    expect(nextBusinessDay(new Date(2027, 4, 14))).toBe('2027-05-18'); // Lundi de Pentecôte sauté
  });

  it('ne renvoie jamais un jour férié, sur deux années complètes', () => {
    const FERIES_FIXES = ['01-01', '05-01', '05-08', '07-14', '08-15', '11-01', '11-11', '12-25', '12-26'];
    for (let i = 0; i < 730; i++) {
      const depart = new Date(2026, 0, 1 + i);
      const resultat = nextBusinessDay(depart);
      expect(FERIES_FIXES).not.toContain(resultat.slice(5));
      const jour = new Date(`${resultat}T00:00:00Z`).getUTCDay();
      expect(jour).not.toBe(0);
      expect(jour).not.toBe(6);
    }
  });
});
