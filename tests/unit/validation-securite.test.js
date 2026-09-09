import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateSIREN,
  validateRequired,
} from '@/utils/validation.js';
import { checkRateLimit } from '@/lib/rateLimit.js';
import { safeEqual, isCronAuthorized } from '@/lib/cron-auth.js';
import { sniffMatchesMime } from '@/lib/file-signature.js';
import { STATUS_TO_LEGACY, STATUS_TO_DB, VALID_LEGACY_STATUSES } from '@/lib/statusMap.js';

/**
 * Validations d'entrée et gardes de sécurité. Ces fonctions sont la première
 * ligne entre un formulaire public et la base : leurs cas limites comptent
 * autant que leur cas nominal.
 */

describe('validateEmail', () => {
  it('accepte les adresses courantes', () => {
    expect(validateEmail('contact@finarent.com')).toBe(true);
    expect(validateEmail('jean.dupont+devis@sous-domaine.example.fr')).toBe(true);
  });

  it('refuse les adresses sans arobase, sans domaine ou avec espace', () => {
    expect(validateEmail('contact.finarent.com')).toBe(false);
    expect(validateEmail('contact@finarent')).toBe(false);
    expect(validateEmail('con tact@finarent.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('accepte les formats français usuels', () => {
    expect(validatePhone('0612345678')).toBe(true);
    expect(validatePhone('06 12 34 56 78')).toBe(true);
    expect(validatePhone('06.12.34.56.78')).toBe(true);
    expect(validatePhone('06-12-34-56-78')).toBe(true);
    expect(validatePhone('+33612345678')).toBe(true);
    expect(validatePhone('0033612345678')).toBe(true);
  });

  it('refuse un numéro trop court, trop long ou commençant par 0 après l indicatif', () => {
    expect(validatePhone('061234567')).toBe(false);
    expect(validatePhone('06123456789')).toBe(false);
    expect(validatePhone('0012345678')).toBe(false);
    expect(validatePhone('')).toBe(false);
  });
});

describe('validateSIREN', () => {
  it('accepte neuf chiffres, espaces compris', () => {
    expect(validateSIREN('931295836')).toBe(true);
    expect(validateSIREN('931 295 836')).toBe(true);
  });

  it('refuse un nombre de chiffres incorrect ou des lettres', () => {
    expect(validateSIREN('93129583')).toBe(false);
    expect(validateSIREN('9312958361')).toBe(false);
    expect(validateSIREN('93129583A')).toBe(false);
    expect(validateSIREN(null)).toBe(false);
  });
});

describe('validateRequired', () => {
  it('refuse une valeur vide ou faite d espaces', () => {
    expect(validateRequired('')).toBeFalsy();
    expect(validateRequired('   ')).toBeFalsy();
    expect(validateRequired('x')).toBeTruthy();
  });
});

describe('checkRateLimit', () => {
  // Chaque test utilise une IP distincte : le compteur est un module partagé.
  it('autorise les premières requêtes puis bloque au-delà du quota', () => {
    const options = { bucket: 'test-quota', max: 3 };
    expect(checkRateLimit('10.0.0.1', options)).toEqual({ allowed: true, remaining: 2 });
    expect(checkRateLimit('10.0.0.1', options)).toEqual({ allowed: true, remaining: 1 });
    expect(checkRateLimit('10.0.0.1', options)).toEqual({ allowed: true, remaining: 0 });
    expect(checkRateLimit('10.0.0.1', options)).toEqual({ allowed: false, remaining: 0 });
  });

  it('cloisonne les seaux : déposer une demande ne consomme pas le quota des devis', () => {
    const ip = '10.0.0.2';
    checkRateLimit(ip, { bucket: 'financement', max: 1 });
    expect(checkRateLimit(ip, { bucket: 'financement', max: 1 }).allowed).toBe(false);
    // Un autre usage doit repartir d un quota intact.
    expect(checkRateLimit(ip, { bucket: 'devis', max: 1 }).allowed).toBe(true);
  });

  it('cloisonne les adresses', () => {
    const options = { bucket: 'test-ip', max: 1 };
    expect(checkRateLimit('10.0.0.3', options).allowed).toBe(true);
    expect(checkRateLimit('10.0.0.3', options).allowed).toBe(false);
    expect(checkRateLimit('10.0.0.4', options).allowed).toBe(true);
  });

  it('rouvre le quota une fois la fenêtre écoulée', () => {
    vi.useFakeTimers();
    try {
      const options = { bucket: 'test-fenetre', max: 1, windowMs: 60_000 };
      expect(checkRateLimit('10.0.0.5', options).allowed).toBe(true);
      expect(checkRateLimit('10.0.0.5', options).allowed).toBe(false);
      vi.advanceTimersByTime(60_001);
      expect(checkRateLimit('10.0.0.5', options).allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('safeEqual', () => {
  it('reconnaît deux chaînes identiques', () => {
    expect(safeEqual('secret-partage', 'secret-partage')).toBe(true);
  });

  it('rejette une différence, même d un seul caractère', () => {
    expect(safeEqual('secret-partage', 'secret-partagf')).toBe(false);
  });

  it('rejette des longueurs différentes sans lever d exception', () => {
    expect(safeEqual('court', 'beaucoup-plus-long')).toBe(false);
  });

  it('rejette ce qui n est pas une chaîne', () => {
    expect(safeEqual(null, 'x')).toBe(false);
    expect(safeEqual(42, 42)).toBe(false);
    expect(safeEqual(undefined, undefined)).toBe(false);
  });
});

describe('isCronAuthorized', () => {
  const requete = (autorisation) => ({
    headers: { get: (nom) => (nom === 'authorization' ? autorisation : null) },
  });

  beforeEach(() => {
    delete process.env.CRON_SECRET;
  });

  it('refuse quand aucun secret n est configuré — le défaut est fermé', () => {
    expect(isCronAuthorized(requete('Bearer peu-importe'))).toBe(false);
  });

  it('accepte le bon secret', () => {
    process.env.CRON_SECRET = 'secret-de-test';
    expect(isCronAuthorized(requete('Bearer secret-de-test'))).toBe(true);
  });

  it('refuse un mauvais secret, un en-tête absent ou mal préfixé', () => {
    process.env.CRON_SECRET = 'secret-de-test';
    expect(isCronAuthorized(requete('Bearer mauvais-secret'))).toBe(false);
    expect(isCronAuthorized(requete(null))).toBe(false);
    expect(isCronAuthorized(requete('secret-de-test'))).toBe(false);
  });
});

describe('sniffMatchesMime', () => {
  const pdf = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
  const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const heic = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x18]),
    Buffer.from('ftypheic', 'ascii'),
  ]);
  const webp = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([0x00, 0x00, 0x00, 0x00]),
    Buffer.from('WEBP', 'ascii'),
  ]);
  const executable = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // en-tête MZ

  it('reconnaît chaque format autorisé par sa signature réelle', () => {
    expect(sniffMatchesMime(pdf, 'application/pdf')).toBe(true);
    expect(sniffMatchesMime(jpg, 'image/jpeg')).toBe(true);
    expect(sniffMatchesMime(png, 'image/png')).toBe(true);
    expect(sniffMatchesMime(heic, 'image/heic')).toBe(true);
    expect(sniffMatchesMime(webp, 'image/webp')).toBe(true);
  });

  it('démasque un exécutable renommé en .pdf', () => {
    expect(sniffMatchesMime(executable, 'application/pdf')).toBe(false);
  });

  it('démasque un PDF déclaré comme image', () => {
    expect(sniffMatchesMime(pdf, 'image/png')).toBe(false);
  });

  it('refuse un type non géré et un contenu tronqué', () => {
    expect(sniffMatchesMime(pdf, 'application/zip')).toBe(false);
    expect(sniffMatchesMime(Buffer.from([0x25]), 'application/pdf')).toBe(false);
    expect(sniffMatchesMime(null, 'application/pdf')).toBe(false);
  });
});

describe('statusMap', () => {
  it('couvre les onze statuts du cycle de vie', () => {
    expect(Object.keys(STATUS_TO_LEGACY)).toHaveLength(11);
  });

  it('est une bijection : aller-retour sans perte', () => {
    for (const [enBase, hérité] of Object.entries(STATUS_TO_LEGACY)) {
      expect(STATUS_TO_DB[hérité]).toBe(enBase);
    }
  });

  it('n a aucun libellé hérité en double', () => {
    const libelles = Object.values(STATUS_TO_LEGACY);
    expect(new Set(libelles).size).toBe(libelles.length);
  });

  it('expose la liste des libellés acceptés par les API', () => {
    expect(VALID_LEGACY_STATUSES).toHaveLength(11);
    expect(VALID_LEGACY_STATUSES).toContain('en_attente');
    expect(VALID_LEGACY_STATUSES).toContain('finalise');
  });
});
