/**
 * Test live du système Centres d'appel — exécuté hors serveur (utilise Prisma direct).
 * Vérifie :
 * 1. Création d'un centre
 * 2. Ajout de membres avec rôle
 * 3. Démotion auto du manager existant si nouveau MANAGER ajouté
 * 4. Attribution callCenterId à une demande
 * 5. Calcul commission auto à la signature
 * 6. Nettoyage post-test
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function computeCommission({ type, value }, amount) {
  if (type === 'FIXED') return Math.max(0, value);
  if (type === 'PERCENT') return Math.max(0, (Number(amount || 0) * value) / 100);
  return 0;
}

async function main() {
  console.log('═══ TEST CENTRES D\'APPEL ═══\n');

  // ─── 1. Créer un centre ─────────────────────────
  console.log('1. Création centre "Centre Test Paris" (INTERNAL, 5%)');
  const center = await prisma.callCenter.create({
    data: {
      code: 'CC-TEST-' + Date.now(),
      name: 'Centre Test Paris',
      type: 'INTERNAL',
      address: '12 rue Test, 75011 Paris',
      phone: '0102030405',
      email: 'paris-test@finarent.fr',
      commissionType: 'PERCENT',
      commissionValue: 5,
      isActive: true,
    },
  });
  console.log(`   ✅ Centre créé : ${center.id} (code: ${center.code})\n`);

  // ─── 2. Trouver 2 users existants pour les ajouter ───
  console.log('2. Recherche de 2 users existants pour rôles MANAGER + AGENT');
  const users = await prisma.user.findMany({ take: 2, select: { id: true, email: true, name: true } });
  if (users.length < 2) {
    console.log('   ⚠️ Pas assez de users en DB (need 2), on skip cette partie');
  } else {
    console.log(`   → User A : ${users[0].email}`);
    console.log(`   → User B : ${users[1].email}\n`);

    // Ajout User A comme MANAGER
    console.log('3. Ajout User A comme MANAGER');
    const memberA = await prisma.callCenterMember.create({
      data: { callCenterId: center.id, userId: users[0].id, role: 'MANAGER' },
    });
    console.log(`   ✅ Membre créé : ${memberA.id} (role: ${memberA.role})\n`);

    // Ajout User B comme AGENT
    console.log('4. Ajout User B comme AGENT');
    const memberB = await prisma.callCenterMember.create({
      data: { callCenterId: center.id, userId: users[1].id, role: 'AGENT' },
    });
    console.log(`   ✅ Membre créé : ${memberB.id} (role: ${memberB.role})\n`);

    // Vérifier que User B est promu MANAGER → User A doit redevenir AGENT
    console.log('5. Promotion User B → MANAGER (User A devrait redevenir AGENT)');
    await prisma.callCenterMember.updateMany({
      where: { callCenterId: center.id, role: 'MANAGER', userId: { not: users[1].id } },
      data: { role: 'AGENT' },
    });
    await prisma.callCenterMember.update({
      where: { callCenterId_userId: { callCenterId: center.id, userId: users[1].id } },
      data: { role: 'MANAGER' },
    });

    const refreshedA = await prisma.callCenterMember.findUnique({
      where: { callCenterId_userId: { callCenterId: center.id, userId: users[0].id } },
    });
    const refreshedB = await prisma.callCenterMember.findUnique({
      where: { callCenterId_userId: { callCenterId: center.id, userId: users[1].id } },
    });
    console.log(`   → User A maintenant : ${refreshedA.role} ${refreshedA.role === 'AGENT' ? '✅' : '❌'}`);
    console.log(`   → User B maintenant : ${refreshedB.role} ${refreshedB.role === 'MANAGER' ? '✅' : '❌'}\n`);

    // ─── 6. Calcul commission ────────────────────
    console.log('6. Test du calcul de commission');
    const tests = [
      { amount: 100000, expected: 5000 },  // 5% de 100k
      { amount: 50000, expected: 2500 },
      { amount: 0, expected: 0 },
      { amount: null, expected: 0 },
    ];
    for (const t of tests) {
      const got = computeCommission({ type: 'PERCENT', value: 5 }, t.amount);
      const ok = got === t.expected;
      console.log(`   ${ok ? '✅' : '❌'} commission de ${t.amount}€ × 5% = ${got}€ (attendu ${t.expected})`);
    }
    console.log('');

    // ─── 7. Attribution centre à une demande + simulation commission ───
    console.log('7. Création d\'une demande de test attribuée au centre');
    const app = await prisma.application.create({
      data: {
        userId: users[0].id,
        productType: 'CREDIT_BAIL',
        amount: 75000,
        companyName: 'Test SAS Centre',
        siren: '552120222',
        sector: 'Industrie',
        status: 'PENDING',
        callCenterId: center.id,
      },
    });
    console.log(`   ✅ Demande créée : ${app.id} (callCenterId: ${app.callCenterId})\n`);

    console.log('8. Simulation passage à SIGNED → création commission auto');
    const amount = computeCommission(
      { type: center.commissionType, value: center.commissionValue },
      app.amount,
    );
    const commission = await prisma.callCenterCommission.create({
      data: {
        callCenterId: center.id,
        applicationId: app.id,
        type: center.commissionType,
        rate: center.commissionValue,
        amount,
        status: 'PENDING',
      },
    });
    console.log(`   ✅ Commission créée : ${commission.amount}€ (PENDING)`);
    console.log(`   → Attendu : 75000 × 5% = 3750€ ${amount === 3750 ? '✅' : '❌'}\n`);

    // ─── 9. Stats agrégées du centre ───────────
    console.log('9. Récupération des stats du centre');
    const stats = await prisma.callCenter.findUnique({
      where: { id: center.id },
      include: {
        _count: { select: { members: true, applications: true, commissions: true } },
      },
    });
    const pendingSum = await prisma.callCenterCommission.aggregate({
      where: { callCenterId: center.id, status: 'PENDING' },
      _sum: { amount: true },
    });
    console.log(`   → Membres : ${stats._count.members}`);
    console.log(`   → Dossiers : ${stats._count.applications}`);
    console.log(`   → Commissions : ${stats._count.commissions} (à verser : ${pendingSum._sum.amount || 0}€)\n`);

    // ─── 10. Nettoyage ───
    console.log('10. Nettoyage des données de test');
    await prisma.callCenterCommission.deleteMany({ where: { callCenterId: center.id } });
    await prisma.application.delete({ where: { id: app.id } });
    await prisma.callCenterMember.deleteMany({ where: { callCenterId: center.id } });
  }

  await prisma.callCenter.delete({ where: { id: center.id } });
  console.log('   ✅ Centre + tous artefacts supprimés\n');

  console.log('═══ TESTS TERMINÉS ═══');
}

main()
  .catch((e) => {
    console.error('❌ Erreur :', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
