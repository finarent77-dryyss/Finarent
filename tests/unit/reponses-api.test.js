/**
 * Chemins d'erreur des routes d'API (constats ADM1-02, ADM1-03, ADM1-07, ADM1-08).
 *
 * Ces quatre défauts se ressemblaient : une entrée un peu hors-piste — corps
 * vide, JSON tronqué, identifiant supprimé entre-temps, note chiffrée avec une
 * clé qui n'est plus la bonne — et le back-office répondait 500. Les tests
 * ci-dessous fixent le comportement attendu à la place : 400, 404, ou un texte
 * lisible, jamais une exception qui remonte au runtime.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  lireCorpsJson,
  lireCorpsJsonOptionnel,
  reponseCorpsInvalide,
  estIntrouvable,
  reponseErreurPrisma,
} from '@/lib/reponses-api';
import { lireNotesAdmin, MARQUEUR_ILLISIBLE } from '@/lib/notes-admin';
import { encryptString } from '@/lib/crypto';

/** Fabrique une requête POST réelle, pour tester le vrai `Request.json()`. */
function requetePost(corpsBrut, options = {}) {
  return new Request('http://localhost/api/admin/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: corpsBrut,
    ...options,
  });
}

/** Erreur Prisma simulée : seul le champ `code` est lu par l'utilitaire. */
function erreurPrisma(code) {
  return Object.assign(new Error(`Prisma ${code}`), { code });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('lireCorpsJson', () => {
  it('rend l\'objet décodé sur un corps JSON valide', async () => {
    const corps = await lireCorpsJson(requetePost('{"name":"Dupont","actif":true}'));
    expect(corps).toEqual({ name: 'Dupont', actif: true });
  });

  it('rend null sur un corps vide (le cas qui produisait un 500)', async () => {
    expect(await lireCorpsJson(requetePost(''))).toBeNull();
  });

  it('rend null sur un corps absent', async () => {
    const requete = new Request('http://localhost/api/admin/test', { method: 'POST' });
    expect(await lireCorpsJson(requete)).toBeNull();
  });

  it('rend null sur un JSON malformé', async () => {
    expect(await lireCorpsJson(requetePost('{"name":'))).toBeNull();
    expect(await lireCorpsJson(requetePost('pas du json du tout'))).toBeNull();
  });

  it('rend null sur un JSON valide qui n\'est pas un objet', async () => {
    // Les routes concernées lisent toutes `body.champ` : un tableau, un scalaire
    // ou `null` finiraient en erreur Prisma non attrapée.
    expect(await lireCorpsJson(requetePost('null'))).toBeNull();
    expect(await lireCorpsJson(requetePost('[1,2,3]'))).toBeNull();
    expect(await lireCorpsJson(requetePost('42'))).toBeNull();
    expect(await lireCorpsJson(requetePost('"texte"'))).toBeNull();
  });

  it('accepte un objet vide, qui reste un corps valide', async () => {
    expect(await lireCorpsJson(requetePost('{}'))).toEqual({});
  });
});

describe('lireCorpsJsonOptionnel', () => {
  it('rend un objet vide plutôt que null quand le corps est absent', async () => {
    expect(await lireCorpsJsonOptionnel(requetePost(''))).toEqual({});
    expect(await lireCorpsJsonOptionnel(requetePost('{"limit":"abc"}'))).toEqual({ limit: 'abc' });
  });
});

describe('reponseCorpsInvalide', () => {
  it('répond 400 avec un message exploitable', async () => {
    const reponse = reponseCorpsInvalide();
    expect(reponse.status).toBe(400);
    const corps = await reponse.json();
    expect(corps.error).toMatch(/JSON/i);
  });

  it('accepte un message sur mesure', async () => {
    const reponse = reponseCorpsInvalide('Corps attendu : { userId }');
    expect(await reponse.json()).toEqual({ error: 'Corps attendu : { userId }' });
  });
});

describe('estIntrouvable', () => {
  it('reconnaît P2025 et rien d\'autre', () => {
    expect(estIntrouvable(erreurPrisma('P2025'))).toBe(true);
    expect(estIntrouvable(erreurPrisma('P2002'))).toBe(false);
    expect(estIntrouvable(new Error('panne'))).toBe(false);
    expect(estIntrouvable(null)).toBe(false);
    expect(estIntrouvable(undefined)).toBe(false);
  });
});

describe('reponseErreurPrisma', () => {
  it('traduit P2025 en 404 avec le message de la route', async () => {
    const reponse = reponseErreurPrisma(erreurPrisma('P2025'), {
      contexte: 'PATCH /api/admin/faq/[id]',
      introuvable: 'FAQ introuvable',
    });
    expect(reponse.status).toBe(404);
    expect(await reponse.json()).toEqual({ error: 'FAQ introuvable' });
  });

  it('traduit P2002 en 409, code déjà correct avant correction', async () => {
    const reponse = reponseErreurPrisma(erreurPrisma('P2002'), {
      conflit: 'Email ou code déjà utilisé',
    });
    expect(reponse.status).toBe(409);
    expect(await reponse.json()).toEqual({ error: 'Email ou code déjà utilisé' });
  });

  it('traduit une erreur inconnue en 500 générique et la journalise côté serveur', async () => {
    const journal = vi.spyOn(console, 'error').mockImplementation(() => {});
    const erreur = new Error('connexion à la base perdue');

    const reponse = reponseErreurPrisma(erreur, { contexte: 'POST /api/admin/affiliates' });

    expect(reponse.status).toBe(500);
    // Le détail technique reste serveur : le client ne voit qu'un message neutre.
    expect(await reponse.json()).toEqual({ error: 'Erreur serveur' });
    expect(journal).toHaveBeenCalledWith('POST /api/admin/affiliates :', erreur);
  });

  it('traite une valeur non-erreur comme un incident serveur', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const valeur of [null, undefined, 'oups', 42]) {
      const reponse = reponseErreurPrisma(valeur);
      expect(reponse.status).toBe(500);
    }
  });

  it('utilise des messages par défaut quand la route n\'en fournit pas', async () => {
    const introuvable = reponseErreurPrisma(erreurPrisma('P2025'));
    expect(introuvable.status).toBe(404);
    expect((await introuvable.json()).error).toBe('Ressource introuvable');
  });
});

