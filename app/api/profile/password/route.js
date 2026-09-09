import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { extractRequestContext } from '@/lib/audit';
import { identityProvider } from '@/lib/identity-provider.js';

/**
 * Modification du mot de passe.
 *
 * Les mots de passe vivent chez Auth0, jamais chez nous : on demande donc à
 * Auth0 d'envoyer au client un lien de changement de mot de passe
 * (endpoint public /dbconnections/change_password, pas de Management API à
 * provisionner). Le lien part sur l'email du compte : un attaquant qui aurait
 * une session ouverte ne peut pas s'en servir pour prendre la main.
 *
 * Ne concerne que les comptes email + mot de passe (sub "auth0|…") : un compte
 * Google/Microsoft n'a pas de mot de passe Finarent.
 */

function auth0Domain() {
  const raw =
    process.env.AUTH0_DOMAIN ||
    (process.env.AUTH0_ISSUER_BASE_URL || '').replace(/^https?:\/\//, '');
  return raw.replace(/\/+$/, '').trim();
}

export async function POST(request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { isDatabase, label } = identityProvider(auth.auth0User.sub);
  if (!isDatabase) {
    return NextResponse.json(
      {
        error: `Votre compte se connecte via ${label}. Le mot de passe se modifie directement chez ${label}.`,
        code: 'SOCIAL_CONNECTION',
      },
      { status: 409 },
    );
  }

  // L'appel déclenche un email : on limite pour ne pas transformer la route en canon à spam.
  const { ip } = extractRequestContext(request);
  const { allowed } = await checkRateLimit(ip || auth.dbUser.id, {
    bucket: 'profile-password',
    max: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de demandes. Réessayez dans une heure.' },
      { status: 429 },
    );
  }

  const domain = auth0Domain();
  const clientId = process.env.AUTH0_CLIENT_ID;
  const connection = process.env.AUTH0_DB_CONNECTION || 'Username-Password-Authentication';

  if (!domain || !clientId) {
    console.error('[profile/password] AUTH0_DOMAIN ou AUTH0_CLIENT_ID manquant');
    return NextResponse.json(
      { error: 'Service indisponible. Contactez le support.' },
      { status: 500 },
    );
  }

  let res;
  try {
    res = await fetch(`https://${domain}/dbconnections/change_password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, email: auth.dbUser.email, connection }),
    });
  } catch (err) {
    console.error('[profile/password] appel Auth0 échoué:', err.message);
    return NextResponse.json({ error: "L'envoi a échoué. Réessayez plus tard." }, { status: 502 });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('[profile/password] Auth0', res.status, detail);
    return NextResponse.json({ error: "L'envoi a échoué. Réessayez plus tard." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, email: auth.dbUser.email });
}
