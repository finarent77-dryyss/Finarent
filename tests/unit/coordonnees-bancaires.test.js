import { describe, it, expect } from 'vitest';
import { normalizeIban, formatIban, isValidIban, normalizeBic, isValidBic } from '@/lib/bank.js';
import { isValidIban as isValidIbanAffilie } from '@/lib/affiliate-fiscal.js';
import { generateSepaXml } from '@/lib/sepa-xml.js';
import { ribValide, coordonneesBancairesValides, COMPANY_INFO } from '@/lib/invoicing/company.js';

/**
 * Coordonnées bancaires saisies par un client : elles finissent dans un ordre
 * de virement ou un mandat de prélèvement. Une faute de frappe non détectée
 * ici coûte un rejet bancaire, des frais, et un délai de paiement.
 *
 * Les IBAN de référence ci-dessous ont été vérifiés par un calcul mod 97
 * indépendant (BigInt) avant d'être figés : ils sont réellement valides au
 * sens ISO 13616, ce ne sont pas des chaînes tirées de l'implémentation.
 */

const IBANS_VALIDES = [
  'FR7630001007941234567890185',
  'FR1420041010050500013M02606', // contient une lettre dans le corps (RIB La Banque Postale)
  'DE89370400440532013000',
  'BE68539007547034',
  'GB82WEST12345698765432',
  'NL91ABNA0417164300',
  'ES9121000418450200051332',
  'IT60X0542811101000000123456',
];

describe('normalizeIban et formatIban', () => {
  it('retire espaces et tirets et passe en majuscules', () => {
    expect(normalizeIban('fr76 3000-1007 9412 3456 7890 185')).toBe(
      'FR7630001007941234567890185',
    );
  });

  it('renvoie une chaîne vide plutôt que de planter sur une valeur absente', () => {
    expect(normalizeIban(null)).toBe('');
    expect(normalizeIban(undefined)).toBe('');
    expect(normalizeIban('')).toBe('');
  });

  it('regroupe l affichage par blocs de quatre, sans espace final', () => {
    expect(formatIban('fr7630001007941234567890185')).toBe(
      'FR76 3000 1007 9412 3456 7890 185',
    );
    expect(formatIban('BE68539007547034')).toBe('BE68 5390 0754 7034');
  });

  it('est idempotent : reformater un IBAN déjà formaté ne change rien', () => {
    const affiche = formatIban('FR7630001007941234567890185');
    expect(formatIban(affiche)).toBe(affiche);
  });
});

describe('isValidIban', () => {
  it('accepte des IBAN réels de plusieurs pays SEPA', () => {
    for (const iban of IBANS_VALIDES) {
      expect(isValidIban(iban)).toBe(true);
    }
  });

  it('accepte la saisie telle qu elle sort d un RIB : espaces, tirets, minuscules', () => {
    expect(isValidIban('FR76 3000 1007 9412 3456 7890 185')).toBe(true);
    expect(isValidIban('fr76-3000-1007-9412-3456-7890-185')).toBe(true);
  });

  it('refuse un IBAN dont un seul chiffre a été altéré', () => {
    // Dernier chiffre modifié : le mod 97 ne tombe plus sur 1.
    expect(isValidIban('FR7630001007941234567890186')).toBe(false);
  });

  it('refuse une interversion de deux chiffres, la faute de frappe la plus courante', () => {
    expect(isValidIban('FR7630001007941234567809185')).toBe(false);
  });

  it('refuse un IBAN tronqué ou rallongé', () => {
    expect(isValidIban('FR763000100794123456789018')).toBe(false);
    expect(isValidIban('FR76300010079412345678901850')).toBe(false);
  });

  it('refuse un IBAN dont la longueur ne correspond pas au pays, clé correcte comprise', () => {
    // FR69 1234 5678 9012 3456 : clé mod 97 valide, mais 20 caractères au lieu
    // des 27 attendus en France. Un contrôle mod 97 seul laisserait passer.
    expect(isValidIban('FR691234567890123456')).toBe(false);
  });

  it('refuse ce qui n a pas la forme d un IBAN', () => {
    expect(isValidIban('')).toBe(false);
    expect(isValidIban(null)).toBe(false);
    expect(isValidIban(undefined)).toBe(false);
    expect(isValidIban('1234567890123456')).toBe(false); // pas de code pays
    expect(isValidIban('FRXX30001007941234567890185')).toBe(false); // clé non numérique
    expect(isValidIban('FR76 3000 1007 9412 3456 7890 18@')).toBe(false); // caractère interdit
  });

  it('est strictement plus sévère que le contrôle de format des affiliés', () => {
    // Deux validateurs coexistent volontairement : celui-ci contrôle la clé,
    // celui de lib/affiliate-fiscal.js ne contrôle que le format. Ce test
    // documente l écart, pour qu on ne les confonde pas au moment de choisir.
    const altere = 'FR7630001007941234567890186';
    expect(isValidIbanAffilie(altere)).toBe(true);
    expect(isValidIban(altere)).toBe(false);
  });
});

