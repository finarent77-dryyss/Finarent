import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/affiliate';
import { extractRequestContext } from '@/lib/audit';

/**
 * POST /api/affiliate/track
 * Endpoint public appelé par <AffiliateTracker /> dès qu'un visiteur arrive
 * avec `?ref=CODE`. Pose un cookie 90 jours et log le clic en base.
 *
 * Body : { code: string, landingPath?: string, referer?: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const code = (body?.code || '').trim().slice(0, 64);
    if (!code) {
      return NextResponse.json({ ok: false, error: 'Code manquant' }, { status: 400 });
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { code },
      select: { id: true, isActive: true },
    });
    if (!affiliate || !affiliate.isActive) {
      // On retourne 200 silencieusement pour ne pas révéler aux scrapers
      // si un code est valide ou pas
      return NextResponse.json({ ok: true });
    }

    const { ip, userAgent } = extractRequestContext(request);

    await prisma.affiliateClick.create({
      data: {
        affiliateId: affiliate.id,
        landingPath: body?.landingPath?.slice(0, 200) || null,
        referer: body?.referer?.slice(0, 500) || null,
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
    console.error('POST /api/affiliate/track error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
