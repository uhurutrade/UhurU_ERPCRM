// @ts-nocheck
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
    const banks = await prisma.bank.findMany();
    const bankAccounts = await prisma.bankAccount.findMany();

    // 4. Crypto Wallets & Transactions
    const cryptoWallets = await prisma.cryptoWallet.findMany();
    const cryptoTransactions = await prisma.cryptoTransaction.findMany();

    // 5. CRM
    const organizations = await prisma.organization.findMany();
    const contacts = await prisma.contact.findMany();
    const deals = await prisma.deal.findMany();
    const leads = await prisma.lead.findMany();
    const activities = await prisma.activity.findMany();

    // 6. Invoices
    const invoicesData = await prisma.invoice.findMany({ include: { items: true } });
    const invoices = invoicesData.map((inv: any) => ({
        ...inv,
        bankTransactionId: inv.bankTransactionId || null
    }));

    // 7. Transactions & Compliance & Logs
    console.log('categories extraction...');
    const transactionCategories = await prisma.transactionCategory.findMany();
    const bankStatements = await prisma.bankStatement.findMany();
    const bankTransactions = await prisma.bankTransaction.findMany();
    const attachments = await prisma.attachment.findMany();
    const deletedTransactions = await prisma.deletedTransaction.findMany();

    // 8. Other Tables
    const taxObligations = await prisma.taxObligation.findMany();
    const fiscalYears = await prisma.fiscalYear.findMany();
    const complianceEvents = await prisma.complianceEvent.findMany();
    const tasks = await prisma.task.findMany();
    const assets = await prisma.asset.findMany();
    const complianceDocuments = await prisma.complianceDocument.findMany();
    const documentChunks = await prisma.documentChunk.findMany();

    const seedContent = `// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');
  console.log('Generated at: ${new Date().toISOString()}');

  // --- CLEANUP (Delete existing data) ---
  console.log('🧹 Cleaning up existing data...');
  
  await prisma.documentChunk.deleteMany().catch(() => {});
  await prisma.attachment.deleteMany().catch(() => {});
  await prisma.complianceDocument.deleteMany().catch(() => {});
  await prisma.bankTransaction.deleteMany().catch(() => {});
  await prisma.bankStatement.deleteMany().catch(() => {});
  await prisma.cryptoTransaction.deleteMany().catch(() => {});
  
  await prisma.invoiceItem.deleteMany().catch(() => {});
  await prisma.invoice.deleteMany().catch(() => {});
  
  await prisma.activity.deleteMany().catch(() => {});
  await prisma.deal.deleteMany().catch(() => {});
  await prisma.contact.deleteMany().catch(() => {});
  await prisma.lead.deleteMany().catch(() => {});
  await prisma.task.deleteMany().catch(() => {});
  
  await prisma.taxObligation.deleteMany().catch(() => {});
  await prisma.complianceEvent.deleteMany().catch(() => {});
  await prisma.fiscalYear.deleteMany().catch(() => {});
  
  await prisma.bankAccount.deleteMany().catch(() => {}); // Delete accounts before banks
  await prisma.bank.deleteMany().catch(() => {});
  await prisma.cryptoWallet.deleteMany().catch(() => {});
  
  await prisma.organization.deleteMany().catch(() => {});
  await prisma.transactionCategory.deleteMany().catch(() => {});
  await prisma.deletedTransaction.deleteMany().catch(() => {});
  await prisma.asset.deleteMany().catch(() => {});
  await prisma.companySettings.deleteMany().catch(() => {});
  
  // Note: We usually don't delete Users to prevent lockout, but if you want *everything* synced:
  // await prisma.user.deleteMany().catch(() => {}); 
  // We will use upsert for users.

  // --- 1. Transaction Categories ---
  console.log('Seeding Categories...');
  for (const cat of ${JSON.stringify(transactionCategories, null, 2)} as any[]) {
    await prisma.transactionCategory.create({
        data: {
            ...cat,
            createdAt: new Date(cat.createdAt),
            updatedAt: new Date(cat.updatedAt),
        } as any
    }).catch(e => console.log('Category error or exists:', e.message));
  }

  // --- 2. Company Settings ---
  console.log('Seeding Company Settings...');
  for (const setting of ${JSON.stringify(companySettings, null, 2)} as any[]) {
    await prisma.companySettings.create({
        data: {
            ...setting,
            incorporationDate: new Date(setting.incorporationDate),
            accountsNextDueDate: setting.accountsNextDueDate ? new Date(setting.accountsNextDueDate) : null,
            confirmationNextDueDate: setting.confirmationNextDueDate ? new Date(setting.confirmationNextDueDate) : null,
            vatRegistrationDate: setting.vatRegistrationDate ? new Date(setting.vatRegistrationDate) : null,
            createdAt: new Date(setting.createdAt),
            updatedAt: new Date(setting.updatedAt),
        } as any
    }).catch(e => console.log('Company settings error:', e.message));
  }

  // --- 3. Users ---
  console.log('Seeding Users...');
  for (const user of ${JSON.stringify(users, null, 2)} as any[]) {
    await prisma.user.upsert({
      where: { email: user.email || '' },
      update: {},
      create: {
        ...user,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      } as any
    });
  }

  // --- 4. Assets ---
  console.log('Seeding Assets...');
  for (const asset of ${JSON.stringify(assets, null, 2)} as any[]) {
    await prisma.asset.create({
        data: {
            ...asset,
            purchaseDate: new Date(asset.purchaseDate),
            cost: Number(asset.cost),
            createdAt: new Date(asset.createdAt),
            updatedAt: new Date(asset.updatedAt),
        } as any
    }).catch(e => console.log('Asset error:', e.message));
  }

  // --- 5. Banks ---
  console.log('Seeding Banks...');
  for (const bank of ${JSON.stringify(banks, null, 2)} as any[]) {
    await prisma.bank.create({
        data: {
            ...bank,
            createdAt: new Date(bank.createdAt),
            updatedAt: new Date(bank.updatedAt),
        } as any
    }).catch(e => console.log('Bank error:', e.message));
  }

  // --- 6. Bank Accounts ---
  console.log('Seeding Bank Accounts...');
  for (const acc of ${JSON.stringify(bankAccounts, null, 2)} as any[]) {
    await prisma.bankAccount.create({
        data: {
            ...acc,
            currentBalance: acc.currentBalance ? Number(acc.currentBalance) : null,
            availableBalance: acc.availableBalance ? Number(acc.availableBalance) : null,
            lastBalanceUpdate: acc.lastBalanceUpdate ? new Date(acc.lastBalanceUpdate) : null,
            createdAt: new Date(acc.createdAt),
            updatedAt: new Date(acc.updatedAt),
        } as any
    }).catch(e => console.log('Bank Account error:', e.message));
  }

  // --- 7. Crypto Wallets ---
  console.log('Seeding Crypto Wallets...');
  for (const wallet of ${JSON.stringify(cryptoWallets, null, 2)} as any[]) {
    await prisma.cryptoWallet.create({
      data: {
        ...wallet,
        currentBalance: wallet.currentBalance ? Number(wallet.currentBalance) : null,
        balanceUSD: wallet.balanceUSD ? Number(wallet.balanceUSD) : null,
        lastBalanceUpdate: wallet.lastBalanceUpdate ? new Date(wallet.lastBalanceUpdate) : null,
        createdAt: new Date(wallet.createdAt),
        updatedAt: new Date(wallet.updatedAt),
      } as any
    }).catch(e => console.log('Wallet error:', e.message));
  }

  // --- 8. Crypto Transactions ---
  console.log('Seeding Crypto Transactions...');
  for (const tx of ${JSON.stringify(cryptoTransactions, null, 2)} as any[]) {
      await prisma.cryptoTransaction.create({
          data: {
              ...tx,
              amount: Number(tx.amount),
              amountUSD: tx.amountUSD ? Number(tx.amountUSD) : null,
              exchangeRate: tx.exchangeRate ? Number(tx.exchangeRate) : null,
              networkFee: tx.networkFee ? Number(tx.networkFee) : null,
              networkFeeUSD: tx.networkFeeUSD ? Number(tx.networkFeeUSD) : null,
              timestamp: new Date(tx.timestamp),
              createdAt: new Date(tx.createdAt),
              updatedAt: new Date(tx.updatedAt),
          } as any
      }).catch(e => console.log('Crypto Tx error:', e.message));
  }

  // --- 9. CRM: Organizations ---
  console.log('Seeding Organizations...');
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

  // --- 10. CRM: Contacts ---
  console.log('Seeding Contacts...');
  for (const contact of ${JSON.stringify(contacts, null, 2)} as any[]) {
    await prisma.contact.create({
        data: {
            ...contact,
            createdAt: new Date(contact.createdAt),
            updatedAt: new Date(contact.updatedAt),
        } as any
    }).catch(e => console.log('Contact error:', e.message));
  }
  
  // --- 11. CRM: Leads ---
  console.log('Seeding Leads...');
  for (const lead of ${JSON.stringify(leads, null, 2)} as any[]) {
      await prisma.lead.create({
          data: {
              ...lead,
              createdAt: new Date(lead.createdAt),
              updatedAt: new Date(lead.updatedAt),
          } as any
      }).catch(e => console.log('Lead error:', e.message));
  }

  // --- 12. CRM: Deals ---
  console.log('Seeding Deals...');
  for (const deal of ${JSON.stringify(deals, null, 2)} as any[]) {
    await prisma.deal.create({
        data: {
            ...deal,
            amount: deal.amount ? Number(deal.amount) : null,
            closeDate: deal.closeDate ? new Date(deal.closeDate) : null,
            createdAt: new Date(deal.createdAt),
            updatedAt: new Date(deal.updatedAt),
        } as any
    }).catch(e => console.log('Deal error:', e.message));
  }
  
  // --- 13. CRM: Activities ---
  console.log('Seeding Activities...');
  for (const act of ${JSON.stringify(activities, null, 2)} as any[]) {
      await prisma.activity.create({
          data: {
              ...act,
              date: new Date(act.date),
          } as any
      }).catch(e => console.log('Activity error:', e.message));
  }

  // --- 14. Bank Statements ---
  console.log('Seeding Bank Statements...');
  for (const stmt of ${JSON.stringify(bankStatements, null, 2)} as any[]) {
      await prisma.bankStatement.create({
          data: {
              ...stmt,
              uploadedAt: new Date(stmt.uploadedAt),
          } as any
      }).catch(e => console.log('Bank Statement error:', e.message));
  }

  // --- 15. Bank Transactions ---
  console.log('Seeding Bank Transactions...');
  for (const tx of ${JSON.stringify(bankTransactions, null, 2)} as any[]) {
      await prisma.bankTransaction.create({
          data: {
              ...tx,
              date: new Date(tx.date),
              amount: Number(tx.amount),
              fee: tx.fee ? Number(tx.fee) : null,
              balanceAfter: tx.balanceAfter ? Number(tx.balanceAfter) : null,
              exchangeRate: tx.exchangeRate ? Number(tx.exchangeRate) : null,
              createdAt: new Date(tx.createdAt),
              updatedAt: new Date(tx.updatedAt),
          } as any
      }).catch(e => console.log('Bank Tx error:', e.message));
  }

  // --- 16. Invoices ---
  console.log('Seeding Invoices...');
  for (const inv of ${JSON.stringify(invoices, null, 2)} as any[]) {
    await prisma.invoice.create({
        data: {
            ...inv,
            date: new Date(inv.date),
            dueDate: new Date(inv.dueDate),
            subtotal: Number(inv.subtotal),
            taxRate: Number(inv.taxRate),
            taxAmount: Number(inv.taxAmount),
            total: Number(inv.total),
            createdAt: new Date(inv.createdAt),
            updatedAt: new Date(inv.updatedAt),
            items: {
                create: inv.items.map((item: any) => ({
                    ...item,
                    invoiceId: undefined,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    total: Number(item.total),
                }))
            }
        } as any
    }).catch(e => console.log('Invoice error:', e.message));
  }
  
  // --- 17. Attachments ---
  console.log('Seeding Attachments...');
  for (const att of ${JSON.stringify(attachments, null, 2)} as any[]) {
      await prisma.attachment.create({
          data: {
              ...att,
              uploadedAt: new Date(att.uploadedAt),
          } as any
      }).catch(e => console.log('Attachment error:', e.message));
  }

  // --- 18. Deleted Transactions Audit ---
  console.log('Seeding Deleted Transactions Log...');
  for (const del of ${JSON.stringify(deletedTransactions, null, 2)} as any[]) {
      await prisma.deletedTransaction.create({
          data: {
              ...del,
              amount: Number(del.amount),
              date: new Date(del.date),
              deletedAt: new Date(del.deletedAt),
          } as any
      }).catch(e => console.log('Deleted Tx error:', e.message));
  }

  // --- 19. Fiscal Years ---
  console.log('Seeding Fiscal Years...');
  for (const fy of ${JSON.stringify(fiscalYears, null, 2)} as any[]) {
      await prisma.fiscalYear.create({
          data: {
              ...fy,
              startDate: new Date(fy.startDate),
              endDate: new Date(fy.endDate),
          } as any
      }).catch(e => console.log('Fiscal Year error:', e.message));
  }

  // --- 20. Tax Obligations ---
  console.log('Seeding Tax Obligations...');
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
    }).catch(e => console.log('Tax Obligation error:', e.message));
  }
  
  // --- 21. Compliance Events ---
  console.log('Seeding Compliance Events...');
  for (const evt of ${JSON.stringify(complianceEvents, null, 2)} as any[]) {
      await prisma.complianceEvent.create({
          data: {
              ...evt,
              date: new Date(evt.date),
              createdAt: new Date(evt.createdAt),
              updatedAt: new Date(evt.updatedAt),
          } as any
      }).catch(e => console.log('Compliance Event error:', e.message));
  }
  
  // --- 22. Tasks ---
  console.log('Seeding Tasks...');
  for (const task of ${JSON.stringify(tasks, null, 2)} as any[]) {
      await prisma.task.create({
          data: {
              ...task,
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              createdAt: new Date(task.createdAt),
              updatedAt: new Date(task.updatedAt),
          } as any
      }).catch(e => console.log('Task error:', e.message));
  }

  // --- 23. Compliance Documents ---
  console.log('Seeding Compliance Documents (RAG Knowledge Base)...');
  for (const doc of ${JSON.stringify(complianceDocuments, null, 2)} as any[]) {
      await prisma.complianceDocument.create({
          data: {
              ...doc,
              uploadedAt: new Date(doc.uploadedAt),
          } as any
      }).catch(e => console.log('Compliance Doc error:', e.message));
  }

  // --- 24. Document Chunks (Embeddings) ---
  console.log('Seeding Document Chunks...');
  for (const chunk of ${JSON.stringify(documentChunks, null, 2)} as any[]) {
      await prisma.$executeRawUnsafe(\`
          INSERT INTO "DocumentChunk" (id, "documentId", content, "tokenCount", embedding)
          VALUES ('\${chunk.id}', '\${chunk.documentId}', \${JSON.stringify(chunk.content)}, \${chunk.tokenCount || 'NULL'}, \${chunk.embedding ? \`'\${chunk.embedding}'\` : 'NULL'})
          ON CONFLICT (id) DO NOTHING
      \`).catch(e => console.log('Chunk error:', e.message));
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
    console.log('✅ prisma/seed.ts generado con TODO el contenido actual de la base de datos.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
