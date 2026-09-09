import { describe, it, expect } from 'vitest';
import {
  encryptString,
  decryptString,
  encryptJson,
  decryptJson,
  isEncrypted,
  maskIban,
  maskTail,
} from '@/lib/crypto.js';

/**
 * Chiffrement applicatif des champs sensibles : IBAN des apporteurs, pièces
 * d'identité, données de signature. Deux exigences se testent ici — l'aller-
 * retour doit restituer exactement l'entrée, et une donnée altérée doit être
 * rejetée plutôt que déchiffrée de travers (c'est tout l'intérêt de GCM).
 */

describe('encryptString / decryptString', () => {
  it('restitue exactement la chaîne d origine', () => {
    const clair = 'FR7630001007941234567890185';
    expect(decryptString(encryptString(clair))).toBe(clair);
  });

  it('préserve les accents et les caractères non latins', () => {
    const clair = 'Éléonore Ngô — 1 rue de l’Église, 77000 Melun';
    expect(decryptString(encryptString(clair))).toBe(clair);
  });

  it('gère la chaîne vide', () => {
    expect(decryptString(encryptString(''))).toBe('');
  });

  it('propage null et undefined sans chiffrer', () => {
    expect(encryptString(null)).toBeNull();
    expect(encryptString(undefined)).toBeNull();
    expect(decryptString(null)).toBeNull();
  });

  it('produit un format versionné v1:iv:tag:ciphertext', () => {
    const chiffre = encryptString('secret');
    expect(chiffre.startsWith('v1:')).toBe(true);
    expect(chiffre.split(':')).toHaveLength(4);
  });

  it('produit un chiffré différent à chaque appel (vecteur d initialisation aléatoire)', () => {
    expect(encryptString('secret')).not.toBe(encryptString('secret'));
  });

  it('refuse une entrée qui n est pas une chaîne', () => {
    expect(() => encryptString(42)).toThrow(TypeError);
  });

  it('rejette un chiffré altéré au lieu de renvoyer des données fausses', () => {
    const chiffre = encryptString('montant: 1000');
    const [v, iv, tag, ct] = chiffre.split(':');
    // On modifie le dernier caractère du texte chiffré.
    const altere = `${v}:${iv}:${tag}:${ct.slice(0, -2)}${ct.slice(-2) === 'AA' ? 'AB' : 'AA'}`;
    expect(() => decryptString(altere)).toThrow();
  });

  it('rejette un format tronqué', () => {
    expect(() => decryptString('v1:abc:def')).toThrow('Format chiffré invalide');
  });

  it('laisse passer une donnée héritée non chiffrée, pour migration progressive', () => {
    expect(decryptString('FR76 3000 1007 94')).toBe('FR76 3000 1007 94');
  });
});

describe('encryptJson / decryptJson', () => {
  it('restitue un objet à l identique', () => {
    const objet = { iban: 'FR7630001007941234567890185', montant: 1250.5, actif: true };
    expect(decryptJson(encryptJson(objet))).toEqual(objet);
  });

  it('restitue les structures imbriquées et les tableaux', () => {
    const objet = { lignes: [{ ht: 100, tva: 20 }, { ht: 50, tva: 10 }], note: null };
    expect(decryptJson(encryptJson(objet))).toEqual(objet);
  });

  it('renvoie tel quel un objet déjà déchiffré (colonne JSONB héritée)', () => {
    const objet = { deja: 'clair' };
    expect(decryptJson(objet)).toBe(objet);
  });

  it('propage null', () => {
    expect(encryptJson(null)).toBeNull();
    expect(decryptJson(null)).toBeNull();
  });
});

describe('isEncrypted', () => {
  it('reconnaît une valeur produite par ce module', () => {
    expect(isEncrypted(encryptString('x'))).toBe(true);
  });

  it('ne se laisse pas abuser par une valeur en clair ou d un autre type', () => {
    expect(isEncrypted('FR7630001007941234567890185')).toBe(false);
    expect(isEncrypted(null)).toBe(false);
    expect(isEncrypted(42)).toBe(false);
    expect(isEncrypted({ v1: true })).toBe(false);
  });
});

describe('maskIban', () => {
  it('conserve les 4 premiers et 3 derniers caractères', () => {
    const masque = maskIban('FR7630001007941234567890185');
    expect(masque.startsWith('FR76')).toBe(true);
    expect(masque.replace(/\s/g, '').endsWith('185')).toBe(true);
    expect(masque).toContain('*');
  });

  it('ne laisse fuiter aucun chiffre du milieu', () => {
    const iban = 'FR7630001007941234567890185';
    const masque = maskIban(iban).replace(/\s/g, '');
    expect(masque.slice(4, -3)).toMatch(/^\*+$/);
  });

  it('ignore les espaces de saisie et normalise la casse', () => {
    expect(maskIban('fr76 3000 1007 9412 3456 7890 185')).toBe(
      maskIban('FR7630001007941234567890185'),
    );
  });

  it('renvoie une chaîne vide plutôt que de planter sur une entrée absente', () => {
    expect(maskIban(null)).toBe('');
    expect(maskIban(undefined)).toBe('');
    expect(maskIban(123)).toBe('');
  });

  it('ne masque pas une valeur trop courte pour être un IBAN', () => {
    expect(maskIban('FR76')).toBe('FR76');
  });
});

describe('maskTail', () => {
  it('ne conserve que les derniers caractères demandés', () => {
    expect(maskTail('12345678901234', 4)).toBe('**********1234');
  });

  it('laisse intacte une valeur plus courte que la longueur conservée', () => {
    expect(maskTail('123', 4)).toBe('123');
  });

  it('renvoie une chaîne vide sur entrée absente', () => {
    expect(maskTail(null)).toBe('');
  });
});
