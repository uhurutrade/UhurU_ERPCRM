const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    console.log('Transactions:', await prisma.bankTransaction.count());
    console.log('Invoices:', await prisma.invoice.count());
    console.log('BankAccounts:', await prisma.bankAccount.count());
    console.log('CompanySettings:', await prisma.companySettings.count());
    console.log('Banks:', await prisma.bank.count());
}
main().catch(console.error).finally(() => prisma.$disconnect());
