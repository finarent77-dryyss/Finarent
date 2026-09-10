import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import { ipClient } from '@/lib/ip-client';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';
import { sendMail } from '@/lib/email/send.js';
import { templateBienvenueNewsletter } from '@/lib/email/templates.js';
import { subscribeToMarketingList } from '@/lib/brevo/contacts.js';

/**
 * Accueil d'un nouvel inscrit : email de bienvenue + ajout à la liste
 * marketing Brevo. Volontairement détaché de la réponse HTTP — l'inscription
 * est déjà enregistrée en base, un incident Brevo ne doit pas la faire
 * échouer côté visiteur.
 */
function accueillir(email) {
  const { subject, html, text } = templateBienvenueNewsletter({ to: email });
  void sendMail({
    to: email,
    subject,
    html,
    text,
    commercial: true,
    tags: ['newsletter', 'bienvenue'],
    log: { source: 'NEWSLETTER_WELCOME' },
  }).catch((e) => console.error('[newsletter] bienvenue non envoyée :', e.message));

  void subscribeToMarketingList(email, { SOURCE: 'FINARENT_NEWSLETTER' }).catch((e) =>
    console.error('[newsletter] sync Brevo échouée :', e.message),
  );
}

export async function POST(request) {
  try {
    const ip = ipClient(request);
    if (!(await checkRateLimit(ip)).allowed) {
      return NextResponse.json({ error: 'Trop de requêtes. Réessayez plus tard.' }, { status: 429 });
    }

    const body = await lireCorpsJson(request);
    if (!body) {
      return reponseCorpsInvalide('Corps de requête JSON absent ou invalide.');
    }

    // Honeypot : champ invisible rempli = bot → succès silencieux
    if (body.website) {
      return NextResponse.json({ success: true, message: 'Inscription réussie' });
    }

    // Contrôle de TYPE avant tout traitement. `body?.email?.trim()` protégeait
    // du `null` et de l'`undefined` mais pas d'un type inattendu :
    // `{"email":12345}` levait `body?.email?.trim is not a function` et
    // repartait en 500 (RUN-02), sans jamais atteindre les contrôles suivants.
    if (typeof body.email !== 'string') {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();

    if (!email || email.length > 254) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }
    // Regex stricte : lettres/chiffres/. + - _ ; pas de < > pour éviter HTML injection
    if (!/^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: true, message: 'Déjà inscrit' });
    }

    await prisma.newsletter.create({ data: { email } });
    accueillir(email);
    return NextResponse.json({ success: true, message: 'Inscription réussie' });
  } catch (err) {
    // Deux inscriptions simultanées de la même adresse passent toutes deux le
    // `findUnique` puis se heurtent à la contrainte d'unicité : P2002 est ici
    // un doublon inoffensif, pas un incident. On répond comme pour un inscrit
    // déjà connu plutôt que d'afficher une erreur au visiteur.
    if (err?.code === 'P2002') {
      return NextResponse.json({ success: true, message: 'Déjà inscrit' });
    }
    return reponseErreurPrisma(err, { contexte: 'POST /api/newsletter' });
  }
}
