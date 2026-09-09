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

/**
 * Compléments : les entrées réelles des colonnes chiffrées (pièces d'identité
 * scannées en base64, données de signature, notes libres) sont plus longues et
 * plus exotiques que les IBAN des cas ci-dessus.
 */

describe('encryptString / decryptString — entrées réelles', () => {
  it('restitue une charge longue sans troncature', () => {
    const long = 'A'.repeat(10000);
    expect(decryptString(encryptString(long))).toBe(long);
  });

  it('restitue les emoji et les caractères hors du plan multilingue de base', () => {
    const clair = 'Dossier ✅ signé 🔒 — 日本語 — 𝄞';
    expect(decryptString(encryptString(clair))).toBe(clair);
  });

  it('préserve les espaces et les retours à la ligne significatifs', () => {
    const clair = '  ligne 1\nligne 2\t fin  ';
    expect(decryptString(encryptString(clair))).toBe(clair);
  });

  it('restitue une chaîne contenant le séparateur de format', () => {
    // Le format de sortie est « v1:iv:tag:texte » : un texte clair truffé de
    // deux-points ne doit pas perturber le découpage au déchiffrement.
    const clair = 'v1:faux:chiffre:valeur';
    const chiffre = encryptString(clair);
    expect(chiffre.split(':')).toHaveLength(4);
    expect(decryptString(chiffre)).toBe(clair);
  });

  it('chiffre deux fois de suite sans perte : le chiffré est lui-même une donnée', () => {
    const clair = 'FR7630001007941234567890185';
    expect(decryptString(decryptString(encryptString(encryptString(clair))))).toBe(clair);
  });

  it('laisse passer une donnée héritée qui commence par « v1: »', () => {
    // L heuristique de migration se fiait au seul préfixe : une valeur en clair
    // commençant par « v1: » (peu probable mais possible dans une note libre)
    // était prise pour un chiffré et faisait lever une exception au lieu d être
    // retournée telle quelle. Le contrôle porte désormais sur la forme complète
    // — quatre segments base64, IV de 12 octets, tag de 16.
    expect(decryptString('v1:aaaa:bbbb:cccc')).toBe('v1:aaaa:bbbb:cccc');
    expect(decryptString('v1:pas-du-tout-chiffre')).toBe('v1:pas-du-tout-chiffre');
    expect(decryptString('v1: note libre du conseiller')).toBe('v1: note libre du conseiller');
    expect(isEncrypted('v1:pas-du-tout-chiffre')).toBe(false);
    expect(isEncrypted('v1:aaaa:bbbb:cccc')).toBe(false);
  });

  it('échoue toujours sur un chiffré tronqué, plutôt que de le rendre en clair', () => {
    // Une chaîne d alphabet base64 dont on ne peut pas identifier les segments
    // reste ambiguë : restituer un secret amputé serait pire qu échouer.
    expect(() => decryptString('v1:abc:def')).toThrow('Format chiffré invalide');
    const chiffre = encryptString('secret');
    const tronque = chiffre.split(':').slice(0, 3).join(':');
    expect(() => decryptString(tronque)).toThrow('Format chiffré invalide');
  });
});

describe('decryptJson — compléments', () => {
  it('restitue un tableau à la racine', () => {
    const valeur = [{ id: 1 }, { id: 2 }];
    expect(decryptJson(encryptJson(valeur))).toEqual(valeur);
  });

  it('retourne la chaîne brute quand le contenu déchiffré n est pas du JSON', () => {
    expect(decryptJson(encryptString('texte libre'))).toBe('texte libre');
  });

  it('retourne tel quel un JSON hérité stocké en clair', () => {
    expect(decryptJson('{"deja":"clair"}')).toEqual({ deja: 'clair' });
  });
});

describe('maskIban — bornes', () => {
  it('masque à partir de huit caractères significatifs', () => {
    expect(maskIban('FR761234')).toBe('FR76 *234'); // 8 caractères : un seul masqué
    expect(maskIban('FR76123')).toBe('FR76123'); // 7 : rendu tel quel
  });

  it('ne révèle jamais plus de sept caractères, quelle que soit la longueur', () => {
    for (const iban of ['FR7630001007941234567890185', 'MT84MALT011000012345MTLCAST001S']) {
      const visibles = maskIban(iban).replace(/\s/g, '').replace(/\*/g, '');
      expect(visibles).toHaveLength(7);
    }
  });
});
