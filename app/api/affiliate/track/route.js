import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/affiliate';
import { extractRequestContext } from '@/lib/audit';
import { trouverParrainParCode, COOKIE_PARRAINAGE, DUREE_COOKIE_PARRAINAGE } from '@/lib/referral';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';

/**
 * POST /api/affiliate/track
 * Endpoint public appelé par <AffiliateTracker /> dès qu'un visiteur arrive
 * avec `?ref=CODE`. Pose un cookie 90 jours et log le clic en base.
 *
 * Body : { code: string, landingPath?: string, referer?: string }
 */
export async function POST(request) {
  try {
    const body = await lireCorpsJson(request);
    if (!body) return reponseCorpsInvalide('Corps de requête JSON absent ou invalide.');

    // Type contrôlé avant `.trim()` : un `code` numérique levait sinon.
    const code = typeof body.code === 'string' ? body.code.trim().slice(0, 64) : '';
    if (!code) {
      return NextResponse.json({ ok: false, error: 'Code manquant ou invalide' }, { status: 400 });
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { code },
      select: { id: true, isActive: true },
    });

    if (!affiliate || !affiliate.isActive) {
      // Le paramètre `?ref=` sert aussi au parrainage client. Avant, un code de
      // parrainage tombait ici et repartait sans rien : le clic du filleul
      // était purement perdu.
      const parrain = await trouverParrainParCode(prisma, code);
      if (parrain) {
        const res = NextResponse.json({ ok: true });
        res.cookies.set(COOKIE_PARRAINAGE, parrain.referralCode, {
          maxAge: DUREE_COOKIE_PARRAINAGE,
          httpOnly: true, // aucun usage client, contrairement au cookie affilié
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        });
        return res;
      }

      // On retourne 200 silencieusement pour ne pas révéler aux scrapers
      // si un code est valide ou pas
      return NextResponse.json({ ok: true });
    }

    const { ip, userAgent } = extractRequestContext(request);

    await prisma.affiliateClick.create({
      data: {
        affiliateId: affiliate.id,
        landingPath: typeof body.landingPath === 'string' ? body.landingPath.slice(0, 200) : null,
        referer: typeof body.referer === 'string' ? body.referer.slice(0, 500) : null,
        ip,
        userAgent: userAgent?.slice(0, 500) || null,
      },
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, code, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false, // accessible client-side pour debug + lecture par le wizard
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  } catch (err) {
    return reponseErreurPrisma(err, { contexte: 'POST /api/affiliate/track' });
  }
}
