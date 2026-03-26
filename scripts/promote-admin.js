import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function promote(email) {
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log(`L'utilisateur ${email} est maintenant ADMIN.`);
    } catch (error) {
        console.error(`Erreur: Utilisateur avec l'email ${email} non trouvé dans la base de données.`);
        console.log("Note: L'utilisateur doit s'être connecté au moins une fois pour exister dans la DB.");
    } finally {
        await prisma.$disconnect();
    }
}

const email = process.argv[2];
if (!email) {
    console.log("Utilisation: node scripts/promote-admin.js <email>");
    process.exit(1);
}

promote(email);
