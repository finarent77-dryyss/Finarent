import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { currentAffiliateId } from '@/lib/affiliate';
import { computeEngagementScore } from '@/lib/prospects/scoring';
import { checkRateLimit } from '@/lib/rateLimit';
import { ipClient, ipClientOuNull } from '@/lib/ip-client';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';

const COOKIE_NAME = 'finarent_anon';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 an

// POST — Tracking évènement simulateur (anonyme, depuis le navigateur).
// Crée/upserte un Prospect lié à un cookie + ajoute un ProspectEvent.
export async function POST(request) {
  // Quota large : un visiteur genere legitimement plusieurs evenements
  // en enchainant les simulateurs.
  if (!(await checkRateLimit(ipClient(request), { bucket: 'prospects', max: 120 })).allowed) {
    return NextResponse.json({ error: 'Trop de requêtes.' }, { status: 429 });
  }

  // `lireCorpsJson` couvre en plus les cas que le `try/catch` laissait passer :
  // le littéral `null` et un tableau, qui traversaient jusqu'à `body.url`
  // quelques lignes plus bas et y levaient.
  const body = await lireCorpsJson(request);
  if (!body) return reponseCorpsInvalide('Corps de requête JSON absent ou invalide.');

  const {
    simulatorSlug, category, params, result,
    email, phone, name, company, source,
    utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
    referrer, landingPage,
  } = body;

  if (!simulatorSlug || typeof simulatorSlug !== 'string') {
    return NextResponse.json({ error: 'Identifiant du simulateur requis' }, { status: 400 });
  }

  // Récup cookie existant ou nouveau UUID
  const cookieJar = request.cookies;
  let anonId = cookieJar.get(COOKIE_NAME)?.value;
  let setCookie = false;
  if (!anonId || !/^[0-9a-f-]{20,}$/i.test(anonId)) {
    anonId = randomUUID();
    setCookie = true;
  }

  // Colonne de traçabilité : `null` plutôt que la sentinelle « inconnue »,
  // pour ne pas faire passer une absence d'information pour une information.
  const ipAddress = ipClientOuNull(request);
  const userAgent = request.headers.get('user-agent') || null;
  // Colonne `String?` : une valeur non textuelle serait refusée par Prisma et
  // finirait en 500 sur une entrée que la route doit simplement ignorer.
  const url = (typeof body.url === 'string' && body.url.trim() ? body.url.slice(0, 500) : null)
    || request.headers.get('referer')
    || null;

  // Upsert prospect — données identitaires écrasables, attribution first-touch.
  const data = { anonId, lastSeenAt: new Date(), ipAddress, userAgent };
  if (email) data.email = String(email).trim().toLowerCase().slice(0, 200);
  if (phone) data.phone = String(phone).trim().slice(0, 30);
  if (name) data.name = String(name).trim().slice(0, 100);
  if (company) data.company = String(company).trim().slice(0, 150);
  if (source) data.source = String(source).slice(0, 100);

  // Attribution marketing — uniquement en CREATE (first-touch)
  const attribCreate = {};
  if (utmSource) attribCreate.utmSource = String(utmSource).slice(0, 80);
  if (utmMedium) attribCreate.utmMedium = String(utmMedium).slice(0, 80);
  if (utmCampaign) attribCreate.utmCampaign = String(utmCampaign).slice(0, 80);
  if (utmTerm) attribCreate.utmTerm = String(utmTerm).slice(0, 80);
  if (utmContent) attribCreate.utmContent = String(utmContent).slice(0, 80);
  if (referrer) attribCreate.referrer = String(referrer).slice(0, 500);
  if (landingPage) attribCreate.landingPage = String(landingPage).slice(0, 500);

  const affiliateId = await currentAffiliateId();
  if (affiliateId) data.affiliateId = affiliateId;

  try {
    const prospect = await prisma.prospect.upsert({
      where: { anonId },
      create: { ...data, ...attribCreate },
      update: {
        lastSeenAt: data.lastSeenAt,
        ...(data.email ? { email: data.email } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.name ? { name: data.name } : {}),
        ...(data.company ? { company: data.company } : {}),
        ...(data.source ? { source: data.source } : {}),
        // attribution + affiliateId : not updated (first-touch wins)
      },
    });

    await prisma.prospectEvent.create({
      data: {
        prospectId: prospect.id,
        simulatorSlug: String(simulatorSlug).slice(0, 80),
        category: category ? String(category).slice(0, 80) : null,
        params: params ?? {},
        result: result ?? null,
        url,
      },
    });

    // Recompute engagement score (lit tous les events du prospect)
    const events = await prisma.prospectEvent.findMany({
      where: { prospectId: prospect.id },
      select: { simulatorSlug: true, params: true },
      take: 50,
    });
    const engagementScore = computeEngagementScore({ prospect, events });
    await prisma.prospect.update({
      where: { id: prospect.id },
      data: { engagementScore },
    });
  } catch (err) {
    return reponseErreurPrisma(err, { contexte: 'POST /api/prospects' });
  }

  const res = NextResponse.json({ ok: true, anonId });
  if (setCookie) {
    res.cookies.set(COOKIE_NAME, anonId, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    });
  }
  return res;
}
