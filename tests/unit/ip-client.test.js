/**
 * Extraction de l'adresse IP du client (défaut RUN-03, revue statique PUB-06).
 *
 * Le défaut se constatait à l'exécution : dix requêtes portant chacune un
 * `X-Forwarded-For` différent passaient toutes, alors que la même IP fixe était
 * refusée dès la sixième. La limitation de débit s'annulait donc à volonté, en
 * production comme en local.
 *
 * Ces tests fixent la règle inverse : seule l'entrée posée par le mandataire de
 * confiance compte, et le nombre de mandataires est un réglage explicite.
 */

import { describe, it, expect } from 'vitest';
import {
  ipClient,
  ipClientOuNull,
  extraireIpDeXff,
  normaliserAdresse,
  nombreProxysDeConfiance,
  IP_INCONNUE,
  NB_PROXYS_DE_CONFIANCE_PAR_DEFAUT,
} from '@/lib/ip-client';
import { checkRateLimitMemoire } from '@/lib/rateLimit';

/** Requête minimale : seul `headers.get` est consulté par le module. */
function requete(entetes = {}) {
  const normalises = new Map(
    Object.entries(entetes).map(([nom, valeur]) => [nom.toLowerCase(), valeur]),
  );
  return { headers: { get: (nom) => normalises.get(String(nom).toLowerCase()) ?? null } };
}

describe('nombreProxysDeConfiance', () => {
  it('vaut 1 par défaut — topologie Clever Cloud, un reverse-proxy unique', () => {
    expect(nombreProxysDeConfiance({})).toBe(NB_PROXYS_DE_CONFIANCE_PAR_DEFAUT);
    expect(nombreProxysDeConfiance({})).toBe(1);
    expect(nombreProxysDeConfiance({ NB_PROXYS_DE_CONFIANCE: '' })).toBe(1);
    expect(nombreProxysDeConfiance(undefined)).toBe(1);
  });

  it('lit la valeur configurée, y compris 0', () => {
    expect(nombreProxysDeConfiance({ NB_PROXYS_DE_CONFIANCE: '0' })).toBe(0);
    expect(nombreProxysDeConfiance({ NB_PROXYS_DE_CONFIANCE: '2' })).toBe(2);
    expect(nombreProxysDeConfiance({ NB_PROXYS_DE_CONFIANCE: ' 3 ' })).toBe(3);
  });

  it('retombe sur le défaut plutôt que sur 0 quand la valeur est illisible', () => {
    // Une coquille dans la configuration ne doit pas désarmer la limitation.
    expect(nombreProxysDeConfiance({ NB_PROXYS_DE_CONFIANCE: 'oui' })).toBe(1);
    expect(nombreProxysDeConfiance({ NB_PROXYS_DE_CONFIANCE: '-2' })).toBe(1);
  });
});

describe('extraireIpDeXff — en-tête absent', () => {
  it('rend la sentinelle partagée quand rien n\'est fourni', () => {
    expect(extraireIpDeXff(null, 1)).toBe(IP_INCONNUE);
    expect(extraireIpDeXff(undefined, 1)).toBe(IP_INCONNUE);
    expect(extraireIpDeXff('', 1)).toBe(IP_INCONNUE);
    expect(extraireIpDeXff('   ', 1)).toBe(IP_INCONNUE);
  });

  it('rend une valeur constante, donc un quota unique et non un quota par requête', () => {
    // Le point important : deux appels sans en-tête doivent tomber dans le même
    // seau. Une valeur unique par appel équivaudrait à ne pas limiter.
    expect(extraireIpDeXff(null, 1)).toBe(extraireIpDeXff(null, 1));
  });
});

describe('extraireIpDeXff — une seule entrée', () => {
  it('la retient derrière un mandataire unique', () => {
    expect(extraireIpDeXff('203.0.113.7', 1)).toBe('203.0.113.7');
    expect(extraireIpDeXff('  203.0.113.7  ', 1)).toBe('203.0.113.7');
  });

  it('la refuse quand deux mandataires sont annoncés — la chaîne est trop courte', () => {
    expect(extraireIpDeXff('203.0.113.7', 2)).toBe(IP_INCONNUE);
  });
});

