
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking available models on Prisma Client...');
    const models = Object.keys(prisma).filter(key => key[0] !== '_' && key[0] !== '$');
    console.log('Models found:', models);

    if (prisma.complianceDocument) {
        console.log('✅ complianceDocument model exists on the client.');
    } else {
        console.error('❌ complianceDocument model DOES NOT exist on the client.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
