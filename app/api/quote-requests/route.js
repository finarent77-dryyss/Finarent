import { NextResponse } from 'next/server';

/**
 * POST /api/quote-requests
 *
 * Réceptionne une demande de devis assurance depuis un tunnel QuoteWizard.
 * Stratégie minimale : log + 200. La vraie persistance (Prisma) et le
 * mail conseiller (Resend / EmailJS) à brancher quand le modèle de
 * données prospects est figé (cf. lib/prospects/ et app/api/prospects/).
 */
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
    }
    if (!data.email || !/^[^@]+@[^@]+\.[^@]+$/.test(data.email)) {
      return NextResponse.json({ error: 'Email manquant ou invalide' }, { status: 400 });
    }
    if (!data.product) {
      return NextResponse.json({ error: 'Produit manquant' }, { status: 400 });
    }

    // TODO : persister dans Prisma (modèle Prospect/QuoteRequest), notifier l'équipe
    // commerciale par mail, déclencher la confirmation client.
    console.log('[quote-request]', data.product, data.email, JSON.stringify(data).slice(0, 500));

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('[quote-request] error', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
