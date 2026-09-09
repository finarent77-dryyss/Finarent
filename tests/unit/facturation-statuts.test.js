import { describe, it, expect } from 'vitest';
import {
  STATUTS_FACTURE,
  STATUTS_DEVIS,
  verifierTransitionFacture,
  verifierTransitionDevis,
  champsIdentiteFiges,
  statutVautEmission,
} from '@/lib/invoicing/statuses.js';

/**
 * Cycle de vie des factures et des devis.
 *
 * `Invoice.status` et `Quote.status` sont des colonnes texte libres : la base
 * n'oppose aucune résistance, et le PATCH d'administration recopiait la valeur
 * reçue telle quelle. Un simple {"status":"PAID"} soldait donc une facture
 * n'ayant jamais rien encaissé, et « BANANA » créait une catégorie fantôme dans
 * les filtres. Ces tests verrouillent le contrôle qui manquait.
 */

const facture = (status, paidAmount = 0, totalTTC = 1200) => ({ status, paidAmount, totalTTC });

describe('verifierTransitionFacture — valeurs', () => {
  it('refuse une valeur hors du cycle de vie', () => {
    const verdict = verifierTransitionFacture(facture('DRAFT'), 'BANANA');
    expect(verdict.ok).toBe(false);
    expect(verdict.message).toContain('Statut invalide');
  });

  it('énumère les statuts attendus dans le message', () => {
    const { message } = verifierTransitionFacture(facture('DRAFT'), 'ENVOYEE');
    for (const statut of STATUTS_FACTURE) expect(message).toContain(statut);
  });

  it('accepte un statut identique au courant, sans le traiter comme une transition', () => {
    expect(verifierTransitionFacture(facture('PAID', 1200), 'PAID').ok).toBe(true);
    expect(verifierTransitionFacture(facture('CANCELLED'), 'CANCELLED').ok).toBe(true);
  });
});

describe('verifierTransitionFacture — transitions', () => {
  it('émet un brouillon', () => {
    expect(verifierTransitionFacture(facture('DRAFT'), 'ISSUED').ok).toBe(true);
  });

  it('annule un brouillon', () => {
    expect(verifierTransitionFacture(facture('DRAFT'), 'CANCELLED').ok).toBe(true);
  });

  it('refuse de solder un brouillon sans passer par l émission', () => {
    const verdict = verifierTransitionFacture(facture('DRAFT', 1200), 'PAID');
    expect(verdict.ok).toBe(false);
    expect(verdict.message).toContain('DRAFT → PAID');
  });

  it('refuse de rouvrir une facture réglée : elle se corrige par un avoir', () => {
    const verdict = verifierTransitionFacture(facture('PAID', 1200), 'ISSUED');
    expect(verdict.ok).toBe(false);
    expect(verdict.message).toContain('définitif');
  });

  it('refuse de ressusciter une facture annulée', () => {
    expect(verifierTransitionFacture(facture('CANCELLED'), 'ISSUED').ok).toBe(false);
  });

  it('laisse une facture partiellement réglée aller jusqu au solde', () => {
    expect(verifierTransitionFacture(facture('PARTIAL', 1200), 'PAID').ok).toBe(true);
  });

  it('tolère un statut courant inconnu, hérité de l ancien PATCH permissif', () => {
    // Sinon une facture portant « BANANA » resterait irréparable.
    expect(verifierTransitionFacture(facture('BANANA'), 'CANCELLED').ok).toBe(true);
  });
});

describe('verifierTransitionFacture — cohérence avec les montants encaissés', () => {
  it('refuse PAID tant que les versements ne couvrent pas le total TTC', () => {
    const verdict = verifierTransitionFacture(facture('ISSUED', 0, 1200), 'PAID');
    expect(verdict.ok).toBe(false);
    expect(verdict.message).toContain('0.00');
    expect(verdict.message).toContain('1200.00');
  });

  it('refuse PAID sur un règlement partiel', () => {
    expect(verifierTransitionFacture(facture('PARTIAL', 400, 1200), 'PAID').ok).toBe(false);
  });

  it('accepte PAID dès que le total est couvert', () => {
    expect(verifierTransitionFacture(facture('ISSUED', 1200, 1200), 'PAID').ok).toBe(true);
  });

  it('tolère l arrondi au centime', () => {
    expect(verifierTransitionFacture(facture('ISSUED', 1199.995, 1200), 'PAID').ok).toBe(true);
  });

  it('refuse PARTIAL quand aucun versement n a été enregistré', () => {
    const verdict = verifierTransitionFacture(facture('ISSUED', 0, 1200), 'PARTIAL');
    expect(verdict.ok).toBe(false);
    expect(verdict.message).toContain('Aucun versement');
  });

  it('accepte PARTIAL dès qu un versement existe', () => {
    expect(verifierTransitionFacture(facture('ISSUED', 400, 1200), 'PARTIAL').ok).toBe(true);
  });

  it('applique la règle de montant même depuis un statut inconnu', () => {
    expect(verifierTransitionFacture(facture('BANANA', 0, 1200), 'PAID').ok).toBe(false);
  });

  it('accepte l annulation quel que soit l encaissement', () => {
    expect(verifierTransitionFacture(facture('PARTIAL', 400, 1200), 'CANCELLED').ok).toBe(true);
  });
});

