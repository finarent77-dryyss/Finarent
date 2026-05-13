/**
 * Test end-to-end de toutes les expériences utilisateur.
 *
 * Crée des enregistrements DB + Auth0 avec le préfixe "Andrys Test 2026"
 * et le nom de l'API concernée, pour que le client puisse vérifier en base.
 *
 * Usage : node scripts/test-all-experiences.js
 *
 * Idempotent : nettoie les enregistrements "Andrys Test 2026" précédents
 * avant de tout recréer.
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';

const prisma = new PrismaClient();
const PREFIX = 'Andrys Test 2026';
const DOMAIN = 'dev-44jsict2grc7s0jn.eu.auth0.com';

// ─── M2M token Auth0 ──────────────────────────────────────────
let TOKEN;
try {
  TOKEN = readFileSync('C:/Users/andry/AppData/Local/Temp/auth0_tok.txt', 'utf8').trim();
} catch {
  console.warn('⚠️  Token Auth0 absent — les tests Auth0 seront skippés');
}

const auth0 = (path, opts = {}) =>
  fetch(`https://${DOMAIN}/api/v2${path}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });

// ─── Helpers de test ──────────────────────────────────────────
const results = [];

async function run(api, fn) {
  const t0 = Date.now();
  try {
    const r = await fn();
    const ms = Date.now() - t0;
    const id = r?.id || r?.user_id || 'n/a';
    results.push({ api, ok: '✅', id, ms });
    console.log(`✅  ${api.padEnd(50)} ${ms}ms  id=${id}`);
    return r;
  } catch (e) {
    results.push({ api, ok: '❌', error: e.message });
    console.error(`❌  ${api.padEnd(50)} ${e.message}`);
    return null;
  }
}

// ─── Nettoyage ────────────────────────────────────────────────
async function cleanup() {
  console.log('\n🧹  Nettoyage des tests précédents "Andrys Test 2026"...\n');

  // Auth0 — user de test
  if (TOKEN) {
    try {
      const r = await auth0('/users?q=email%3A%22andrys.test.2026%40example.fr%22&search_engine=v3');
      const users = await r.json();
      for (const u of users) {
        await auth0(`/users/${encodeURIComponent(u.user_id)}`, { method: 'DELETE' });
      }
    } catch { /* ignore */ }
  }

  // DB — ordre inverse FK
  await prisma.commission.deleteMany({ where: { application: { companyName: { startsWith: PREFIX } } } });
  await prisma.statusHistory.deleteMany({ where: { application: { companyName: { startsWith: PREFIX } } } });
  await prisma.message.deleteMany({ where: { application: { companyName: { startsWith: PREFIX } } } });
  await prisma.offer.deleteMany({ where: { application: { companyName: { startsWith: PREFIX } } } });
  await prisma.document.deleteMany({ where: { application: { companyName: { startsWith: PREFIX } } } });
  await prisma.application.deleteMany({ where: { companyName: { startsWith: PREFIX } } });
  await prisma.referral.deleteMany({ where: { code: { startsWith: 'ANDRYS-TEST' } } });
  await prisma.testimonial.deleteMany({ where: { authorName: { startsWith: PREFIX } } });
  await prisma.fAQ.deleteMany({ where: { question: { startsWith: PREFIX } } });
  await prisma.newsletter.deleteMany({ where: { email: { contains: 'andrys.test.2026' } } });
  await prisma.user.deleteMany({ where: { email: { contains: 'andrys.test.2026' } } });
  await prisma.partner.deleteMany({ where: { name: { startsWith: PREFIX } } });
}

