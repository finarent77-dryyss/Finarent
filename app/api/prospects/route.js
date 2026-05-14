import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'finarent_anon';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 an

// POST — Tracking évènement simulateur (anonyme, depuis le navigateur).
// Crée/upserte un Prospect lié à un cookie + ajoute un ProspectEvent.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const { simulatorSlug, category, params, result, email, phone, name, company, source } = body || {};

  if (!simulatorSlug || typeof simulatorSlug !== 'string') {
    return NextResponse.json({ error: 'simulatorSlug required' }, { status: 400 });
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

  // Upsert prospect
  const data = {
    anonId,
    lastSeenAt: new Date(),
    ipAddress,
    userAgent,
  };
  if (email) data.email = String(email).trim().toLowerCase().slice(0, 200);
  if (phone) data.phone = String(phone).trim().slice(0, 30);
  if (name) data.name = String(name).trim().slice(0, 100);
  if (company) data.company = String(company).trim().slice(0, 150);
  if (source) data.source = String(source).slice(0, 100);

  const prospect = await prisma.prospect.upsert({
    where: { anonId },
    create: data,
    update: {
      lastSeenAt: data.lastSeenAt,
      ...(data.email ? { email: data.email } : {}),
      ...(data.phone ? { phone: data.phone } : {}),
      ...(data.name ? { name: data.name } : {}),
      ...(data.company ? { company: data.company } : {}),
      ...(data.source ? { source: data.source } : {}),
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

  const res = NextResponse.json({ ok: true, anonId });
  if (setCookie) {
    res.cookies.set(COOKIE_NAME, anonId, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false, // accessible côté client pour debug si besoin
      sameSite: 'lax',
      path: '/',
    });
  }
  return res;
}
