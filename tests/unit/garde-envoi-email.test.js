/**
 * Garde d'envoi d'email hors production (défaut RUN-05).
 *
 * Le défaut constaté à l'exécution : un `npm run dev` avec le relais Brevo
 * renseigné dans le `.env` local a expédié deux messages réels, dont un vers
 * la boîte d'exploitation `admin@finarent.com`. Rien ne distinguait le poste
 * d'un développeur d'un serveur de production.
 *
 * Le test décisif est le dernier bloc : `sendMail` est appelé avec un canal
 * Brevo pleinement configuré, et l'on vérifie qu'**aucune requête réseau ne
 * part**. Vérifier `envoiReelAutorise()` seul ne prouverait rien sur le
 * transport.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Prisma est remplacé, et ce n'est pas une commodité de test.
 *
 * `lib/email/send.js` journalise chaque envoi dans `EmailLog` via un import
 * paresseux de `@/lib/prisma`. Or le client Prisma charge `.env` de lui-même :
 * effacer `process.env.DATABASE_URL` dans le test ne l'empêche pas de trouver
 * la base de développement et d'y écrire. Sans ce doublon, `npm test`
 * déposerait une ligne dans la vraie base à chaque exécution — exactement le
 * cloisonnement défaillant que RUN-05 corrige, transposé aux tests.
 */
const prismaMoque = vi.hoisted(() => ({ emailLog: { create: vi.fn() } }));
vi.mock('@/lib/prisma', () => ({ prisma: prismaMoque }));

import {
  envoiReelAutorise,
  simulerEnvoi,
  raisonGarde,
  identifiantSimule,
  VARIABLE_AUTORISATION,
  DOSSIER_SIMULATION,
} from '@/lib/email/garde-envoi';

describe('envoiReelAutorise', () => {
  it('autorise l\'envoi en production, sans rien exiger de plus', () => {
    // Le chemin de production doit rester strictement inchangé : aucune
    // variable supplémentaire à poser pour que le courrier parte.
    expect(envoiReelAutorise({ NODE_ENV: 'production' })).toBe(true);
  });

  it('bloque l\'envoi hors production par défaut', () => {
    expect(envoiReelAutorise({ NODE_ENV: 'development' })).toBe(false);
    expect(envoiReelAutorise({ NODE_ENV: 'test' })).toBe(false);
    expect(envoiReelAutorise({})).toBe(false);
  });

  it('bloque même quand un canal est configuré — c\'est tout l\'objet de la garde', () => {
    expect(
      envoiReelAutorise({
        NODE_ENV: 'development',
        BREVO_API_KEY: 'xkeysib-vraie-cle',
        SMTP_HOST: 'smtp-relay.brevo.com',
        SMTP_USER: 'compte@finarent.com',
        SMTP_PASS: 'xsmtpsib-vrai-secret',
      }),
    ).toBe(false);
  });

  it('rétablit l\'envoi sur variable explicite', () => {
    for (const valeur of ['1', 'true', 'TRUE', 'oui', 'Yes', 'on']) {
      expect(envoiReelAutorise({ NODE_ENV: 'development', [VARIABLE_AUTORISATION]: valeur }))
        .toBe(true);
    }
  });

  it('ne se laisse pas ouvrir par une valeur qui ne dit pas oui', () => {
    for (const valeur of ['', ' ', '0', 'false', 'non', 'no', 'off', 'peut-etre', 'null']) {
      expect(envoiReelAutorise({ NODE_ENV: 'development', [VARIABLE_AUTORISATION]: valeur }))
        .toBe(false);
    }
  });
});

describe('raisonGarde', () => {
  it('nomme l\'environnement et la variable à poser', () => {
    const texte = raisonGarde({ NODE_ENV: 'development' });
    expect(texte).toContain('NODE_ENV=development');
    expect(texte).toContain(VARIABLE_AUTORISATION);
  });
});

describe('identifiantSimule', () => {
  it('est reconnaissable et jamais confondu avec un identifiant Brevo', () => {
    const id = identifiantSimule();
    expect(id).toMatch(/^<simule-\d+-[a-z0-9]+@finarent\.local>$/);
    expect(id).not.toContain('smtp-relay.mailin.fr');
    expect(identifiantSimule()).not.toBe(id);
  });
});

/**
 * Le dépôt sur disque est le comportement attendu. Ces deux aides retirent
 * seulement ce que les tests viennent d'y écrire, pour que la suite n'accumule
 * pas un message de plus à chaque exécution.
 */