describe('lireNotesAdmin', () => {
  it('déchiffre une note enregistrée normalement', () => {
    const stocke = encryptString('Rappeler lundi, dossier prioritaire.');
    expect(lireNotesAdmin(stocke)).toBe('Rappeler lundi, dossier prioritaire.');
  });

  it('laisse passer une note historique jamais chiffrée', () => {
    expect(lireNotesAdmin('note en clair d\'avant le chiffrement')).toBe(
      'note en clair d\'avant le chiffrement',
    );
  });

  it('récupère un bloc chiffré noyé dans du clair (donnée corrompue ADM1-02)', () => {
    // Ce que l'ancien journal d'appel écrivait : le nouveau bloc en clair,
    // suivi de l'ancien contenu resté sous sa forme chiffrée.
    const ancien = encryptString('Note historique de l\'admin.');
    const corrompu = `[APPEL 2026-09-09T10:00:00.000Z] Décroché\n→ ok\n\n---\n\n${ancien}`;

    const lisible = lireNotesAdmin(corrompu);

    expect(lisible).toContain('[APPEL 2026-09-09T10:00:00.000Z] Décroché');
    expect(lisible).toContain('Note historique de l\'admin.');
    expect(lisible).not.toContain('v1:');
  });

  it('remplace un bloc indéchiffrable par un marqueur au lieu de lever', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    // IV et tag authentiques, texte chiffré remplacé : c'est ce que produit une
    // rotation de clé ou une troncature en base. `decipher.final()` lève sur un
    // tag qui ne correspond plus.
    const [prefixe, iv, tag] = encryptString('Note d\'origine').split(':');
    const faux = `${prefixe}:${iv}:${tag}:${Buffer.from('autre contenu').toString('base64')}`;

    expect(() => lireNotesAdmin(faux)).not.toThrow();
    expect(lireNotesAdmin(faux)).toBe(MARQUEUR_ILLISIBLE);
    expect(lireNotesAdmin(`Avant\n\n${faux}`)).toBe(`Avant\n\n${MARQUEUR_ILLISIBLE}`);
  });

  it('traverse les valeurs vides sans rien inventer', () => {
    expect(lireNotesAdmin(null)).toBeNull();
    expect(lireNotesAdmin(undefined)).toBeNull();
    expect(lireNotesAdmin('')).toBe('');
  });
});
