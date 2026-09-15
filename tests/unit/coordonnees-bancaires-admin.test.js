import { describe, it, expect } from 'vitest';
import { validerCoordonneesBancaires } from '@/lib/invoicing/banque.js';
import { ribValide } from '@/lib/invoicing/company.js';

/**
 * Saisie du RIB de Finarent dans Admin › Paramètres. Ce qui passe ici est
 * imprimé sur chaque facture et sert de compte débiteur aux virements SEPA :
 * la validation doit refuser exactement ce que la garde `ribValide` refuse.
 */
describe('validerCoordonneesBancaires — RIB saisi dans Admin › Paramètres', () => {
  const RIB_REEL = {
    bankName: ' BNP Paribas ',
    holder: 'Finarent SAS',
    iban: 'fr76 3000 1007 9412 3456 7890 185',
    bic: 'bnpafrppxxx',
  };

  it('accepte un RIB réel et le normalise', () => {
    const { erreurs, donnees } = validerCoordonneesBancaires(RIB_REEL);
    expect(erreurs).toBeNull();
    expect(donnees).toEqual({
      bankName: 'BNP Paribas',
      holder: 'Finarent SAS',
      iban: 'FR7630001007941234567890185',
      bic: 'BNPAFRPPXXX',
    });
    expect(ribValide(donnees.iban, donnees.bic)).toBe(true);
  });

  it('refuse le gabarit livré avec le projet', () => {
    const { erreurs, donnees } = validerCoordonneesBancaires({
      bankName: 'BNP Paribas',
      iban: 'FR76 0000 0000 0000 0000 0000 000',
      bic: 'XXXXFRPPXXX',
    });
    expect(donnees).toBeNull();
    expect(erreurs).toHaveProperty('iban');
    expect(erreurs).toHaveProperty('bic');
  });

  it('refuse un IBAN dont la clé de contrôle est fausse', () => {
    const { erreurs } = validerCoordonneesBancaires({ ...RIB_REEL, iban: 'FR7630001007941234567890186' });
    expect(erreurs).toHaveProperty('iban');
  });

  it('exige le nom de la banque', () => {
    const { erreurs } = validerCoordonneesBancaires({ ...RIB_REEL, bankName: '   ' });
    expect(erreurs).toHaveProperty('bankName');
  });

  it('accepte un titulaire vide, enregistré comme absent', () => {
    const { erreurs, donnees } = validerCoordonneesBancaires({ ...RIB_REEL, holder: '' });
    expect(erreurs).toBeNull();
    expect(donnees.holder).toBeNull();
  });

  it('refuse un corps vide sans lever', () => {
    const { erreurs, donnees } = validerCoordonneesBancaires(undefined);
    expect(donnees).toBeNull();
    expect(Object.keys(erreurs)).toEqual(expect.arrayContaining(['bankName', 'iban', 'bic']));
  });
});
