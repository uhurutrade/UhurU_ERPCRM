
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Clearing Audit Log (DeletedTransaction)...');
        // Using explicit transaction or strict matching if needed, but deleteMany works fine.
        // Note: If you have foreign keys pointing TO this table (unlikely for an audit log), this might fail,
        // but usually audit logs are leaf nodes.
        const result = await prisma.deletedTransaction.deleteMany({});
        console.log(`Successfully deleted ${result.count} records from Audit Log.`);
    } catch (error) {
        console.error('Error clearing audit log:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