const DOSSIER_DEPOT = path.resolve(process.cwd(), DOSSIER_SIMULATION);

function listerDepot() {
  try {
    return new Set(fs.readdirSync(DOSSIER_DEPOT));
  } catch {
    return new Set();
  }
}

function nettoyerDepot(fichiersAvant) {
  for (const nom of listerDepot()) {
    if (fichiersAvant.has(nom)) continue;
    try {
      fs.unlinkSync(path.join(DOSSIER_DEPOT, nom));
    } catch {
      // Le dépôt a pu échouer : ce n'est pas l'objet de ces tests.
    }
  }
}

describe('simulerEnvoi', () => {
  const message = {
    to: 'camille.durand@example.com',
    subject: 'Demande FIN-2026-00001 enregistrée — Finarent',
    html: '<html><body><h1>Bonjour</h1></body></html>',
    text: 'Bonjour, votre demande FIN-2026-00001 est enregistrée.',
    from: { name: 'Finarent', email: 'ne-pas-repondre@finarent.com' },
    replyTo: 'contact@finarent.com',
    headers: { 'List-Unsubscribe': '<https://finarent.com/api/newsletter/unsubscribe>' },
    pieces: [],
    commercial: false,
  };

  let fichiersAvant;

  beforeEach(() => {
    fichiersAvant = listerDepot();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    nettoyerDepot(fichiersAvant);
  });

  it('rend le message dans la console : destinataire, sujet, corps, et le fait qu\'il n\'est pas parti', async () => {
    await simulerEnvoi(message, { NODE_ENV: 'development' });

    expect(console.warn).toHaveBeenCalledTimes(1);
    const sortie = console.warn.mock.calls[0][0];
    expect(sortie).toContain('NON ENVOYÉ');
    expect(sortie).toContain('camille.durand@example.com');
    expect(sortie).toContain('Demande FIN-2026-00001 enregistrée');
    expect(sortie).toContain('votre demande FIN-2026-00001 est enregistrée');
    expect(sortie).toContain(VARIABLE_AUTORISATION);
  });

  it('dépose le message dans un dossier ignoré par git', async () => {
    const { fichiers } = await simulerEnvoi(message, { NODE_ENV: 'development' });

    expect(fichiers).not.toBeNull();
    const cheminHtml = path.resolve(process.cwd(), fichiers.html);
    const cheminTexte = path.resolve(process.cwd(), fichiers.texte);

    // `.email-preview/` est couvert par `.gitignore` (même dossier que
    // `scripts/preview-emails.mjs`, qui rend les gabarits sans rien envoyer).
    expect(fichiers.html.replace(/\\/g, '/')).toContain(DOSSIER_SIMULATION);
    expect(fs.existsSync(cheminHtml)).toBe(true);
    expect(fs.existsSync(cheminTexte)).toBe(true);

    // Le HTML est déposé tel quel : il doit s'afficher comme chez le destinataire.
    expect(fs.readFileSync(cheminHtml, 'utf8')).toBe(message.html);

    // Le .txt porte les métadonnées d'enveloppe puis le corps.
    const texte = fs.readFileSync(cheminTexte, 'utf8');
    expect(texte).toContain('MESSAGE NON ENVOYÉ');
    expect(texte).toContain('camille.durand@example.com');
    expect(texte).toContain('ne-pas-repondre@finarent.com');
    expect(texte).toContain('List-Unsubscribe');
    expect(texte).toContain('votre demande FIN-2026-00001 est enregistrée');
  });

  it('rend un identifiant de message local', async () => {
    const { messageId } = await simulerEnvoi(message, { NODE_ENV: 'development' });
    expect(messageId).toContain('@finarent.local');
  });

  it('ne lève pas quand le dépôt sur disque échoue', async () => {
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {
      throw new Error('EROFS: read-only file system');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Un système de fichiers en lecture seule ne doit pas transformer une
    // simulation en échec de route : la console reste le canal de repli.
    const { messageId, fichiers } = await simulerEnvoi(message, { NODE_ENV: 'development' });
    expect(fichiers).toBeNull();
    expect(messageId).toContain('@finarent.local');
    expect(console.warn).toHaveBeenCalled();
  });
});

describe('sendMail — le transport est réellement neutralisé', () => {
  let envInitial;
  let fichiersAvant;

  beforeEach(() => {
    envInitial = { ...process.env };
    fichiersAvant = listerDepot();
    prismaMoque.emailLog.create.mockReset();
    prismaMoque.emailLog.create.mockImplementation(async ({ data }) => ({
      id: 'emaillog-de-test',
      ...data,
    }));
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Canal Brevo pleinement configuré : c'est exactement la situation du
    // `.env` local qui a expédié deux vrais messages.
    process.env.BREVO_API_KEY = 'xkeysib-cle-de-test';
    process.env.BREVO_SENDER_EMAIL = 'ne-pas-repondre@finarent.com';
    // Aucun canal SMTP, pour que le repli ne brouille pas la lecture du test.
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    // Sans base, `EmailLog` n'est pas écrit — la journalisation est déjà
    // protégée par son propre try/catch dans `lib/email/send.js`.
    delete process.env.DATABASE_URL;
    delete process.env[VARIABLE_AUTORISATION];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    process.env = envInitial;
    nettoyerDepot(fichiersAvant);
  });

  /** Note tout appel réseau et renvoie une réponse Brevo plausible. */
  function espionReseau() {
    const appels = [];
    vi.stubGlobal('fetch', vi.fn(async (url, init) => {
      appels.push({ url: String(url), init });
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ messageId: '<202609091036.888@smtp-relay.mailin.fr>' }),
      };
    }));
    return appels;
  }

  it('n\'émet AUCUNE requête vers Brevo hors production', async () => {
    const appels = espionReseau();
    const { sendMail } = await import('@/lib/email/send.js');

    const res = await sendMail({
      to: 'admin@finarent.com',
      subject: '[Finarent] Nouvelle demande FIN-2026-00001 — Runtime Test SAS',
      html: '<p>Nouvelle demande.</p>',
      text: 'Nouvelle demande.',
    });

    // Le point qui compte : le relais n'a pas été sollicité.
    expect(appels).toHaveLength(0);
    expect(res.sent).toBe(true);
    expect(res.provider).toBe('CONSOLE');
    expect(res.simule).toBe(true);
    expect(res.messageId).toContain('@finarent.local');

    // Le message a bien été rendu quelque part : console et/ou fichier.
    expect(console.warn).toHaveBeenCalled();
    expect(console.warn.mock.calls[0][0]).toContain('admin@finarent.com');

    // L'entrée `EmailLog` reste écrite — l'admin doit voir le message — mais
    // elle est marquée sans ambiguïté comme simulée.
    expect(prismaMoque.emailLog.create).toHaveBeenCalledTimes(1);
    const { data } = prismaMoque.emailLog.create.mock.calls[0][0];
    expect(data.status).toBe('SENT');
    expect(data.metadata.provider).toBe('CONSOLE');
    expect(data.metadata.simule).toBe(true);
    expect(data.brevoMessageId).toContain('@finarent.local');
  });

  it('laisse partir l\'envoi quand la variable d\'autorisation est posée', async () => {
    process.env[VARIABLE_AUTORISATION] = '1';
    const appels = espionReseau();
    const { sendMail } = await import('@/lib/email/send.js');

    const res = await sendMail({
      to: 'camille.durand@example.com',
      subject: 'Recette de délivrabilité',
      html: '<p>Test.</p>',
      text: 'Test.',
    });

    expect(appels).toHaveLength(1);
    expect(appels[0].url).toContain('/smtp/email');
    expect(res.sent).toBe(true);
    expect(res.provider).toBe('BREVO');
    expect(res.simule).toBeUndefined();
  });

  it('refuse toujours une adresse invalide avant même la garde', async () => {
    const appels = espionReseau();
    const { sendMail } = await import('@/lib/email/send.js');

    const res = await sendMail({ to: 'pas-une-adresse', subject: 'x', html: '<p>x</p>' });

    expect(appels).toHaveLength(0);
    expect(res.sent).toBe(false);
    expect(res.error).toBe('Adresse email invalide');
  });

  it('rend le message même quand aucun canal n\'est configuré', async () => {
    // Sans la garde, ce cas partait dans la branche « aucun canal » et
    // journalisait un échec ; le développeur ne voyait jamais le message.
    delete process.env.BREVO_API_KEY;
    const appels = espionReseau();
    const { sendMail } = await import('@/lib/email/send.js');

    const res = await sendMail({
      to: 'camille.durand@example.com',
      subject: 'Confirmation',
      html: '<p>Bonjour.</p>',
      text: 'Bonjour.',
    });

    expect(appels).toHaveLength(0);
    expect(res.provider).toBe('CONSOLE');
    expect(console.warn.mock.calls[0][0]).toContain('camille.durand@example.com');
  });
});
