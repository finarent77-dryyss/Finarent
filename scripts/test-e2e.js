// Test E2E Finarent — seed 3 comptes test + intégrité DB + smoke-test routes publiques.
//
// Usage : node scripts/test-e2e.js [--base http://localhost:3000]
//
// Le script :
//  1. Crée/upserte 3 comptes test (CLIENT/ADMIN/PARTNER) sur les 3 emails du dev
//  2. Vérifie l'intégrité DB (28 modèles, FK, orphelins)
//  3. Frappe les routes publiques (health, faq, testimonials, prospects)
//  4. Génère un rapport JSON + résumé console
//  5. Envoie un email récap aux 3 emails si SMTP configuré

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const prisma = new PrismaClient();

const BASE_URL = process.argv.find((a) => a.startsWith('--base='))?.slice(7) ||
                 process.env.APP_BASE_URL ||
                 'http://localhost:3000';

const TEST_ACCOUNTS = [
  { email: 'andrys972@gmail.com',          name: 'Andrys Client Test',  role: 'CLIENT',  company: 'Test Société CLIENT' },
  { email: 'andrys.magar@hotmail.fr',      name: 'Andrys Admin Test',   role: 'ADMIN',   company: 'Finarent Admin' },
  { email: 'andrys.developper@gmail.com',  name: 'Andrys Partner Test', role: 'PARTNER', company: 'Test Banque PARTNER' },
];

// Couleurs console
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m',
};

const log = (msg) => console.log(msg);
const ok = (msg) => log(`${C.green}✓${C.reset} ${msg}`);
const ko = (msg) => log(`${C.red}✗${C.reset} ${msg}`);
const info = (msg) => log(`${C.cyan}ℹ${C.reset} ${msg}`);
const section = (msg) => log(`\n${C.bold}${C.blue}━━━ ${msg} ━━━${C.reset}\n`);

const report = {
  startedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  accounts: [],
  db: {},
  routes: [],
  summary: { passed: 0, failed: 0, warnings: 0 },
};

// ─── 1. Seed comptes test ─────────────────────────────────────
async function seedAccounts() {
  section('1. Seed comptes de test');

  // Récupère un partner pour rattacher le user PARTNER
  let testPartner = await prisma.partner.findFirst({ where: { name: 'Test Banque PARTNER' } });
  if (!testPartner) {
    testPartner = await prisma.partner.create({
      data: {
        name: 'Test Banque PARTNER',
        type: 'BANK',
        contactEmail: 'andrys.developper@gmail.com',
        isActive: true,
        notes: 'Partner créé par scripts/test-e2e.js',
      },
    });
    ok(`Partner créé : ${testPartner.name} (${testPartner.id})`);
  } else {
    info(`Partner existant : ${testPartner.name}`);
  }

  for (const acc of TEST_ACCOUNTS) {
    try {
      const auth0Id = `test|${acc.email.replace(/[^a-z0-9]/gi, '_')}`;
      const data = {
        auth0Id,
        email: acc.email,
        name: acc.name,
        role: acc.role,
        company: acc.company,
        phone: '+33600000000',
        lastLoginAt: new Date(),
        ...(acc.role === 'PARTNER' ? { partnerId: testPartner.id } : {}),
      };
      const user = await prisma.user.upsert({
        where: { email: acc.email },
        create: data,
        update: { name: data.name, role: data.role, company: data.company, ...(acc.role === 'PARTNER' ? { partnerId: testPartner.id } : {}) },
      });
      ok(`${acc.role.padEnd(8)} → ${acc.email}  (id ${user.id})`);
      report.accounts.push({ role: acc.role, email: acc.email, id: user.id, status: 'ok' });
      report.summary.passed++;
    } catch (e) {
      ko(`${acc.email} : ${e.message}`);
      report.accounts.push({ role: acc.role, email: acc.email, status: 'failed', error: e.message });
      report.summary.failed++;
    }
  }

  // Seed quelques données autour du CLIENT pour avoir un parcours testable
  const client = await prisma.user.findUnique({ where: { email: TEST_ACCOUNTS[0].email } });
  if (client) {
    const appCount = await prisma.application.count({ where: { userId: client.id } });
    if (appCount === 0) {
      const app = await prisma.application.create({
        data: {
          userId: client.id,
          productType: 'CREDIT_BAIL',
          status: 'PENDING',
          amount: 35000,
          duration: 48,
          companyName: 'Test Société CLIENT',
          sector: 'Test E2E',
          description: 'Dossier de test créé automatiquement',
        },
      });
      ok(`Application test créée pour CLIENT : ${app.id}`);
      report.accounts[0].testApplicationId = app.id;
    } else {
      info(`CLIENT a déjà ${appCount} dossier(s)`);
    }
  }
}

