const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Extrayendo datos de la base de datos local...');

  // 1. Users
  const users = await prisma.user.findMany();

  // 2. Company Settings
  const companySettings = await prisma.companySettings.findMany();

  // 3. Banks & Accounts
  const banks = await prisma.bank.findMany({ include: { accounts: true } });

  // 4. Crypto Wallets
  const cryptoWallets = await prisma.cryptoWallet.findMany();

  // 5. CRM
  const organizations = await prisma.organization.findMany();
  const contacts = await prisma.contact.findMany();
  const deals = await prisma.deal.findMany();

  // 6. Invoices
  const invoices = await prisma.invoice.findMany({ include: { items: true } });

  // 7. Transactions & Compliance & Logs
  // --- TRANSACTION CATEGORIES ---
  console.log('categories extraction...');
  const transactionCategories = await prisma.transactionCategory.findMany(); // New
  const bankStatements = await prisma.bankStatement.findMany();
  const transactions = await prisma.bankTransaction.findMany();
  const deletedTransactions = await prisma.deletedTransaction.findMany();
  const taxObligations = await prisma.taxObligation.findMany();

  const seedContent = `
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // --- CLEANUP (Delete existing data to enforce strict sync) ---
  console.log('🧹 Cleaning up existing data (Transactions, Invoices, Settings, etc.)...');
  // Order matters due to Foreign Keys
  await prisma.attachment.deleteMany().catch(() => {});
  await prisma.invoiceItem.deleteMany().catch(() => {});
  await prisma.deletedTransaction.deleteMany().catch(() => {});
  await prisma.bankTransaction.deleteMany().catch(() => {});
  await prisma.transactionCategory.deleteMany().catch(() => {}); // New
  await prisma.bankStatement.deleteMany().catch(() => {});
  await prisma.cryptoTransaction.deleteMany().catch(() => {});
  await prisma.taxObligation.deleteMany().catch(() => {});
  await prisma.invoice.deleteMany().catch(() => {});
  await prisma.deal.deleteMany().catch(() => {});
  await prisma.activity.deleteMany().catch(() => {});
  await prisma.contact.deleteMany().catch(() => {});
  await prisma.bankAccount.deleteMany().catch(() => {});
  await prisma.bank.deleteMany().catch(() => {});
  await prisma.cryptoWallet.deleteMany().catch(() => {});
  await prisma.organization.deleteMany().catch(() => {});
  await prisma.companySettings.deleteMany().catch(() => {});
  
  // ... (Users loop same as before)

  // --- Transaction Categories ---
  for (const cat of ${JSON.stringify(transactionCategories, null, 2)} as any[]) {
    await prisma.transactionCategory.create({
        data: {
            ...cat,
            createdAt: new Date(cat.createdAt),
            updatedAt: new Date(cat.updatedAt),
        } as any
    }).catch(e => console.log('Category error or exists'));
  }
  
  // ... (rest of loops for CompanySettings, Banks, etc.)
  // We do NOT delete Users/Accounts/Sessions here to prevent accidental lockout.
  // Users are handled via upsert below.

  // --- Users ---
  for (const user of ${JSON.stringify(users, null, 2)} as any[]) {
    await prisma.user.upsert({
      where: { email: user.email || '' },
      update: {},
      create: {
        ...user,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      } as any // Bypass strict typing for simplicity in seed
    });
  }

  // --- Company Settings ---
  for (const setting of ${JSON.stringify(companySettings, null, 2)} as any[]) {
    await prisma.companySettings.create({
        data: {
            ...setting,
            id: undefined, // Let new DB generate ID or keep? better keep if references exist.
            incorporationDate: new Date(setting.incorporationDate),
            accountsNextDueDate: setting.accountsNextDueDate ? new Date(setting.accountsNextDueDate) : null,
            confirmationNextDueDate: setting.confirmationNextDueDate ? new Date(setting.confirmationNextDueDate) : null,
            vatRegistrationDate: setting.vatRegistrationDate ? new Date(setting.vatRegistrationDate) : null,
            createdAt: new Date(setting.createdAt),
            updatedAt: new Date(setting.updatedAt),
        } as any
    }).catch(e => console.log('Company settings might already exist'));
  }

  // --- Banks & Accounts ---
  for (const bank of ${JSON.stringify(banks, null, 2)} as any[]) {
    await prisma.bank.create({
      data: {
        ...bank,
        accounts: {
            create: bank.accounts.map((acc: any) => ({
                ...acc,
                bankId: undefined, // remove parent ref
                lastBalanceUpdate: acc.lastBalanceUpdate ? new Date(acc.lastBalanceUpdate) : null,
                createdAt: new Date(acc.createdAt),
                updatedAt: new Date(acc.updatedAt),
            }))
        },
        createdAt: new Date(bank.createdAt),
        updatedAt: new Date(bank.updatedAt),
      } as any
    }).catch(e => console.log('Bank ' + bank.bankName + ' error or exists'));
  }

  // --- Crypto Wallets ---
  for (const wallet of ${JSON.stringify(cryptoWallets, null, 2)} as any[]) {
    await prisma.cryptoWallet.create({
      data: {
        ...wallet,
        lastBalanceUpdate: wallet.lastBalanceUpdate ? new Date(wallet.lastBalanceUpdate) : null,
        createdAt: new Date(wallet.createdAt),
        updatedAt: new Date(wallet.updatedAt),
      } as any
    }).catch(e => console.log('Wallet ' + wallet.walletName + ' error'));
  }

  // --- CRM: Organizations ---
  for (const org of ${JSON.stringify(organizations, null, 2)} as any[]) {
    await prisma.organization.upsert({
        where: { id: org.id },
        update: {},
        create: {
            ...org,
            createdAt: new Date(org.createdAt),
            updatedAt: new Date(org.updatedAt),
        }
    });
  }

  // --- CRM: Contacts ---
  for (const contact of ${JSON.stringify(contacts, null, 2)} as any[]) {
    await prisma.contact.create({
        data: {
            ...contact,
            createdAt: new Date(contact.createdAt),
            updatedAt: new Date(contact.updatedAt),
        } as any
    }).catch(e => console.log('Contact error'));
  }
  
 // --- CRM: Deals ---
  for (const deal of ${JSON.stringify(deals, null, 2)} as any[]) {
    await prisma.deal.create({
        data: {
            ...deal,
            amount: deal.amount ? Number(deal.amount) : null,
            closeDate: deal.closeDate ? new Date(deal.closeDate) : null,
            createdAt: new Date(deal.createdAt),
            updatedAt: new Date(deal.updatedAt),
        } as any
    }).catch(e => console.log('Deal error'));
  }

  // --- Invoices ---
  for (const inv of ${JSON.stringify(invoices, null, 2)} as any[]) {
    await prisma.invoice.create({
        data: {
            ...inv,
            date: new Date(inv.date),
            dueDate: new Date(inv.dueDate),
            createdAt: new Date(inv.createdAt),
            updatedAt: new Date(inv.updatedAt),
            items: {
                create: inv.items.map((item: any) => ({
                    ...item,
                    invoiceId: undefined,
                    createdAt: undefined, // InvoiceItem usually doesn't have timestamps but let's check schema
                }))
            }
        } as any
    }).catch(e => console.log('Invoice error'));
  }

  // --- Bank Statements ---
  for (const st of ${JSON.stringify(bankStatements, null, 2)} as any[]) {
    await prisma.bankStatement.create({
        data: {
            ...st,
            uploadedAt: new Date(st.uploadedAt),
        } as any
    }).catch(e => console.log('Bank Statement error'));
  }

  // --- Transactions ---
  // Using simple create because IDs might conflict if we are not careful, but usually strict copy is fine
  for (const t of ${JSON.stringify(transactions, null, 2)} as any[]) {
    await prisma.bankTransaction.create({
        data: {
            ...t,
            amount: t.amount ? Number(t.amount) : 0,
            fee: t.fee ? Number(t.fee) : null,
            balanceAfter: t.balanceAfter ? Number(t.balanceAfter) : null,
            exchangeRate: t.exchangeRate ? Number(t.exchangeRate) : null,
            date: new Date(t.date),
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            // Link to statement if it exists (using original ID)
            bankStatementId: t.bankStatementId || undefined, 
        } as any
    }).catch(e => console.log('Transaction error (possibly duplicate hash)'));
  }

  // --- Deleted Transactions (Audit Log) ---
  for (const dt of ${JSON.stringify(deletedTransactions, null, 2)} as any[]) {
    await prisma.deletedTransaction.create({
        data: {
            ...dt,
            amount: dt.amount ? Number(dt.amount) : 0,
            date: new Date(dt.date),
            deletedAt: new Date(dt.deletedAt),
        } as any
    }).catch(e => console.log('Deleted Transaction error'));
  }

  // --- Tax Obligations ---
  for (const tax of ${JSON.stringify(taxObligations, null, 2)} as any[]) {
    await prisma.taxObligation.create({
        data: {
            ...tax,
            periodStart: tax.periodStart ? new Date(tax.periodStart) : null,
            periodEnd: tax.periodEnd ? new Date(tax.periodEnd) : null,
            dueDate: new Date(tax.dueDate),
            amountEstimated: tax.amountEstimated ? Number(tax.amountEstimated) : null,
            amountActual: tax.amountActual ? Number(tax.amountActual) : null,
            createdAt: new Date(tax.createdAt),
            updatedAt: new Date(tax.updatedAt),
        } as any
    }).catch(e => console.log('Tax Obligation error'));
  }

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  fs.writeFileSync('prisma/seed.ts', seedContent);
  console.log('✅ prisma/seed.ts generado con los datos actuales.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
