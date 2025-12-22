
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Cleaning up unwanted data for VPS export...');

    // Delete unwanted data requested by user
    // Keep: Company Settings, Bank Settings, General Ledger, CRM
    // Delete: Crypto, Tasks, Compliance Documents, Invoices, Assets, Tax/Compliance Events

    console.log('Deleting Crypto data...');
    await prisma.cryptoTransaction.deleteMany().catch(e => console.log(e.message));
    await prisma.cryptoWallet.deleteMany().catch(e => console.log(e.message));

    console.log('Deleting Tasks...');
    await prisma.task.deleteMany().catch(e => console.log(e.message));

    console.log('Deleting Compliance Documents...');
    await prisma.complianceDocument.deleteMany().catch(e => console.log(e.message));

    console.log('Deleting Compliance Events...');
    await prisma.complianceEvent.deleteMany().catch(e => console.log(e.message));

    console.log('Deleting Assets...');
    await prisma.asset.deleteMany().catch(e => console.log(e.message));

    console.log('Deleting Invoices...');
    // Delete items first due to foreign key
    await prisma.invoiceItem.deleteMany().catch(e => console.log(e.message));
    await prisma.invoice.deleteMany().catch(e => console.log(e.message));

    console.log('Deleting Tax Obligations...');
    await prisma.taxObligation.deleteMany().catch(e => console.log(e.message));

    console.log('Deleting Fiscal Years...');
    await prisma.fiscalYear.deleteMany().catch(e => console.log(e.message));

    console.log('✅ Cleanup finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