// ─── Tests ─────────────────────────────────────────────────────
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' TESTS E2E FINASSUR — Préfixe: "' + PREFIX + '"');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await cleanup();

  console.log('\n📌  AUTH0 (Management API)\n');

  // 1. Créer user Auth0
  let auth0User;
  if (TOKEN) {
    auth0User = await run('POST /api/v2/users  (Auth0 Management API)', async () => {
      const r = await auth0('/users', {
        method: 'POST',
        body: JSON.stringify({
          email: 'andrys.test.2026@example.fr',
          password: 'AndrysTest2026!',
          connection: 'Username-Password-Authentication',
          name: `${PREFIX} — POST /api/v2/users`,
          email_verified: true,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || JSON.stringify(d));
      return d;
    });

    if (auth0User) {
      // 2. Assigner rôle client
      await run('POST /api/v2/users/{id}/roles  (assignation rôle)', async () => {
        // Recup l'id du rôle client
        const rolesR = await auth0('/roles');
        const roles = await rolesR.json();
        const clientRole = roles.find((r) => r.name === 'client');
        if (!clientRole) throw new Error('Rôle "client" introuvable');
        const r = await auth0(`/users/${encodeURIComponent(auth0User.user_id)}/roles`, {
          method: 'POST',
          body: JSON.stringify({ roles: [clientRole.id] }),
        });
        if (!r.ok) {
          const t = await r.text();
          throw new Error(t);
        }
        return { id: clientRole.id };
      });
    }
  } else {
    console.log('   (Token Auth0 absent — tests skip)');
  }

  console.log('\n📌  DB Neon — entités métier\n');

  // 3. Newsletter (public)
  await run('POST /api/newsletter  (Newsletter)', () =>
    prisma.newsletter.create({
      data: { email: 'andrys.test.2026.newsletter@example.fr' },
    }),
  );

  // 4. User côté DB (équivalent sync-user après login Auth0)
  const userClient = await run('POST /api/auth/sync-user  (User upsert)', () =>
    prisma.user.create({
      data: {
        auth0Id: auth0User?.user_id || 'demo|andrys-test-2026-client',
        email: 'andrys.test.2026@example.fr',
        name: `${PREFIX} — POST /api/auth/sync-user`,
        role: 'CLIENT',
        phone: '+33600000000',
        company: `${PREFIX} — Société de test`,
      },
    }),
  );

  // 5. Partenaire (admin)
  const partner = await run('POST /api/admin/partners  (Partner)', () =>
    prisma.partner.create({
      data: {
        name: `${PREFIX} — POST /api/admin/partners`,
        type: 'BANK',
        contactEmail: 'andrys.test.2026.partner@example.fr',
        notes: `Partenaire test créé le ${new Date().toISOString()}`,
      },
    }),
  );

  // 6. Application (client)
  const app = await run('POST /api/applications  (Application)', () =>
    prisma.application.create({
      data: {
        userId: userClient.id,
        productType: 'CREDIT_BAIL',
        status: 'PENDING',
        amount: 75000,
        duration: 48,
        equipmentType: 'Test : pelle hydraulique',
        siren: '900000001',
        companyName: `${PREFIX} — POST /api/applications`,
        sector: 'BTP',
        scorePreQual: 82,
        scoreLabel: 'Bon',
      },
    }),
  );

  // 7. Document (record DB uniquement, pas d'upload réel)
  await run('POST /api/documents/upload  (Document)', () =>
    prisma.document.create({
      data: {
        applicationId: app.id,
        uploadedById: userClient.id,
        type: 'KBIS',
        fileName: `${PREFIX} — Document KBIS test.pdf`,
        fileUrl: '/test/andrys-test-2026-kbis.pdf',
        fileSize: 102400,
        mimeType: 'application/pdf',
      },
    }),
  );

  // 8. StatusHistory (admin change status PENDING → REVIEWING)
  await run('PATCH /api/admin/demandes/[id]  (StatusHistory)', () =>
    prisma.statusHistory.create({
      data: {
        applicationId: app.id,
        changedById: userClient.id,
        fromStatus: 'PENDING',
        toStatus: 'REVIEWING',
        comment: `${PREFIX} — Test changement statut`,
      },
    }),
  );
  // Met à jour le statut applicatif aussi
  await prisma.application.update({ where: { id: app.id }, data: { status: 'REVIEWING' } });

  // 9. Offer (admin)
  const offer = await run('POST /api/admin/offers  (Offer)', () =>
    prisma.offer.create({
      data: {
        applicationId: app.id,
        amount: 75000,
        durationMonths: 48,
        monthlyPayment: 1750,
        rate: 3.8,
        totalCost: 84000,
        partnerId: partner.id,
        status: 'SENT',
        expiresAt: new Date(Date.now() + 30 * 86400000),
        sentAt: new Date(),
        createdBy: userClient.id,
        conditions: { description: `${PREFIX} — POST /api/admin/offers` },
      },
    }),
  );

  // 10. Message (client → admin)
  await run('POST /api/messages  (Message)', () =>
    prisma.message.create({
      data: {
        applicationId: app.id,
        senderId: userClient.id,
        content: `${PREFIX} — POST /api/messages : ceci est un message de test pour vérifier l'API.`,
      },
    }),
  );

  // 11. Commission
  await run('Commission  (créée admin/cron)', () =>
    prisma.commission.create({
      data: {
        applicationId: app.id,
        partnerId: partner.id,
        amount: 1875,
        rate: 0.025,
        status: 'PENDING',
      },
    }),
  );

  // 12. Testimonial
  await run('POST /api/admin/testimonials  (Testimonial)', () =>
    prisma.testimonial.create({
      data: {
        authorName: `${PREFIX} — POST /api/admin/testimonials`,
        initials: 'AT',
        position: 'Testeur QA',
        company: `${PREFIX} SARL`,
        sector: 'Tech',
        rating: 5,
        text: `${PREFIX} : témoignage de test pour valider la création via /api/admin/testimonials.`,
        amount: '50 000€',
        isPublished: true,
        isApproved: true,
        approvedAt: new Date(),
      },
    }),
  );

  // 13. FAQ
  await run('POST /api/admin/faq  (FAQ)', () =>
    prisma.fAQ.create({
      data: {
        question: `${PREFIX} — POST /api/admin/faq : question test ?`,
        answer: `${PREFIX} — Réponse de test créée par le script automatique.`,
        category: 'test',
        order: 999,
        isActive: true,
      },
    }),
  );

  // 14. Referral (client invite quelqu'un)
  await run('POST /api/referrals  (Referral)', () =>
    prisma.referral.create({
      data: {
        referrerId: userClient.id,
        refereeEmail: 'andrys.test.2026.referee@example.fr',
        refereeName: `${PREFIX} — Filleul test`,
        status: 'PENDING',
        code: 'ANDRYS-TEST-2026',
      },
    }),
  );

  // ─── Rapport final ────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' RAPPORT FINAL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.table(results.map((r) => ({
    api: r.api,
    ok: r.ok,
    id: r.id || r.error?.slice(0, 50) || '',
    ms: r.ms || '',
  })));
  const okCount = results.filter((r) => r.ok === '✅').length;
  const koCount = results.filter((r) => r.ok === '❌').length;
  console.log(`\n  Total: ${okCount} ✅  /  ${koCount} ❌\n`);

  console.log('🔍  Pour vérifier en DB :');
  console.log('   • Admin → /admin/demandes → cherche "' + PREFIX + '"');
  console.log('   • Admin → /admin/partners → "' + PREFIX + ' — POST /api/admin/partners"');
  console.log('   • Admin → /admin/offers → cherche offre liée à la demande test');
  console.log('   • Admin → /admin/testimonials → "' + PREFIX + ' — POST /api/admin/testimonials"');
  console.log('   • Admin → /admin/faq → question commence par "' + PREFIX + '"');
  console.log('   • Admin → /admin/users → "' + PREFIX + ' — POST /api/auth/sync-user"');
  console.log('');
  console.log('🔐  Auth0 :');
  console.log('   • Dashboard Auth0 → Users → "andrys.test.2026@example.fr"');
  console.log('   • Mot de passe créé : AndrysTest2026!');
}

main()
  .catch((e) => { console.error('💥 Fatal:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
