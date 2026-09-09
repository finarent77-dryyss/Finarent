import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe.js';
import { blocklistContact } from '@/lib/brevo/contacts.js';
import { BRAND_COLORS, COMPANY_INFO, escapeHtml } from '@/lib/branding.js';

/**
 * Désabonnement des emails commerciaux Finarent.
 *
 * GET  → clic sur le lien du pied de page, renvoie une page de confirmation.
 * POST → « one-click » RFC 8058, déclenché par le bouton natif de Gmail et
 *        d'Outlook. La spec impose un traitement sans page intermédiaire ni
 *        confirmation, d'où la réponse JSON.
 *
 * La route est publique par nature (le destinataire n'a pas de compte), d'où
 * le jeton HMAC : sans lui, n'importe qui pourrait désabonner n'importe quelle
 * adresse en devinant l'URL.
 */

export const dynamic = 'force-dynamic';

function page({ titre, message, ton = 'ok' }) {
  const accent = ton === 'ok' ? BRAND_COLORS.menthe : '#C2410C';
  return `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(titre)} — Finarent</title>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:${BRAND_COLORS.grisDoux}; color:${BRAND_COLORS.grisTexte};
         font-family:'Plus Jakarta Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif; padding:24px; }
  .carte { background:#fff; border:1px solid #E4E8EC; border-radius:18px; max-width:460px; width:100%;
           padding:36px 32px; text-align:center; box-shadow:0 8px 32px rgba(16,37,60,.08); }
  img { width:56px; height:56px; border-radius:28px; }
  h1 { margin:20px 0 10px; font-size:20px; color:${BRAND_COLORS.marine}; }
  p { margin:0 0 18px; font-size:15px; line-height:1.6; }
  .barre { height:3px; width:56px; margin:0 auto 8px; background:${accent}; border-radius:2px; }
  a.btn { display:inline-block; margin-top:8px; padding:12px 24px; border-radius:12px;
          background:${BRAND_COLORS.marine}; color:#fff; text-decoration:none; font-weight:700; font-size:14px; }
  small { display:block; margin-top:22px; font-size:12px; color:#737D8C; }
</style>
</head><body>
  <div class="carte">
    <img src="/icon-192.png" alt="Finarent">
    <h1>${escapeHtml(titre)}</h1>
    <div class="barre"></div>
    <p>${message}</p>
    <a class="btn" href="/">Retour sur finarent.com</a>
    <small>${escapeHtml(COMPANY_INFO.name)} — ${escapeHtml(COMPANY_INFO.email)} — ${escapeHtml(COMPANY_INFO.phone)}</small>
  </div>
</body></html>`;
}

function html(contenu, status = 200) {
  return new NextResponse(contenu, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

/**
 * Retire l'adresse de la liste locale et la place en liste de suppression
 * Brevo. Idempotent : un second clic sur le même lien ne produit pas d'erreur.
 */
async function desabonner(email) {
  await prisma.newsletter.deleteMany({ where: { email } });
  // Brevo porte la liste de suppression : même si l'adresse n'était pas dans
  // la table Newsletter (prospect importé, contact centre d'appels), l'envoi
  // doit cesser.
  await blocklistContact(email);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get('email') || '').trim().toLowerCase();
  const token = searchParams.get('token') || '';

  if (!email || !verifyUnsubscribeToken(email, token)) {
    return html(
      page({
        titre: 'Lien invalide',
        message:
          'Ce lien de désabonnement est incomplet ou expiré. Écrivez-nous à '
          + `<a href="mailto:${escapeHtml(COMPANY_INFO.email)}">${escapeHtml(COMPANY_INFO.email)}</a> `
          + 'et nous vous retirons de nos listes sous 48 h.',
        ton: 'erreur',
      }),
      400,
    );
  }

  try {
    await desabonner(email);
  } catch (e) {
    console.error('[unsubscribe] échec :', e);
    return html(
      page({
        titre: 'Désabonnement impossible',
        message:
          'Une erreur technique nous empêche de traiter votre demande. Écrivez-nous à '
          + `<a href="mailto:${escapeHtml(COMPANY_INFO.email)}">${escapeHtml(COMPANY_INFO.email)}</a>.`,
        ton: 'erreur',
      }),
      500,
    );
  }

  return html(
    page({
      titre: 'Vous êtes désabonné',
      message:
        `L'adresse <strong>${escapeHtml(email)}</strong> ne recevra plus d'email commercial de notre part. `
        + 'Les messages liés à un dossier en cours (confirmations, pièces manquantes) continuent d\'être envoyés.',
    }),
  );
}

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get('email') || '').trim().toLowerCase();
  const token = searchParams.get('token') || '';

  if (!email || !verifyUnsubscribeToken(email, token)) {
    return NextResponse.json({ error: 'Lien invalide' }, { status: 400 });
  }

  try {
    await desabonner(email);
  } catch (e) {
    console.error('[unsubscribe] échec one-click :', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
