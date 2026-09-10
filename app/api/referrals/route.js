import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import { ipClient } from '@/lib/ip-client';
import { lireCorpsJson, reponseCorpsInvalide } from '@/lib/reponses-api';
import { assurerCodeParrainage, genererCodeParrainage } from '@/lib/referral';
import { sendMail } from '@/lib/email/send.js';
import { templateInvitationParrainage } from '@/lib/email/templates.js';

/**
 * Parrainage client.
 *
 * Le POST ne faisait qu'écrire une ligne en base : aucun email ne partait, le
 * filleul n'était jamais prévenu, et l'utilisateur croyait avoir invité
 * quelqu'un. C'est corrigé ici, avec les garde-fous qui manquaient
 * (validation, anti-doublon, anti-auto-parrainage, débit limité).
 */

const RE_EMAIL = /^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  // Le code est créé à la volée s'il manque : les comptes existants n'en
  // avaient aucun, la page affichait un repli que rien ne savait résoudre.
  const code = await assurerCodeParrainage(prisma, auth.dbUser.id);

  const referrals = await prisma.referral.findMany({
    where: { referrerId: auth.dbUser.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    code,
    referrals,
    stats: {
      invitations: referrals.length,
      inscrits: referrals.filter((r) => r.status === 'SIGNED_UP' || r.status === 'CONVERTED').length,
      convertis: referrals.filter((r) => r.status === 'CONVERTED').length,
    },
  });
}

export async function POST(request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const limite = await checkRateLimit(ipClient(request), { bucket: 'parrainage' });
  if (!limite.allowed) {
    return NextResponse.json(
      { error: 'Trop d\'invitations envoyées. Réessayez plus tard.' },
      { status: 429 },
    );
  }

  const body = await lireCorpsJson(request);
  if (!body) return reponseCorpsInvalide('Corps de requête JSON absent ou invalide.');

  // Contrôle de type avant normalisation : `String({})` produirait
  // « [object Object] », que la regex rejette — mais autant refuser tôt et
  // pour la bonne raison.
  if (typeof body.refereeEmail !== 'string') {
    return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 });
  }
  const refereeEmail = body.refereeEmail.trim().toLowerCase();
  const refereeName = typeof body.refereeName === 'string' && body.refereeName.trim()
    ? body.refereeName.trim().slice(0, 100)
    : null;
  const message = typeof body.message === 'string' && body.message.trim()
    ? body.message.trim().slice(0, 500)
    : null;

  if (!refereeEmail || refereeEmail.length > 254 || !RE_EMAIL.test(refereeEmail)) {
    return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 });
  }
  if (refereeEmail === auth.dbUser.email?.toLowerCase()) {
    return NextResponse.json({ error: 'Vous ne pouvez pas vous parrainer vous-même.' }, { status: 400 });
  }

  const dejaClient = await prisma.user.findFirst({
    where: { email: refereeEmail },
    select: { id: true },
  });
  if (dejaClient) {
    return NextResponse.json(
      { error: 'Cette personne a déjà un compte Finarent.' },
      { status: 409 },
    );
  }

  const deja = await prisma.referral.findFirst({
    where: { referrerId: auth.dbUser.id, refereeEmail },
    select: { id: true },
  });
  if (deja) {
    return NextResponse.json(
      { error: 'Vous avez déjà invité cette adresse.' },
      { status: 409 },
    );
  }

  const codeParrain = await assurerCodeParrainage(prisma, auth.dbUser.id);

  const referral = await prisma.referral.create({
    data: {
      referrerId: auth.dbUser.id,
      refereeEmail,
      refereeName,
      // Code propre à l'invitation, distinct du code public du parrain.
      code: await genererCodeParrainage(prisma),
    },
  });

  const nomParrain = auth.dbUser.name || auth.dbUser.company || 'Un client Finarent';
  const { subject, html, text } = templateInvitationParrainage({
    to: refereeEmail,
    prenomFilleul: refereeName,
    nomParrain,
    code: codeParrain,
    message,
  });

  const envoi = await sendMail({
    to: refereeEmail,
    subject,
    html,
    text,
    commercial: true,
    // Jamais l'adresse personnelle du parrain en réponse.
    tags: ['parrainage'],
    log: {
      type: 'TRANSACTIONAL',
      source: 'PARRAINAGE_INVITATION',
      recipientName: refereeName,
      metadata: { referralId: referral.id, codeParrain },
    },
  });

  if (!envoi.sent) {
    // L'invitation reste en base — l'utilisateur doit savoir que le message
    // n'est pas parti, plutôt que de croire son filleul prévenu.
    console.error('[parrainage] invitation non envoyée :', envoi.error);
    return NextResponse.json(
      { ...referral, envoye: false, error: 'Invitation enregistrée, mais l\'email n\'a pas pu être envoyé.' },
      { status: 202 },
    );
  }

  return NextResponse.json({ ...referral, envoye: true });
}
