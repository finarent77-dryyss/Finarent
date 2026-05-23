import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { currentAffiliateId } from '@/lib/affiliate';
import { computeEngagementScore } from '@/lib/prospects/scoring';

const COOKIE_NAME = 'finarent_anon';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 an

// POST — Tracking évènement simulateur (anonyme, depuis le navigateur).
// Crée/upserte un Prospect lié à un cookie + ajoute un ProspectEvent.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const {
    simulatorSlug, category, params, result,
    email, phone, name, company, source,
    utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
    referrer, landingPage,
  } = body || {};

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

  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null;
  const userAgent = request.headers.get('user-agent') || null;
  const url = body.url || request.headers.get('referer') || null;

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

  let prospect = await prisma.prospect.upsert({
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