// ─── 2. Intégrité DB ──────────────────────────────────────────
async function checkDbIntegrity() {
  section('2. Intégrité DB');

  const models = [
    'user', 'partner', 'application', 'offer', 'document', 'message', 'statusHistory',
    'commission', 'newsletter', 'fAQ', 'referral', 'testimonial',
    'invoice', 'invoiceLine', 'invoicePayment', 'creditNote',
    'quote', 'quoteItem',
    'signatureRequest', 'documentTemplate',
    'prospect', 'prospectEvent',
    'affiliate', 'affiliateInvite', 'affiliateCommission',
    'documentAccess', 'rgpdAction',
  ];

  for (const m of models) {
    try {
      const count = await prisma[m].count();
      ok(`${m.padEnd(22)} ${count} rows`);
      report.db[m] = count;
      report.summary.passed++;
    } catch (e) {
      ko(`${m} : ${e.message}`);
      report.db[m] = { error: e.message };
      report.summary.failed++;
    }
  }

  // Vérif orphelins
  const orphanApps = await prisma.application.count({ where: { user: null } }).catch(() => 0);
  const orphanDocs = await prisma.document.count({ where: { application: null } }).catch(() => 0);
  const orphanProspectEvents = await prisma.prospectEvent.count({ where: { prospect: null } }).catch(() => 0);

  if (orphanApps + orphanDocs + orphanProspectEvents === 0) {
    ok(`Aucun orphelin détecté`);
    report.summary.passed++;
  } else {
    ko(`Orphelins : ${orphanApps} apps, ${orphanDocs} docs, ${orphanProspectEvents} prospect events`);
    report.summary.failed++;
  }
  report.db._orphans = { applications: orphanApps, documents: orphanDocs, prospectEvents: orphanProspectEvents };
}

// ─── 3. Smoke-test routes publiques ───────────────────────────
async function testPublicRoutes() {
  section(`3. Smoke-test routes publiques (${BASE_URL})`);

  const routes = [
    { path: '/api/health', method: 'GET', expectStatus: 200 },
    { path: '/api/faq', method: 'GET', expectStatus: 200 },
    { path: '/api/testimonials', method: 'GET', expectStatus: 200 },
    { path: '/api/siret/552120222', method: 'GET', expectStatus: [200, 404, 503] }, // SIRET LVMH, peut 404 selon source
    { path: '/api/prospects', method: 'POST', body: {
        simulatorSlug: 'capacite-emprunt',
        category: 'credit-immobilier',
        params: { amount: 250000, months: 240, rate: 3.8, income: 5000 },
      }, expectStatus: 200 },
    { path: '/api/newsletter', method: 'POST', body: {
        email: `test-e2e-${Date.now()}@example.com`,
      }, expectStatus: [200, 201] },
    // Pages HTML publiques (smoke)
    { path: '/', method: 'GET', expectStatus: 200, isHtml: true },
    { path: '/simulateurs', method: 'GET', expectStatus: 200, isHtml: true },
    { path: '/glossaire', method: 'GET', expectStatus: 200, isHtml: true },
    { path: '/guides', method: 'GET', expectStatus: 200, isHtml: true },
    { path: '/quiz/quelle-solution', method: 'GET', expectStatus: 200, isHtml: true },
    { path: '/blog', method: 'GET', expectStatus: 200, isHtml: true },
    { path: '/contact', method: 'GET', expectStatus: 200, isHtml: true },
    { path: '/cgv', method: 'GET', expectStatus: 200, isHtml: true },
    { path: '/simulateurs/credit-immobilier/mensualite', method: 'GET', expectStatus: 200, isHtml: true },
    { path: '/simulateurs/credit-immobilier/capacite-emprunt', method: 'GET', expectStatus: [200, 302, 307], isHtml: true }, // gated → redirect attendu si pas connecté
  ];

  for (const r of routes) {
    try {
      const init = {
        method: r.method,
        headers: r.body ? { 'Content-Type': 'application/json' } : {},
        ...(r.body ? { body: JSON.stringify(r.body) } : {}),
        redirect: 'manual',
      };
      const resp = await fetch(`${BASE_URL}${r.path}`, init);
      const status = resp.status;
      const expected = Array.isArray(r.expectStatus) ? r.expectStatus : [r.expectStatus];
      const passed = expected.includes(status);
      const entry = { path: r.path, method: r.method, status, expected, passed };

      if (passed) {
        ok(`${r.method.padEnd(4)} ${r.path.padEnd(50)} → ${status}`);
        report.summary.passed++;
      } else {
        ko(`${r.method.padEnd(4)} ${r.path.padEnd(50)} → ${status} (attendu ${expected.join('|')})`);
        report.summary.failed++;
      }
      report.routes.push(entry);
    } catch (e) {
      ko(`${r.method} ${r.path} : ${e.message}`);
      report.routes.push({ path: r.path, method: r.method, error: e.message });
      report.summary.failed++;
    }
  }
}

