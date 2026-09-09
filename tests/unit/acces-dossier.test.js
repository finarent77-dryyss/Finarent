import { describe, it, expect } from 'vitest';
import {
  PRODUIT_ASSURANCE,
  STATUTS_OFFRE_SIGNABLE,
  identifiantUtilisable,
  memeRattachement,
  estAdmin,
  estProprietaireDossier,
  estPartenaireDuDossier,
  estAssureurDuDossier,
  peutAccederAuDossier,
  peutEcrireMessageInterne,
  partenaireRattache,
  filtreDossiersPartenaire,
  emailSessionVerifie,
  peutRattacherDossiersAnonymes,
  offreSignable,
  offreAcceptable,
  offreExpiree,
} from '@/lib/acces-dossier.js';

/**
 * Accès horizontaux : ces tests sont le filet qui doit se déchirer bruyamment
 * si quelqu'un réécrit un contrôle d'appartenance sous la forme d'une simple
 * égalité `a === b` sur des colonnes nullables.
 *
 * Deux familles de cas comptent plus que les autres et sont traitées en
 * premier, avec leur scénario d'exploitation en commentaire :
 *   1. « les deux valent null » — la comparaison est vraie alors qu'aucun
 *      rattachement n'existe ;
 *   2. « rôle correct mais rattachement absent » — le rôle seul sert de
 *      laissez-passer.
 */

// ─── Cas 1 : les deux valeurs sont nulles ────────────────────────────────────

describe('« les deux valent null » ne vaut jamais appartenance', () => {
  it('memeRattachement refuse null === null', () => {
    // C'est la ligne qui a produit tout le défaut : en JavaScript,
    // `null === null` est vrai, et le contrôle d'accès passait.
    expect(null === null).toBe(true);
    expect(memeRattachement(null, null)).toBe(false);
  });

  it('memeRattachement refuse undefined, chaîne vide et espaces des deux côtés', () => {
    expect(memeRattachement(undefined, undefined)).toBe(false);
    expect(memeRattachement('', '')).toBe(false);
    expect(memeRattachement('   ', '   ')).toBe(false);
    expect(memeRattachement(null, undefined)).toBe(false);
  });

  it('un PARTNER sans partnerId n\'est pas le partenaire d\'un dossier sans partenaire', () => {
    // Scénario : compte de rôle PARTNER jamais rattaché à une société, face à
    // un dossier déposé en direct par un client (partnerId nul). L'ancien
    // contrôle `application.partnerId === dbUser.partnerId` était satisfait.
    const partenaireNonRattache = { id: 'u1', role: 'PARTNER', partnerId: null };
    const dossierDirect = { userId: 'client-1', partnerId: null, productType: 'PRET_PRO' };

    expect(estPartenaireDuDossier(partenaireNonRattache, dossierDirect)).toBe(false);
    expect(peutAccederAuDossier(partenaireNonRattache, dossierDirect)).toBe(false);
    expect(peutEcrireMessageInterne(partenaireNonRattache, dossierDirect)).toBe(false);
  });

  it('un utilisateur sans id n\'est pas propriétaire d\'un dossier anonyme', () => {
    // Même piège du côté client : un dossier anonyme a `userId: null`.
    expect(estProprietaireDossier({ id: null }, { userId: null })).toBe(false);
    expect(estProprietaireDossier({}, {})).toBe(false);
    expect(peutAccederAuDossier({ id: null, role: 'CLIENT' }, { userId: null })).toBe(false);
  });

  it('un partenaire réellement rattaché garde l\'accès à ses dossiers', () => {
    const partenaire = { id: 'u2', role: 'PARTNER', partnerId: 'p1' };
    expect(estPartenaireDuDossier(partenaire, { partnerId: 'p1' })).toBe(true);
    expect(estPartenaireDuDossier(partenaire, { partnerId: 'p2' })).toBe(false);
    expect(estPartenaireDuDossier(partenaire, { partnerId: null })).toBe(false);
  });
});

// ─── Cas 2 : rôle correct, rattachement absent ───────────────────────────────