describe('extraireIpDeXff — chaîne d\'entrées', () => {
  it('retient la plus à DROITE derrière un mandataire unique', () => {
    // C'est le renversement par rapport au code fautif, qui lisait `split(',')[0]`.
    expect(extraireIpDeXff('203.0.113.7, 198.51.100.4', 1)).toBe('198.51.100.4');
    expect(extraireIpDeXff('a, b, 198.51.100.4', 1)).toBe('198.51.100.4');
  });

  it('décale d\'un cran par mandataire supplémentaire', () => {
    const chaine = '203.0.113.7, 198.51.100.4, 198.51.100.5';
    expect(extraireIpDeXff(chaine, 1)).toBe('198.51.100.5');
    expect(extraireIpDeXff(chaine, 2)).toBe('198.51.100.4');
    expect(extraireIpDeXff(chaine, 3)).toBe('203.0.113.7');
  });

  it('ignore l\'en-tête entièrement quand aucun mandataire n\'est de confiance', () => {
    expect(extraireIpDeXff('203.0.113.7, 198.51.100.4', 0)).toBe(IP_INCONNUE);
  });

  it('tolère les entrées vides et les espaces produits par les proxys', () => {
    expect(extraireIpDeXff('203.0.113.7,,  198.51.100.4 ,', 1)).toBe('198.51.100.4');
  });
});

describe('extraireIpDeXff — en-tête forgé', () => {
  it('ne retient pas la valeur écrite par le client', () => {
    // Le client prétend venir de 1.2.3.4 ; notre proxy a vu 198.51.100.4.
    expect(extraireIpDeXff('1.2.3.4, 198.51.100.4', 1)).toBe('198.51.100.4');
  });

  it('neutralise le contournement constaté : dix en-têtes tournants, une seule clé', () => {
    // Reproduction exacte du scénario du rapport d'exécution — dix requêtes
    // avec `X-Forwarded-For: 198.51.100.101…110`, toutes relayées par le même
    // proxy, qui appose l'adresse réelle du client à droite.
    const cles = new Set();
    for (let i = 1; i <= 10; i += 1) {
      cles.add(extraireIpDeXff(`198.51.100.${100 + i}, 203.0.113.9`, 1));
    }
    expect(cles.size).toBe(1);
    expect([...cles][0]).toBe('203.0.113.9');
  });

  it('ne se laisse pas allonger la chaîne pour repousser l\'entrée de confiance', () => {
    // Le client bourre l'en-tête d'entrées bidon : l'indexation par la droite
    // reste ancrée sur ce que le proxy a écrit.
    const bourrage = Array.from({ length: 50 }, (_, i) => `10.0.0.${i}`).join(', ');
    expect(extraireIpDeXff(`${bourrage}, 203.0.113.9`, 1)).toBe('203.0.113.9');
  });

  it('refuse une entrée de confiance qui n\'est pas une adresse', () => {
    expect(extraireIpDeXff('203.0.113.7, robert', 1)).toBe(IP_INCONNUE);
    expect(extraireIpDeXff('203.0.113.7, 999.1.2.3', 1)).toBe(IP_INCONNUE);
    expect(extraireIpDeXff("203.0.113.7, 1' OR '1'='1", 1)).toBe(IP_INCONNUE);
  });
});

describe('normaliserAdresse', () => {
  it('retire le port des adresses IPv4', () => {
    expect(normaliserAdresse('203.0.113.7:52413')).toBe('203.0.113.7');
  });

  it('gère les formes IPv6 nues et entre crochets', () => {
    expect(normaliserAdresse('2001:db8::1')).toBe('2001:db8::1');
    expect(normaliserAdresse('[2001:db8::1]:443')).toBe('2001:db8::1');
    expect(normaliserAdresse('::1')).toBe('::1');
  });

  it('rejette ce qui n\'est pas une adresse', () => {
    expect(normaliserAdresse('')).toBeNull();
    expect(normaliserAdresse('inconnue')).toBeNull();
    expect(normaliserAdresse('<script>')).toBeNull();
    expect(normaliserAdresse('256.1.1.1')).toBeNull();
  });
});

