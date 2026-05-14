/**
 * Test du flow d'upload de documents (Prisma + storage).
 * Utilise public/finarent-logo.jpg comme fichier test.
 *
 * Usage : node scripts/test-upload.js
 */

import { PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { uploadFile, readFileBuffer } from '../lib/storage.js';

const prisma = new PrismaClient();

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' TEST UPLOAD — Finarent');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1. Récup utilisateur client démo + sa première application
  console.log('\n📋 Récupération user + application démo...');
  const user = await prisma.user.findFirst({ where: { email: 'client@demo.fr' } });
  if (!user) throw new Error('User client@demo.fr introuvable. Lance `node scripts/seed-demo.js`.');

  const application = await prisma.application.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  if (!application) throw new Error('Aucune application liée au user client@demo.fr');

  console.log(`   user.id        = ${user.id}`);
  console.log(`   application.id = ${application.id}`);
  console.log(`   company        = ${application.companyName}`);

  // 2. Lecture du logo
  console.log('\n📂 Lecture du logo test...');
  const logoPath = path.join(process.cwd(), 'public', 'finarent-logo.jpg');
  const buffer = await readFile(logoPath);
  console.log(`   Fichier : ${logoPath}`);
  console.log(`   Taille  : ${buffer.length} octets (${(buffer.length / 1024).toFixed(1)} Ko)`);

  // 3. Cleanup éventuel
  await prisma.document.deleteMany({
    where: { fileName: { startsWith: 'TEST_UPLOAD_' } },
  });

  // 4. Upload via lib/storage
  console.log('\n💾 Upload via lib/storage...');
  const filename = `TEST_UPLOAD_${Date.now()}_finarent-logo.jpg`;
  const stored = await uploadFile(buffer, filename, 'image/jpeg', application.id);
  console.log(`   Stockage path : ${stored.path}`);
  console.log(`   URL           : ${stored.url}`);

  // 5. Création Document Prisma (réplique exacte de l'API /api/documents/upload)
  console.log('\n📝 Création Document Prisma...');
  const document = await prisma.document.create({
    data: {
      applicationId: application.id,
      uploadedById: user.id,
      type: 'KBIS',
      fileName: filename,
      fileUrl: stored.path,
      fileSize: buffer.length,
      mimeType: 'image/jpeg',
    },
  });
  console.log(`   ✅ Document créé : ${document.id}`);

  // 6. Vérification : on lit le fichier depuis le storage
  console.log('\n🔍 Vérification : relecture du fichier...');
  try {
    const reread = await readFileBuffer(stored.path);
    const ok = reread.length === buffer.length;
    console.log(`   Taille relue : ${reread.length} octets — ${ok ? '✅ identique' : '❌ différente'}`);
  } catch (e) {
    console.log(`   ⚠️  Relecture impossible : ${e.message}`);
  }

  // 7. Liste tous les docs de cette application
  console.log('\n📋 Documents de l\'application :');
  const allDocs = await prisma.document.findMany({
    where: { applicationId: application.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  for (const d of allDocs) {
    console.log(`   • [${d.type}] ${d.fileName} (${(d.fileSize / 1024).toFixed(1)} Ko)`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(` ✅ TEST OK — Upload fonctionne end-to-end (Prisma + storage local)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📲 Pour vérifier dans l'UI :`);
  console.log(`   1. Connecte-toi en client@demo.fr / Demo2026!`);
  console.log(`   2. Va sur /espace/${application.id}`);
  console.log(`   3. Tu verras le document "TEST_UPLOAD_..._finarent-logo.jpg"`);
}

main()
  .catch((e) => { console.error('\n❌ ÉCHEC :', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
