import { NextResponse } from 'next/server';
import { verifyRingoverWebhook } from '@/lib/ringover/verify';
import { processRingoverCallEvent } from '@/lib/ringover/process-call-event';
import {
  isContactSearchEvent,
  lookupRingoverContact,
  searchRingoverContacts,
} from '@/lib/ringover/contact-search';

export const dynamic = 'force-dynamic';

/**
 * Webhook Ringover — centres d'appel Finarent
 *
 * URL à configurer dans Ringover Dashboard → Developer → Webhooks :
 *   https://finarent.fr/api/webhooks/ringover
 *
 * Événements recommandés :
 *   - Call hangup (webhook_ended)
 *   - Call missed (missedcalls)
 *   - Call voicemail (webhook_voicemail)
 *   - Contact search (webhook_local_search) — même URL
 *
 * Variable d'environnement : RINGOVER_WEBHOOK_KEY
 */
export async function POST(request) {
  if (!verifyRingoverWebhook(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const event = payload.event?.toLowerCase();
  const resource = payload.resource?.toLowerCase();
  const ressource = payload.ressource?.toLowerCase();
  const { data } = payload;

  try {
    if (isContactSearchEvent(event, resource, ressource, data)) {
      const query = data?.query_search?.trim() || '';
      const results = await searchRingoverContacts(query);
      return NextResponse.json(results);
    }

    if (event === 'contact' && resource === 'call' && data) {
      const contact = await lookupRingoverContact(data);
      if (!contact) {
        return NextResponse.json({}, { status: 200 });
      }
      return NextResponse.json({
        uuid: contact.uuid,
        firstname: contact.firstname,
        lastname: contact.lastname,
        company: contact.company,
        url: contact.url,
        data: { prospectId: contact.uuid, email: data.from_number || data.to_number },
        is_shared: true,
      });
    }

    if (resource === 'call' && event && data) {
      const result = await processRingoverCallEvent(event, data, payload.timestamp);
      if (!result.ok) {
        console.error('[ringover] process call failed:', result.error);
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json({ ...result, ok: true });
    }

    return NextResponse.json({ ok: true, ignored: event || 'unknown' });
  } catch (err) {
    console.error('[ringover] webhook error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Finarent — Ringover webhook',
    status: 'ready',
    configured: Boolean(process.env.RINGOVER_WEBHOOK_KEY),
  });
}
