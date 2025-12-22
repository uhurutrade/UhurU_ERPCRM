import { prisma } from '../lib/prisma';
import { syncAllSystemData } from '../lib/ai/auto-sync-rag';

async function main() {
    console.log('🤖 Starting COMPLETE System Data Vectorization...');

    try {
        // Ensure vector extension is enabled
        await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector');

        // Sync ALL system data (todas las tablas)
        await syncAllSystemData();

        console.log('✅ COMPLETE System Data Vectorization Finished.');

    } catch (error) {
        console.error('❌ Error during vectorization:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