describe('statutVautEmission — quand la facture consomme un numéro', () => {
  it('reconnaît les statuts qui valent émission comptable', () => {
    expect(statutVautEmission('ISSUED')).toBe(true);
    expect(statutVautEmission('PARTIAL')).toBe(true);
    expect(statutVautEmission('PAID')).toBe(true);
  });

  it('n émet ni sur brouillon ni sur annulation', () => {
    // Décisif : annuler un brouillon ne doit pas consommer de numéro, sinon on
    // recrée le trou de séquence que la correction supprime.
    expect(statutVautEmission('DRAFT')).toBe(false);
    expect(statutVautEmission('CANCELLED')).toBe(false);
    expect(statutVautEmission(undefined)).toBe(false);
  });
});

describe('verifierTransitionDevis', () => {
  const devis = (status) => ({ status });

  it('refuse une valeur hors du cycle de vie', () => {
    const verdict = verifierTransitionDevis(devis('DRAFT'), 'BANANA');
    expect(verdict.ok).toBe(false);
    expect(verdict.message).toContain('Statut invalide');
    for (const statut of STATUTS_DEVIS) expect(verdict.message).toContain(statut);
  });

  it('envoie un brouillon', () => {
    expect(verifierTransitionDevis(devis('DRAFT'), 'SENT').ok).toBe(true);
  });

  it('refuse d accepter un devis jamais envoyé', () => {
    expect(verifierTransitionDevis(devis('DRAFT'), 'ACCEPTED').ok).toBe(false);
  });

  it('accepte ou refuse un devis envoyé', () => {
    expect(verifierTransitionDevis(devis('SENT'), 'ACCEPTED').ok).toBe(true);
    expect(verifierTransitionDevis(devis('SENT'), 'REFUSED').ok).toBe(true);
  });

  it('refuse de retourner un devis accepté en refusé', () => {
    expect(verifierTransitionDevis(devis('ACCEPTED'), 'REFUSED').ok).toBe(false);
  });

  it('autorise le renvoi d un devis expiré après prolongation', () => {
    expect(verifierTransitionDevis(devis('EXPIRED'), 'SENT').ok).toBe(true);
  });
});

describe('champsIdentiteFiges', () => {
  const emise = {
    status: 'ISSUED',
    clientName: 'SARL Dupont',
    clientAddress: '3 rue des Lilas',
    clientPostal: '77000',
    clientCity: 'Melun',
    clientSiret: '93129583600017',
    clientEmail: 'contact@dupont.fr',
  };

  it('ne fige rien tant que la facture est en brouillon', () => {
    expect(champsIdentiteFiges({ ...emise, status: 'DRAFT' }, { clientSiret: '00000000000000' })).toEqual([]);
  });

  it('accepte une écriture à valeur identique — un PATCH complet ne doit pas échouer', () => {
    expect(champsIdentiteFiges(emise, { clientName: 'SARL Dupont', clientCity: 'Melun' })).toEqual([]);
  });

  it('refuse la réécriture du SIRET d une facture émise', () => {
    expect(champsIdentiteFiges(emise, { clientSiret: '00000000000000' })).toEqual(['clientSiret']);
  });

  it('signale tous les champs concernés d un coup', () => {
    const refuses = champsIdentiteFiges(emise, { clientName: 'Autre', clientCity: 'Paris' });
    expect(refuses).toEqual(['clientName', 'clientCity']);
  });

  it('laisse corriger le canal de contact, qui n est pas une mention légale', () => {
    expect(champsIdentiteFiges(emise, { clientEmail: 'compta@dupont.fr' })).toEqual([]);
  });
});
