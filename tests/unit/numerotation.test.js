import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Numérotation des documents commerciaux (factures, devis, avoirs,
 * auto-factures d'affiliation) et des dossiers.
 *
 * C'est de la comptabilité : la séquence doit être continue, sans trou ni
 * doublon, et repartir à 1 au changement d'exercice. Un doublon de numéro de
 * facture est un motif de rejet en contrôle fiscal ; un trou doit pouvoir
 * s'expliquer.
 *
 * La base est remplacée par une table en mémoire qui reproduit le contrat
 * utilisé par le code : filtrage `startsWith` pour lire l'exercice, et
 * `findUnique` pour vérifier qu'un candidat est libre.
 *
 * Ce fichier documentait auparavant deux défauts, désormais corrigés et
 * verrouillés ici :
 *   - le maximum était pris par `orderBy … desc` sur une colonne TEXTE, où
 *     « FAC-2026-9999 » est supérieur à « FAC-2026-10000 » : passé le
 *     dix-millième document, le numéro 10000 était réattribué indéfiniment ;
 *   - un numéro non conforme (reprise, import) faisait repartir la séquence à
 *     0001, sur des numéros déjà émis.
 */

const base = vi.hoisted(() => ({
  invoice: [],
  quote: [],
  creditNote: [],
  affiliateInvoice: [],
}));

vi.mock('@/lib/prisma', () => {
  const table = (nom, champ) => ({
    async findMany({ where }) {
      const prefixe = where?.[champ]?.startsWith ?? '';
      return base[nom].filter((v) => v.startsWith(prefixe)).map((v) => ({ [champ]: v }));
    },
    async findUnique({ where }) {
      return base[nom].includes(where[champ]) ? { id: `id-${where[champ]}` } : null;
    },
  });
  return {
    prisma: {
      invoice: table('invoice', 'invoiceNumber'),
      quote: table('quote', 'quoteNumber'),
      creditNote: table('creditNote', 'creditNoteNumber'),
      affiliateInvoice: table('affiliateInvoice', 'invoiceNumber'),
    },
  };
});

const {
  nextInvoiceNumber,
  nextQuoteNumber,
  nextCreditNoteNumber,
  numeroProvisoire,
  estNumeroProvisoire,
  avecNumeroUnique,
} = await import('@/lib/invoicing/numbering.js');
const { nextAffiliateInvoiceNumber } = await import('@/lib/affiliate-invoice-numbering.js');
const { genererReferenceDossier, referenceLisible } = await import('@/lib/reference.js');

beforeEach(() => {
  for (const cle of Object.keys(base)) base[cle] = [];
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-09T10:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('nextInvoiceNumber / nextQuoteNumber / nextCreditNoteNumber', () => {
  it('démarre à 0001 sur un exercice vierge', async () => {
    expect(await nextInvoiceNumber()).toBe('FAC-2026-0001');
    expect(await nextQuoteNumber()).toBe('DEV-2026-0001');
    expect(await nextCreditNoteNumber()).toBe('AVO-2026-0001');
  });

  it('incrémente le dernier numéro attribué', async () => {
    base.invoice.push('FAC-2026-0001', 'FAC-2026-0002', 'FAC-2026-0041');
    expect(await nextInvoiceNumber()).toBe('FAC-2026-0042');
  });

  it('conserve un padding sur quatre chiffres', async () => {
    base.quote.push('DEV-2026-0009');
    expect(await nextQuoteNumber()).toBe('DEV-2026-0010');
    base.quote.push('DEV-2026-0099');
    expect(await nextQuoteNumber()).toBe('DEV-2026-0100');
  });

  it('tient trois séquences indépendantes : une facture ne consomme pas un numéro de devis', async () => {
    base.invoice.push('FAC-2026-0500');
    expect(await nextQuoteNumber()).toBe('DEV-2026-0001');
    expect(await nextCreditNoteNumber()).toBe('AVO-2026-0001');
  });

  it('repart à 0001 au changement d exercice sans toucher aux numéros de l année précédente', async () => {
    base.invoice.push('FAC-2025-0128', 'FAC-2025-0129');
    vi.setSystemTime(new Date('2027-01-01T00:30:00Z'));
    expect(await nextInvoiceNumber()).toBe('FAC-2027-0001');
  });

  it('ignore les numéros des autres exercices lors du calcul du maximum', async () => {
    // 2025 est allé plus loin que 2026 : la séquence 2026 doit rester la sienne.
    base.invoice.push('FAC-2025-0900', 'FAC-2026-0007');
    expect(await nextInvoiceNumber()).toBe('FAC-2026-0008');
  });

  it('ne réattribue pas un numéro déjà émis quand une reprise non numérique traîne dans l exercice', async () => {
    // Défaut corrigé : « FAC-2026-REPRISE » l'emportait au tri alphabétique,
    // n'offrait aucun suffixe exploitable, et la séquence repartait à 0001 —
    // c'est-à-dire sur une facture déjà émise.
    base.invoice.push('FAC-2026-0001', 'FAC-2026-0002', 'FAC-2026-REPRISE');
    expect(await nextInvoiceNumber()).toBe('FAC-2026-0003');
  });

  it('attribue 0001 quand l exercice ne contient qu une reprise, sans écraser personne', async () => {
    base.invoice.push('FAC-2026-REPRISE');
    expect(await nextInvoiceNumber()).toBe('FAC-2026-0001');
  });

  it('franchit le seuil des 9 999 documents sans réattribuer 10000', async () => {
    // Le maximum est calculé numériquement : « FAC-2026-10000 » est bien
    // supérieur à « FAC-2026-9999 », alors qu'il lui est inférieur en tri
    // texte. C'est le défaut que ce test verrouille.
    base.invoice.push('FAC-2026-9999');
    expect(await nextInvoiceNumber()).toBe('FAC-2026-10000');
    base.invoice.push('FAC-2026-10000');
    expect(await nextInvoiceNumber()).toBe('FAC-2026-10001');
  });

  it('continue au-delà de 10 000 même si les numéros à cinq chiffres sont majoritaires', async () => {
    base.invoice.push('FAC-2026-9999', 'FAC-2026-10000', 'FAC-2026-10001', 'FAC-2026-10002');
    expect(await nextInvoiceNumber()).toBe('FAC-2026-10003');
  });

  it('saute les numéros pris entre la lecture du maximum et l écriture', async () => {
    // Deux créations simultanées lisent le même maximum ; la contrainte
    // d'unicité tranche, mais le candidat suivant doit déjà être cherché ici.
    base.invoice.push('FAC-2026-0050', 'FAC-2026-0051', 'FAC-2026-0052');
    const { prisma } = await import('@/lib/prisma');
    const vraiFindMany = prisma.invoice.findMany;
    prisma.invoice.findMany = async () => [{ invoiceNumber: 'FAC-2026-0050' }];
    try {
      expect(await nextInvoiceNumber()).toBe('FAC-2026-0053');
    } finally {
      prisma.invoice.findMany = vraiFindMany;
    }
  });
});

describe('numéro de travail des brouillons', () => {
  it('porte un préfixe qui n appartient à aucune séquence comptable', () => {
    const numero = numeroProvisoire();
    expect(numero).toMatch(/^BROUILLON-[0-9A-F]{8}$/);
    expect(estNumeroProvisoire(numero)).toBe(true);
  });

  it('ne reconnaît pas un numéro définitif comme provisoire', () => {
    expect(estNumeroProvisoire('FAC-2026-0042')).toBe(false);
    expect(estNumeroProvisoire(null)).toBe(false);
    expect(estNumeroProvisoire(undefined)).toBe(false);
  });

  it('deux tirages successifs ne se ressemblent pas', () => {
    expect(numeroProvisoire()).not.toBe(numeroProvisoire());
  });

  it('un brouillon ne consomme aucun rang : supprimé, il ne laisse pas de trou', async () => {
    // Trois brouillons créés puis deux supprimés ; la première facture émise
    // prend malgré tout 0001.
    base.invoice.push(numeroProvisoire(), numeroProvisoire());
    expect(await nextInvoiceNumber()).toBe('FAC-2026-0001');
    base.invoice.push('FAC-2026-0001');
    base.invoice.push(numeroProvisoire());
    expect(await nextInvoiceNumber()).toBe('FAC-2026-0002');
  });
});

describe('avecNumeroUnique', () => {
  const collision = (champ) => Object.assign(new Error('Unique constraint'), {
    code: 'P2002',
    meta: { target: [champ] },
  });

  it('réessaie avec un nouveau numéro quand la contrainte d unicité refuse', async () => {
    let appels = 0;
    const resultat = await avecNumeroUnique({
      champ: 'invoiceNumber',
      generer: async () => `FAC-2026-000${appels + 1}`,
      ecrire: async (numero) => {
        appels += 1;
        if (appels < 3) throw collision('invoiceNumber');
        return numero;
      },
    });
    expect(resultat).toBe('FAC-2026-0003');
    expect(appels).toBe(3);
  });

  it('laisse remonter une violation d unicité portant sur une autre colonne', async () => {
    await expect(avecNumeroUnique({
      champ: 'invoiceNumber',
      generer: async () => 'FAC-2026-0001',
      ecrire: async () => { throw collision('clientSiret'); },
    })).rejects.toMatchObject({ code: 'P2002' });
  });

  it('laisse remonter une erreur qui n est pas une collision', async () => {
    await expect(avecNumeroUnique({
      champ: 'invoiceNumber',
      generer: async () => 'FAC-2026-0001',
      ecrire: async () => { throw new Error('base injoignable'); },
    })).rejects.toThrow('base injoignable');
  });

  it('abandonne après le nombre d essais prévu plutôt que de boucler', async () => {
    let appels = 0;
    await expect(avecNumeroUnique({
      champ: 'invoiceNumber',
      essais: 3,
      generer: async () => 'FAC-2026-0001',
      ecrire: async () => { appels += 1; throw collision('invoiceNumber'); },
    })).rejects.toMatchObject({ code: 'P2002' });
    expect(appels).toBe(3);
  });

  it('n attribue pas de numéro quand le générateur en rend null', async () => {
    const recu = await avecNumeroUnique({
      champ: 'invoiceNumber',
      generer: async () => null,
      ecrire: async (numero) => numero,
    });
    expect(recu).toBeNull();
  });
});

describe('nextAffiliateInvoiceNumber', () => {
  it('préfixe AF et démarre à 0001', async () => {
    expect(await nextAffiliateInvoiceNumber()).toBe('AF-2026-0001');
  });

  it('incrémente la dernière auto-facture de l année', async () => {
    base.affiliateInvoice.push('AF-2026-0007');
    expect(await nextAffiliateInvoiceNumber()).toBe('AF-2026-0008');
  });

  it('ne se laisse pas influencer par les auto-factures de l exercice précédent', async () => {
    base.affiliateInvoice.push('AF-2025-0250');
    expect(await nextAffiliateInvoiceNumber()).toBe('AF-2026-0001');
  });

  it('partage la table des factures affiliées sans collision de préfixe', async () => {
    // Même colonne `invoiceNumber` que les factures clients dans certains
    // schémas : le préfixe AF- doit suffire à isoler la séquence.
    base.affiliateInvoice.push('FAC-2026-0900', 'AF-2026-0002');
    expect(await nextAffiliateInvoiceNumber()).toBe('AF-2026-0003');
  });

  it('franchit le seuil des 9 999 auto-factures sans réattribuer 10000', async () => {
    base.affiliateInvoice.push('AF-2026-9999', 'AF-2026-10000');
    expect(await nextAffiliateInvoiceNumber()).toBe('AF-2026-10001');
  });

  it('ignore un numéro d auto-facture non conforme au lieu de repartir à 0001', async () => {
    base.affiliateInvoice.push('AF-2026-0001', 'AF-2026-MANUEL');
    expect(await nextAffiliateInvoiceNumber()).toBe('AF-2026-0002');
  });
});

describe('genererReferenceDossier', () => {
  /** Faux client Prisma injectable, avec la contrainte d'unicité en mémoire. */
  function clientAvec(references) {
    const table = [...references];
    return {
      table,
      application: {
        async findFirst({ where }) {
          const prefixe = where?.reference?.startsWith ?? '';
          const lignes = table.filter((r) => r.startsWith(prefixe)).sort();
          return lignes.length ? { reference: lignes[lignes.length - 1] } : null;
        },
        async findUnique({ where }) {
          return table.includes(where.reference) ? { id: 'existant' } : null;
        },
      },
    };
  }

  it('attribue FIN-AAAA-00001 au premier dossier de l année', async () => {
    expect(await genererReferenceDossier(clientAvec([]))).toBe('FIN-2026-00001');
  });

  it('numérote sur cinq chiffres, sans troncature', async () => {
    expect(await genererReferenceDossier(clientAvec(['FIN-2026-00411']))).toBe('FIN-2026-00412');
  });

  it('repart à 1 au 1er janvier', async () => {
    vi.setSystemTime(new Date('2027-01-02T09:00:00Z'));
    expect(await genererReferenceDossier(clientAvec(['FIN-2026-00998']))).toBe('FIN-2027-00001');
  });

  it('saute les numéros déjà pris — cas de deux dépôts simultanés', async () => {
    // Le maximum lu est 00050, mais 00051 et 00052 viennent d être créés par
    // des requêtes concurrentes : la référence doit passer à 00053.
    const client = clientAvec(['FIN-2026-00050', 'FIN-2026-00051', 'FIN-2026-00052']);
    // findFirst renverrait 00052 ; on force la lecture d un maximum obsolète.
    client.application.findFirst = async () => ({ reference: 'FIN-2026-00050' });
    expect(await genererReferenceDossier(client)).toBe('FIN-2026-00053');
  });

  it('ne boucle pas indéfiniment quand tous les numéros suivants sont pris', async () => {
    const client = {
      application: {
        findFirst: async () => ({ reference: 'FIN-2026-00100' }),
        findUnique: async () => ({ id: 'toujours-pris' }),
      },
    };
    const reference = await genererReferenceDossier(client);
    // Repli horodaté : format préservé, donc toujours exploitable en aval.
    expect(reference).toMatch(/^FIN-2026-\d{5}$/);
  });

  it('ignore une référence dont le suffixe n est pas numérique', async () => {
    expect(await genererReferenceDossier(clientAvec(['FIN-2026-LEGACY']))).toBe('FIN-2026-00001');
  });
});

describe('referenceLisible', () => {
  it('retourne la référence quand elle existe', () => {
    expect(referenceLisible({ reference: 'FIN-2026-00042', id: 'clx123' })).toBe('FIN-2026-00042');
  });

  it('construit un repli à partir de l identifiant pour les dossiers antérieurs', () => {
    expect(referenceLisible({ id: 'clx0987654321' })).toBe('SANS-REF-654321');
  });

  it('n affiche jamais « null » dans un email ou un PDF', () => {
    expect(referenceLisible(null)).toBe('—');
    expect(referenceLisible({})).toBe('—');
    expect(referenceLisible({ reference: null, id: null })).toBe('—');
  });
});