describe('ipClient', () => {
  it('lit `x-forwarded-for` sur une requête réelle', () => {
    const req = new Request('http://localhost/api/financement', {
      method: 'POST',
      headers: { 'x-forwarded-for': '1.2.3.4, 198.51.100.4' },
    });
    expect(ipClient(req, { nbProxys: 1 })).toBe('198.51.100.4');
  });

  it('n\'accorde aucune confiance à `x-real-ip`', () => {
    // Cet en-tête ne porte pas de position : rien n'y distingue une valeur
    // posée par notre proxy d'une valeur posée par le client.
    expect(ipClient(requete({ 'x-real-ip': '9.9.9.9' }), { nbProxys: 1 })).toBe(IP_INCONNUE);
  });

  it('applique le nombre de mandataires lu dans l\'environnement fourni', () => {
    const req = requete({ 'x-forwarded-for': '203.0.113.7, 198.51.100.4, 198.51.100.5' });
    expect(ipClient(req, { env: { NB_PROXYS_DE_CONFIANCE: '2' } })).toBe('198.51.100.4');
    expect(ipClient(req, { env: { NB_PROXYS_DE_CONFIANCE: '0' } })).toBe(IP_INCONNUE);
  });

  it('ne lève jamais sur un objet de requête inattendu', () => {
    expect(ipClient(null)).toBe(IP_INCONNUE);
    expect(ipClient({})).toBe(IP_INCONNUE);
    expect(ipClient({ headers: {} })).toBe(IP_INCONNUE);
  });
});

describe('ipClientOuNull', () => {
  it('rend null au lieu de la sentinelle, pour les colonnes de traçabilité', () => {
    expect(ipClientOuNull(requete({}))).toBeNull();
    expect(ipClientOuNull(requete({ 'x-forwarded-for': '198.51.100.4' }), { nbProxys: 1 }))
      .toBe('198.51.100.4');
  });
});

describe('effet sur la limitation de débit', () => {
  it('le quota n\'est plus contournable en faisant tourner l\'en-tête', () => {
    // Six requêtes du même client derrière le proxy, chacune avec un
    // `X-Forwarded-For` forgé différent. Avant correction, les six passaient.
    const seau = `test-xff-${Math.random().toString(36).slice(2)}`;
    const verdicts = [];
    for (let i = 1; i <= 6; i += 1) {
      const ip = extraireIpDeXff(`198.51.100.${100 + i}, 203.0.113.9`, 1);
      verdicts.push(checkRateLimitMemoire(ip, { bucket: seau, max: 5 }).allowed);
    }
    expect(verdicts).toEqual([true, true, true, true, true, false]);
  });

  it('un client réellement distinct conserve son propre quota', () => {
    const seau = `test-xff-distinct-${Math.random().toString(36).slice(2)}`;
    for (let i = 0; i < 5; i += 1) {
      checkRateLimitMemoire(extraireIpDeXff('1.2.3.4, 203.0.113.9', 1), { bucket: seau, max: 5 });
    }
    // Sixième appel depuis la première adresse : refusé.
    expect(
      checkRateLimitMemoire(extraireIpDeXff('1.2.3.4, 203.0.113.9', 1), { bucket: seau, max: 5 })
        .allowed,
    ).toBe(false);
    // Premier appel depuis une autre adresse réelle : accepté.
    expect(
      checkRateLimitMemoire(extraireIpDeXff('1.2.3.4, 203.0.113.10', 1), { bucket: seau, max: 5 })
        .allowed,
    ).toBe(true);
  });
});
