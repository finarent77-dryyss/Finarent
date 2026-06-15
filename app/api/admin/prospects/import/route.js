import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseProspectCsv } from '@/lib/prospects/import-csv';
import { logAdminActivity } from '@/lib/admin-activity-log';

const MAX_ROWS = 2000;

/**
 * POST /api/admin/prospects/import
 * Importe des prospects depuis un CSV.
 *
 * Body : { csv: string }
 * Dédoublonnage : par email si présent, sinon par téléphone. Les prospects
 * existants sont mis à jour (champs vides du CSV n'écrasent pas la valeur
 * existante), les nouveaux sont créés avec source = "import-csv".
 *
 * Réponse : { ok, total, created, updated, skipped, errors[] }
 */
export async function POST(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const csv = typeof body?.csv === 'string' ? body.csv : '';
  if (!csv.trim()) {
    return NextResponse.json({ error: 'CSV vide' }, { status: 400 });
  }

  // Affectation optionnelle à un centre d'appel
  let callCenterId = body?.callCenterId ? String(body.callCenterId) : null;
  if (callCenterId) {
    const center = await prisma.callCenter.findUnique({ where: { id: callCenterId }, select: { id: true } });
    if (!center) {
      return NextResponse.json({ error: 'Centre d\'appel introuvable' }, { status: 400 });
    }
  }

  const { rows, errors, total } = parseProspectCsv(csv);
  if (rows.length === 0) {
    return NextResponse.json(
      { ok: false, total, created: 0, updated: 0, skipped: 0, errors: errors.length ? errors : ['Aucun prospect valide trouvé dans le fichier.'] },
      { status: 400 },
    );
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `Trop de lignes (${rows.length}). Maximum ${MAX_ROWS} par import.` },
      { status: 413 },
    );
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      // Recherche d'un prospect existant : email prioritaire, sinon téléphone
      let existing = null;
      if (row.email) {
        existing = await prisma.prospect.findFirst({ where: { email: row.email }, select: { id: true } });
      }
      if (!existing && row.phone) {
        existing = await prisma.prospect.findFirst({ where: { phone: row.phone }, select: { id: true } });
      }

      if (existing) {
        // On ne remplace que les champs fournis (pas d'écrasement par du vide)
        const data = { lastSeenAt: new Date() };
        if (row.name) data.name = row.name;
        if (row.email) data.email = row.email;
        if (row.phone) data.phone = row.phone;
        if (row.company) data.company = row.company;
        if (row.status) data.status = row.status;
        if (row.source) data.source = row.source;
        if (row.notes) data.notes = row.notes;
        if (callCenterId) data.callCenterId = callCenterId;

        await prisma.prospect.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        await prisma.prospect.create({
          data: {
            anonId: `import-${randomUUID()}`,
            name: row.name,
            email: row.email,
            phone: row.phone,
            company: row.company,
            status: row.status,
            source: row.source || 'import-csv',
            notes: row.notes,
            callCenterId,
          },
        });
        created++;
      }
    } catch (err) {
      skipped++;
      errors.push(`Échec sur « ${row.email || row.phone || row.name || 'ligne inconnue'} » : ${err.code || 'erreur'}`);
    }
  }

  await logAdminActivity({
    actorId: auth.dbUser?.id,
    module: 'crm',
    action: 'PROSPECT_IMPORTED',
    entityType: 'Prospect',
    summary: `Import CSV prospects : ${created} créé(s), ${updated} mis à jour${callCenterId ? ' (rattachés à un centre)' : ''}`,
    details: { total, created, updated, skipped, callCenterId },
    request,
  });

  return NextResponse.json({ ok: true, total, created, updated, skipped, errors });
}
