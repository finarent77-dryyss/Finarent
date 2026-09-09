import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
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

function getClientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    if (!(await checkRateLimit(ip)).allowed) {
      return NextResponse.json({ error: 'Trop de requêtes. Réessayez plus tard.' }, { status: 429 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
    }

    // Honeypot : champ invisible rempli = bot → succès silencieux
    if (body?.website) {
      return NextResponse.json({ success: true, message: 'Inscription réussie' });
    }

    const email = body?.email?.trim()?.toLowerCase();

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
    console.error('Newsletter error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