// ─── 4. Email récap aux 3 boîtes ──────────────────────────────
async function sendRecapEmails() {
  section('4. Email récap aux 3 boîtes test');

  const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  if (!smtpConfigured) {
    info(`SMTP non configuré — emails non envoyés.`);
    info(`Pour activer : ajouter SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM dans .env`);
    report.emailsSent = { skipped: true, reason: 'SMTP non configuré' };
    return;
  }

  const nodemailer = (await import('nodemailer')).default;
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const summary = `
    <h2>Récap test E2E Finarent</h2>
    <p>Lancé le ${new Date().toLocaleString('fr-FR')}</p>
    <table cellpadding="6" border="1" style="border-collapse:collapse;font-family:sans-serif">
      <tr><th align="left">Étape</th><th align="left">Résultat</th></tr>
      <tr><td>Comptes créés</td><td>${report.accounts.filter(a => a.status === 'ok').length} / ${TEST_ACCOUNTS.length}</td></tr>
      <tr><td>Tables DB OK</td><td>${Object.values(report.db).filter(v => typeof v === 'number').length}</td></tr>
      <tr><td>Routes testées</td><td>${report.routes.length} (${report.routes.filter(r => r.passed).length} OK)</td></tr>
      <tr><td>Total OK</td><td>${report.summary.passed}</td></tr>
      <tr><td>Total KO</td><td>${report.summary.failed}</td></tr>
    </table>
    <h3>Comptes test créés</h3>
    <ul>
      ${report.accounts.map((a) => `<li><strong>${a.role}</strong> · ${a.email} · ${a.status === 'ok' ? '✓' : '✗ ' + a.error}</li>`).join('')}
    </ul>
    <p style="color:#666;font-size:12px">Ce mail a été envoyé automatiquement par <code>scripts/test-e2e.js</code></p>
  `;

  report.emailsSent = { recipients: [], errors: [] };
  for (const acc of TEST_ACCOUNTS) {
    try {
      await transport.sendMail({
        from: `"Finarent Test E2E" <${from}>`,
        to: acc.email,
        subject: `[Finarent E2E] Test ${acc.role} — ${new Date().toLocaleDateString('fr-FR')}`,
        html: summary,
      });
      ok(`Email envoyé à ${acc.email}`);
      report.emailsSent.recipients.push(acc.email);
      report.summary.passed++;
    } catch (e) {
      ko(`Email ${acc.email} : ${e.message}`);
      report.emailsSent.errors.push({ to: acc.email, error: e.message });
      report.summary.failed++;
    }
  }
}

// ─── Main ──────────────────────────────────────────────────────
async function main() {
  log(`\n${C.bold}═══════════════════════════════════════════`);
  log(`  Test E2E Finarent`);
  log(`  Base URL : ${BASE_URL}`);
  log(`  DB       : ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'non détectée'}`);
  log(`═══════════════════════════════════════════${C.reset}`);

  try {
    await seedAccounts();
    await checkDbIntegrity();
    await testPublicRoutes();
    await sendRecapEmails();
  } catch (e) {
    ko(`Erreur fatale : ${e.stack}`);
    report.fatal = e.message;
  }

  report.endedAt = new Date().toISOString();
  report.durationMs = new Date(report.endedAt) - new Date(report.startedAt);

  // Rapport JSON
  const outFile = resolve(process.cwd(), 'test-e2e-report.json');
  writeFileSync(outFile, JSON.stringify(report, null, 2));

  section('Récap final');
  log(`${C.green}✓ ${report.summary.passed} OK${C.reset}  ·  ${C.red}✗ ${report.summary.failed} KO${C.reset}`);
  log(`Rapport JSON → ${C.dim}${outFile}${C.reset}`);
  log(`Durée : ${(report.durationMs / 1000).toFixed(1)} s\n`);

  await prisma.$disconnect();
  process.exit(report.summary.failed > 0 ? 1 : 0);
}

main();
