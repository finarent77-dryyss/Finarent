import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendInvite } from '@/lib/affiliate-invite';
import { checkRateLimit } from '@/lib/rateLimit';
import { ipClient } from '@/lib/ip-client';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';

/**
 * POST /api/affiliate/[code]/invite
 * Endpoint PUBLIC appelé depuis /affiliate/[code] (page perso de l'apporteur).
 * Envoie une invitation à un destinataire avec le tracking du code.
 *
 * Anti-spam :
 * - max 5 invitations par sessionStorage côté client (best effort)
 * - dédup serveur : pas plus d'1 invite/email/affilié sur 7 jours
 * - affilié doit être actif ET publicStatsEnabled
 *
 * Body : { recipientEmail: string, recipientName?: string, message?: string }
 */
export async function POST(request, { params }) {
  try {
    // Cet endpoint declenche de vrais envois via notre compte d'emailing,
    // sans authentification. La deduplication par destinataire sur 7 jours
    // n'empeche pas de boucler sur des milliers d'adresses differentes :
    // sans quota par IP, le site sert de relais de spam et la reputation
    // du domaine d'envoi en pâtit.
    if (!(await checkRateLimit(ipClient(request), { bucket: 'invite', max: 10 })).allowed) {
      return NextResponse.json(
        { error: "Trop d'invitations envoyées. Réessayez plus tard." },
        { status: 429 },
      );
    }

    const { code } = await params;
    const body = await lireCorpsJson(request);
    if (!body) return reponseCorpsInvalide('Corps de requête JSON absent ou invalide.');

    const affiliate = await prisma.affiliate.findUnique({
      where: { code: String(code).toUpperCase() },
      select: { id: true, code: true, name: true, isActive: true, publicStatsEnabled: true },
    });

    if (!affiliate || !affiliate.isActive || !affiliate.publicStatsEnabled) {
      return NextResponse.json({ error: 'Affilié indisponible' }, { status: 404 });
    }

    const result = await sendInvite({
      affiliate,
      recipientEmail: body.recipientEmail,
      recipientName: body.recipientName,
      message: body.message,
      source: 'AFFILIATE_PAGE',
      request,
    });

    if (!result.ok && !result.skipped) {
      return NextResponse.json({ error: result.error || 'Échec d\'envoi' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      skipped: !!result.skipped,
      message: result.skipped
        ? 'Cette personne a déjà été invitée cette semaine.'
        : 'Invitation envoyée avec succès.',
    });
  } catch (err) {
    return reponseErreurPrisma(err, {
      contexte: 'POST /api/affiliate/[code]/invite',
      introuvable: 'Affilié indisponible',
    });
  }
}