describe('« rôle correct mais rattachement absent » ferme l\'accès', () => {
  it('partenaireRattache refuse un PARTNER au partnerId nul, vide ou blanc', () => {
    expect(partenaireRattache({ role: 'PARTNER', partnerId: null })).toBe(false);
    expect(partenaireRattache({ role: 'PARTNER', partnerId: undefined })).toBe(false);
    expect(partenaireRattache({ role: 'PARTNER', partnerId: '' })).toBe(false);
    expect(partenaireRattache({ role: 'PARTNER', partnerId: '  ' })).toBe(false);
    expect(partenaireRattache({ role: 'PARTNER', partnerId: 'p1' })).toBe(true);
  });

  it('filtreDossiersPartenaire renvoie null plutôt qu\'un filtre { partnerId: null }', () => {
    // Un filtre `{ partnerId: null }` ramène TOUS les dossiers non attribués :
    // le garde doit refuser, pas construire une requête permissive.
    const filtre = filtreDossiersPartenaire({ role: 'PARTNER', partnerId: null });
    expect(filtre).toBeNull();
    expect(filtre).not.toEqual({ partnerId: null });
  });

  it('filtreDossiersPartenaire borne un partenaire rattaché à sa société', () => {
    expect(filtreDossiersPartenaire({ role: 'PARTNER', partnerId: 'p1' })).toEqual({
      partnerId: 'p1',
    });
  });

  it('filtreDossiersPartenaire laisse l\'admin voir l\'ensemble', () => {
    expect(filtreDossiersPartenaire({ role: 'ADMIN', partnerId: null })).toEqual({});
  });

  it('filtreDossiersPartenaire refuse un rôle étranger et l\'absence d\'utilisateur', () => {
    expect(filtreDossiersPartenaire({ role: 'CLIENT', partnerId: 'p1' })).toBeNull();
    expect(filtreDossiersPartenaire({ role: 'INSURER', partnerId: 'p1' })).toBeNull();
    expect(filtreDossiersPartenaire(null)).toBeNull();
    expect(filtreDossiersPartenaire(undefined)).toBeNull();
  });

  it('le rôle INSURER seul n\'ouvre pas un dossier hors périmètre assurance', () => {
    // Scénario : compte assureur qui appelle la messagerie d'un prêt pro.
    const assureur = { id: 'u3', role: 'INSURER', partnerId: null };
    const pretPro = { userId: 'client-1', partnerId: null, productType: 'PRET_PRO' };
    const creditBail = { userId: 'client-1', partnerId: null, productType: 'CREDIT_BAIL' };
    const rcPro = { userId: 'client-1', partnerId: null, productType: PRODUIT_ASSURANCE };

    expect(estAssureurDuDossier(assureur, pretPro)).toBe(false);
    expect(estAssureurDuDossier(assureur, creditBail)).toBe(false);
    expect(peutAccederAuDossier(assureur, pretPro)).toBe(false);
    expect(peutEcrireMessageInterne(assureur, pretPro)).toBe(false);

    expect(estAssureurDuDossier(assureur, rcPro)).toBe(true);
    expect(peutAccederAuDossier(assureur, rcPro)).toBe(true);
  });

  it('un dossier sans productType ne passe pas la borne assureur', () => {
    const assureur = { id: 'u3', role: 'INSURER' };
    expect(estAssureurDuDossier(assureur, { userId: 'c1', partnerId: null })).toBe(false);
    expect(estAssureurDuDossier(assureur, { productType: null })).toBe(false);
  });
});

// ─── Décision d'accès complète ───────────────────────────────────────────────

