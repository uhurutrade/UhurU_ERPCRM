
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const docs = await prisma.complianceDocument.findMany();
    console.log('Docs in DB:', docs);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
