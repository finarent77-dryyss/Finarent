import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';

// GET - List partners with webhook configs
export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const partners = await prisma.partner.findMany({
    select: { id: true, name: true, type: true, contactEmail: true, notes: true, isActive: true },
    orderBy: { name: 'asc' },
  });

  // Parse webhook config from notes field
  const result = partners.map(p => {
    let webhookConfig = null;
    try {
      const parsed = JSON.parse(p.notes || '{}');
      webhookConfig = parsed.webhook || null;
    } catch {
      // notes is not valid JSON, ignore
    }
    return { ...p, webhookConfig };
  });

  return NextResponse.json(result);
}

// POST - Set webhook URL for a partner
export async function POST(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  // Aucun écran du dépôt n'appelle cette route : ni `app/admin/**` ni
  // `components/admin/**` ne la référencent, elle n'est citée que par la
  // documentation (CAHIER_DES_CHARGES.md, PROJECT_HANDOFF.md). Les champs lus
  // ici sont donc ceux que la route déclare, faute d'appelant à relever.
  const body = await lireCorpsJson(request);
  if (!body) return reponseCorpsInvalide();
  const { partnerId, webhookUrl, events } = body;

  if (!partnerId) {
    return NextResponse.json({ error: 'Identifiant du partenaire requis' }, { status: 400 });
  }

  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  if (!partner) {
    return NextResponse.json({ error: 'Partenaire introuvable' }, { status: 404 });
  }

  // Store webhook config in notes as JSON
  let existingNotes = {};
  try { existingNotes = JSON.parse(partner.notes || '{}'); } catch {
    // notes is not valid JSON, start fresh
  }

  existingNotes.webhook = webhookUrl ? {
    url: webhookUrl,
    events: events || ['APPLICATION_TRANSMITTED', 'APPLICATION_APPROVED', 'APPLICATION_COMPLETED'],
    createdAt: new Date().toISOString(),
  } : null;

  try {
    await prisma.partner.update({
      where: { id: partnerId },
      data: { notes: JSON.stringify(existingNotes) },
    });
  } catch (err) {
    return reponseErreurPrisma(err, {
      contexte: 'POST /api/admin/webhooks',
      introuvable: 'Partenaire introuvable',
    });
  }

  return NextResponse.json({ success: true });
}