describe('peutAccederAuDossier', () => {
  const dossier = { userId: 'client-1', partnerId: 'p1', productType: 'PRET_PRO' };

  it('accepte le propriétaire', () => {
    expect(peutAccederAuDossier({ id: 'client-1', role: 'CLIENT' }, dossier)).toBe(true);
  });

  it('refuse un autre client', () => {
    expect(peutAccederAuDossier({ id: 'client-2', role: 'CLIENT' }, dossier)).toBe(false);
  });

  it('accepte l\'administrateur', () => {
    expect(peutAccederAuDossier({ id: 'a1', role: 'ADMIN', partnerId: null }, dossier)).toBe(true);
  });

  it('accepte le partenaire rattaché au dossier, refuse celui d\'une autre société', () => {
    expect(peutAccederAuDossier({ id: 'u1', role: 'PARTNER', partnerId: 'p1' }, dossier)).toBe(true);
    expect(peutAccederAuDossier({ id: 'u1', role: 'PARTNER', partnerId: 'p2' }, dossier)).toBe(false);
  });

  it('refuse quand l\'utilisateur ou le dossier manque', () => {
    expect(peutAccederAuDossier(null, dossier)).toBe(false);
    expect(peutAccederAuDossier({ id: 'client-1' }, null)).toBe(false);
    expect(peutAccederAuDossier(null, null)).toBe(false);
  });

  it('un client propriétaire n\'a pas le droit d\'écrire un message interne', () => {
    expect(peutEcrireMessageInterne({ id: 'client-1', role: 'CLIENT' }, dossier)).toBe(false);
    expect(peutEcrireMessageInterne({ id: 'a1', role: 'ADMIN' }, dossier)).toBe(true);
  });
});

describe('estAdmin et identifiantUtilisable', () => {
  it('estAdmin ne se laisse pas abuser par une valeur absente', () => {
    expect(estAdmin(null)).toBe(false);
    expect(estAdmin(undefined)).toBe(false);
    expect(estAdmin({ role: 'admin' })).toBe(false); // le rôle en base est en majuscules
    expect(estAdmin({ role: 'ADMIN' })).toBe(true);
  });

  it('identifiantUtilisable n\'accepte qu\'une chaîne non vide', () => {
    expect(identifiantUtilisable('cku123')).toBe(true);
    expect(identifiantUtilisable('')).toBe(false);
    expect(identifiantUtilisable('   ')).toBe(false);
    expect(identifiantUtilisable(null)).toBe(false);
    expect(identifiantUtilisable(undefined)).toBe(false);
    expect(identifiantUtilisable(0)).toBe(false);
    expect(identifiantUtilisable(42)).toBe(false);
    expect(identifiantUtilisable({})).toBe(false);
  });
});

// ─── Rattachement des dossiers anonymes (email vérifié) ──────────────────────

describe('rattachement des dossiers anonymes', () => {
  const utilisateurBase = { id: 'u1', email: 'victime@exemple.fr' };

  it('refuse tant que l\'adresse n\'est pas vérifiée par Auth0', () => {
    // Scénario : un tiers ouvre un compte Auth0 avec l'adresse de la victime,
    // saisie sur le formulaire public. Sans preuve de possession, aucun
    // rattachement.
    expect(peutRattacherDossiersAnonymes({ email_verified: false }, utilisateurBase)).toBe(false);
    expect(peutRattacherDossiersAnonymes({}, utilisateurBase)).toBe(false);
    expect(peutRattacherDossiersAnonymes(null, utilisateurBase)).toBe(false);
  });

  it('refuse une valeur seulement « vraie au sens booléen »', () => {
    // Auth0 peut renvoyer la chaîne "false", qui est vraie en JavaScript.
    expect(emailSessionVerifie({ email_verified: 'false' })).toBe(false);
    expect(emailSessionVerifie({ email_verified: 'true' })).toBe(false);
    expect(emailSessionVerifie({ email_verified: 1 })).toBe(false);
    expect(emailSessionVerifie({ email_verified: true })).toBe(true);
  });

  it('autorise le rattachement quand l\'adresse est vérifiée', () => {
    expect(peutRattacherDossiersAnonymes({ email_verified: true }, utilisateurBase)).toBe(true);
  });

  it('refuse si le compte n\'a pas d\'adresse exploitable', () => {
    expect(peutRattacherDossiersAnonymes({ email_verified: true }, { id: 'u1', email: null })).toBe(false);
    expect(peutRattacherDossiersAnonymes({ email_verified: true }, { id: 'u1', email: '' })).toBe(false);
    expect(peutRattacherDossiersAnonymes({ email_verified: true }, null)).toBe(false);
  });
});

