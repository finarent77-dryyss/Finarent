import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateSIREN,
  validateRequired,
  validateForm,
} from '@/utils/validation.js';
import { checkRateLimitMemoire } from '@/lib/rateLimit.js';
import { safeEqual, isCronAuthorized } from '@/lib/cron-auth.js';
import { verifyRecaptcha, recaptchaEstActif, cleDeDemonstration } from '@/lib/recaptcha.js';
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

  /**
   * La fonction faisait `value.trim()` sans vérifier le type. Sur la case de
   * consentement du formulaire de contact — un booléen — l'appel levait un
   * TypeError, qui tuait le gestionnaire de soumission en silence : le
   * formulaire d'acquisition ne partait jamais pour qui le remplissait
   * correctement. Ces cas verrouillent la correction.
   */
  it('accepte une case cochée et refuse une case décochée, sans lever', () => {
    expect(() => validateRequired(true)).not.toThrow();
    expect(validateRequired(true)).toBe(true);
    expect(validateRequired(false)).toBe(false);
  });

  it('traite les nombres, y compris zéro et les valeurs non finies', () => {
    expect(validateRequired(0)).toBe(true);
    expect(validateRequired(42)).toBe(true);
    expect(validateRequired(Number.NaN)).toBe(false);
    expect(validateRequired(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it('refuse l absence de valeur sans lever', () => {
    expect(() => validateRequired(null)).not.toThrow();
    expect(() => validateRequired(undefined)).not.toThrow();
    expect(validateRequired(null)).toBe(false);
    expect(validateRequired(undefined)).toBe(false);
  });
});

/**
 * Le formulaire de contact est la principale porte d'entrée commerciale : une
 * soumission valide doit passer, et une case de consentement décochée doit
 * produire un message, jamais une exception.
 */
describe('validateForm — formulaire de contact', () => {
  const CHAMPS = ['companyName', 'siren', 'sector', 'amount', 'firstName', 'lastName', 'email', 'phone', 'consent'];
  const demande = (consent) => ({
    companyName: 'Finarent',
    siren: '123456789',
    sector: 'btp',
    amount: '30 000€ - 50 000€',
    firstName: 'Camille',
    lastName: 'Durand',
    email: 'camille.durand@example.fr',
    phone: '0641598688',
    consent,
  });

  it('accepte une demande complète avec consentement coché', () => {
    const resultat = validateForm(demande(true), CHAMPS);
    expect(resultat.isValid).toBe(true);
    expect(resultat.errors).toEqual({});
  });

  it('refuse un consentement décoché avec un message, sans lever', () => {
    expect(() => validateForm(demande(false), CHAMPS)).not.toThrow();
    const resultat = validateForm(demande(false), CHAMPS);
    expect(resultat.isValid).toBe(false);
    expect(resultat.errors.consent).toMatch(/politique de confidentialité/i);
  });
});

/**
 * La paire d'essai publiée par Google traîne dans beaucoup de projets. Associée
 * à un vrai secret, elle produit un jeton que Google rejette : le formulaire
 * public se ferme sans que la cause soit lisible. Ces cas verrouillent le
 * traitement retenu — considérer une clé de démonstration comme une absence de
 * configuration, et laisser passer.
 */
describe('verifyRecaptcha — clé de démonstration', () => {
  const CLE_SITE_DEMO = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
  const CLE_SECRETE_DEMO = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';

  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('laisse passer quand la clé de site est celle de démonstration, même avec un vrai secret', async () => {
    vi.stubEnv('NEXT_PUBLIC_RECAPTCHA_SITE_KEY', CLE_SITE_DEMO);
    vi.stubEnv('RECAPTCHA_SECRET_KEY', '6LdLErItAAAAAvraiSecretDeProduction12345');
    const resultat = await verifyRecaptcha('');
    expect(resultat).toMatchObject({ success: true, skipped: true, reason: 'cle_de_demonstration' });
    expect(recaptchaEstActif()).toBe(false);
  });

  it('reconnaît aussi le secret de démonstration', () => {
    vi.stubEnv('NEXT_PUBLIC_RECAPTCHA_SITE_KEY', 'une-vraie-cle-de-site');
    vi.stubEnv('RECAPTCHA_SECRET_KEY', CLE_SECRETE_DEMO);
    expect(cleDeDemonstration()).toBe(true);
    expect(recaptchaEstActif()).toBe(false);
  });

  it('considère la protection armée avec une paire réelle', () => {
    vi.stubEnv('NEXT_PUBLIC_RECAPTCHA_SITE_KEY', '6LdLErItAAAAAcleDeSiteReelle12345678901');
    vi.stubEnv('RECAPTCHA_SECRET_KEY', '6LdLErItAAAAAsecretReel1234567890123456');
    expect(cleDeDemonstration()).toBe(false);
    expect(recaptchaEstActif()).toBe(true);
  });

  it('sans secret ni clé de démonstration, la vérification est ignorée', async () => {
    vi.stubEnv('NEXT_PUBLIC_RECAPTCHA_SITE_KEY', '');
    vi.stubEnv('RECAPTCHA_SECRET_KEY', '');
    const resultat = await verifyRecaptcha('');
    expect(resultat).toMatchObject({ success: true, skipped: true, reason: 'no_secret' });
  });
});

/**
 * Depuis le passage du compteur en base (constat P2-3), `checkRateLimit` fait
 * un aller-retour SQL : il relève des tests d'intégration. Ce qui reste
 * testable ici sans base, c'est le repli en mémoire — celui qui protège encore
 * l'instance quand la base est injoignable, et dont la logique de fenêtre est
 * inchangée.
 */
describe('checkRateLimitMemoire', () => {
  // Chaque test utilise une IP distincte : le compteur est un module partagé.
  it('autorise les premières requêtes puis bloque au-delà du quota', () => {
    const options = { bucket: 'test-quota', max: 3 };
    expect(checkRateLimitMemoire('10.0.0.1', options)).toEqual({ allowed: true, remaining: 2 });
    expect(checkRateLimitMemoire('10.0.0.1', options)).toEqual({ allowed: true, remaining: 1 });
    expect(checkRateLimitMemoire('10.0.0.1', options)).toEqual({ allowed: true, remaining: 0 });
    expect(checkRateLimitMemoire('10.0.0.1', options)).toEqual({ allowed: false, remaining: 0 });
  });

  it('cloisonne les seaux : déposer une demande ne consomme pas le quota des devis', () => {
    const ip = '10.0.0.2';
    checkRateLimitMemoire(ip, { bucket: 'financement', max: 1 });
    expect(checkRateLimitMemoire(ip, { bucket: 'financement', max: 1 }).allowed).toBe(false);
    // Un autre usage doit repartir d un quota intact.
    expect(checkRateLimitMemoire(ip, { bucket: 'devis', max: 1 }).allowed).toBe(true);
  });

  it('cloisonne les adresses', () => {
    const options = { bucket: 'test-ip', max: 1 };
    expect(checkRateLimitMemoire('10.0.0.3', options).allowed).toBe(true);
    expect(checkRateLimitMemoire('10.0.0.3', options).allowed).toBe(false);
    expect(checkRateLimitMemoire('10.0.0.4', options).allowed).toBe(true);
  });

  it('rouvre le quota une fois la fenêtre écoulée', () => {
    vi.useFakeTimers();
    try {
      const options = { bucket: 'test-fenetre', max: 1, windowMs: 60_000 };
      expect(checkRateLimitMemoire('10.0.0.5', options).allowed).toBe(true);
      expect(checkRateLimitMemoire('10.0.0.5', options).allowed).toBe(false);
      vi.advanceTimersByTime(60_001);
      expect(checkRateLimitMemoire('10.0.0.5', options).allowed).toBe(true);
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