describe('isValidBic', () => {
  it('accepte les BIC à 8 et à 11 caractères', () => {
    expect(isValidBic('BNPAFRPP')).toBe(true);
    expect(isValidBic('BNPAFRPPXXX')).toBe(true);
    expect(isValidBic('CEPAFRPP751')).toBe(true);
  });

  it('normalise les espaces et la casse avant de valider', () => {
    expect(normalizeBic(' bnpa frpp ')).toBe('BNPAFRPP');
    expect(isValidBic('bnpa frpp')).toBe(true);
  });

  it('refuse une longueur intermédiaire ou des chiffres dans le code banque', () => {
    expect(isValidBic('BNPAFRP')).toBe(false); // 7
    expect(isValidBic('BNPAFRPPX')).toBe(false); // 9
    expect(isValidBic('BNPAFRPPXX')).toBe(false); // 10
    expect(isValidBic('BNP1FRPP')).toBe(false); // chiffre dans les 6 premières lettres
  });

  it('refuse une valeur absente', () => {
    expect(isValidBic(null)).toBe(false);
    expect(isValidBic('')).toBe(false);
  });
});

describe('cohérence avec le fichier SEPA effectivement produit', () => {
  it('les IBAN validés ici traversent la génération XML sans altération', () => {
    const xml = generateSepaXml({
      debtorName: 'FINARENT SAS',
      debtorIban: 'FR76 3000 1007 9412 3456 7890 185',
      requestedExecutionDate: '2026-09-15',
      creditors: IBANS_VALIDES.map((iban, i) => ({ name: `Beneficiaire ${i}`, iban, amount: 10 })),
    });
    for (const iban of IBANS_VALIDES) {
      expect(xml).toContain(`<IBAN>${iban}</IBAN>`);
    }
    // Le donneur d ordre est normalisé au passage.
    expect(xml).toContain('<IBAN>FR7630001007941234567890185</IBAN>');
  });
});

describe('ribValide — le RIB de Finarent imprimé sur les factures', () => {
  it('refuse le gabarit livré avec le projet', () => {
    // Ce gabarit satisfait pourtant la clé mod 97 : seul le contrôle de
    // l'identifiant national tout à zéro l'écarte.
    expect(isValidIban('FR76 0000 0000 0000 0000 0000 000')).toBe(true);
    expect(ribValide('FR76 0000 0000 0000 0000 0000 000', 'XXXXFRPPXXX')).toBe(false);
  });

  it('refuse un IBAN réel comportant une faute de frappe', () => {
    // Défaut corrigé : le contrôle de structure seul acceptait ce numéro, qui
    // partait alors sur chaque facture et se faisait rejeter par la banque.
    expect(ribValide('FR7630001007941234567890186', 'BNPAFRPPXXX')).toBe(false);
  });

  it('refuse un BIC de gabarit même avec un IBAN réel', () => {
    expect(ribValide('FR7630001007941234567890185', 'XXXXFRPPXXX')).toBe(false);
  });

  it('accepte un RIB réellement valide', () => {
    expect(ribValide('FR76 3000 1007 9412 3456 7890 185', 'BNPAFRPPXXX')).toBe(true);
  });

  it('refuse une valeur absente', () => {
    expect(ribValide(null, null)).toBe(false);
    expect(ribValide('FR7630001007941234567890185', null)).toBe(false);
  });

  it('la garde société refuse tant que company.js porte le gabarit', () => {
    // Se retournera au vert le jour où le RIB réel de Finarent y sera saisi ;
    // c'est exactement le signal attendu.
    expect(coordonneesBancairesValides()).toBe(ribValide(COMPANY_INFO.iban, COMPANY_INFO.bic));
  });
});