// ─── Cycle de vie d'une offre ────────────────────────────────────────────────

describe('offreSignable', () => {
  const dansUnMois = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  const hier = new Date(Date.now() - 24 * 3600 * 1000);

  it('refuse un brouillon jamais transmis', () => {
    expect(offreSignable({ status: 'DRAFT', expiresAt: dansUnMois })).toBe(false);
  });

  it('refuse une offre refusée, expirée ou déjà signée', () => {
    expect(offreSignable({ status: 'REFUSED', expiresAt: dansUnMois })).toBe(false);
    expect(offreSignable({ status: 'EXPIRED', expiresAt: dansUnMois })).toBe(false);
    expect(offreSignable({ status: 'SIGNED', expiresAt: dansUnMois })).toBe(false);
  });

  it('refuse une offre dont l\'échéance est passée, quel que soit son statut', () => {
    for (const statut of STATUTS_OFFRE_SIGNABLE) {
      expect(offreSignable({ status: statut, expiresAt: hier })).toBe(false);
    }
  });

  it('accepte une offre transmise, vue ou acceptée et encore valide', () => {
    for (const statut of STATUTS_OFFRE_SIGNABLE) {
      expect(offreSignable({ status: statut, expiresAt: dansUnMois })).toBe(true);
    }
  });

  it('refuse en l\'absence d\'offre ou d\'échéance exploitable', () => {
    expect(offreSignable(null)).toBe(false);
    expect(offreSignable({ status: 'SENT', expiresAt: null })).toBe(false);
    expect(offreSignable({ status: 'SENT', expiresAt: 'pas une date' })).toBe(false);
  });
});

describe('offreAcceptable', () => {
  const dansUnMois = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  const hier = new Date(Date.now() - 24 * 3600 * 1000);

  it('refuse un brouillon : c\'est le trou laissé par l\'ancienne liste de refus', () => {
    expect(offreAcceptable({ status: 'DRAFT', expiresAt: dansUnMois })).toBe(false);
  });

  it('accepte une offre transmise ou vue, encore valide', () => {
    expect(offreAcceptable({ status: 'SENT', expiresAt: dansUnMois })).toBe(true);
    expect(offreAcceptable({ status: 'VIEWED', expiresAt: dansUnMois })).toBe(true);
  });

  it('refuse une offre déjà engagée ou périmée', () => {
    expect(offreAcceptable({ status: 'ACCEPTED', expiresAt: dansUnMois })).toBe(false);
    expect(offreAcceptable({ status: 'SIGNED', expiresAt: dansUnMois })).toBe(false);
    expect(offreAcceptable({ status: 'REFUSED', expiresAt: dansUnMois })).toBe(false);
    expect(offreAcceptable({ status: 'SENT', expiresAt: hier })).toBe(false);
  });
});

describe('offreExpiree', () => {
  it('traite une échéance absente ou illisible comme expirée', () => {
    expect(offreExpiree({ expiresAt: null })).toBe(true);
    expect(offreExpiree({ expiresAt: undefined })).toBe(true);
    expect(offreExpiree({ expiresAt: 'hier' })).toBe(true);
    expect(offreExpiree(null)).toBe(true);
  });

  it('accepte une chaîne ISO comme une Date', () => {
    const dansUnMois = new Date(Date.now() + 30 * 24 * 3600 * 1000);
    expect(offreExpiree({ expiresAt: dansUnMois.toISOString() })).toBe(false);
    expect(offreExpiree({ expiresAt: dansUnMois })).toBe(false);
  });

  it('considère une échéance atteinte à la seconde près comme expirée', () => {
    const maintenant = new Date('2026-09-09T12:00:00.000Z');
    expect(offreExpiree({ expiresAt: maintenant }, maintenant)).toBe(true);
  });
});
