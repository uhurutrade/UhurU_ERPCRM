// @ts-nocheck
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Extrayendo ABSOLUTAMENTE TODO de la base de datos local...');

    // 1. Configuración & Maestros
    const companySettings = await prisma.companySettings.findMany();
    const transactionCategories = await prisma.transactionCategory.findMany();
    const banks = await prisma.bank.findMany();
    const bankAccounts = await prisma.bankAccount.findMany();
    const cryptoWallets = await prisma.cryptoWallet.findMany();

    // 2. CRM
    const organizations = await prisma.organization.findMany();
    const contacts = await prisma.contact.findMany();
    const leads = await prisma.lead.findMany();
    const deals = await prisma.deal.findMany();
    const activities = await prisma.activity.findMany();

    // 3. Operaciones
    const invoices = await prisma.invoice.findMany();
    const invoiceItems = await prisma.invoiceItem.findMany();
    const attachments = await prisma.attachment.findMany();
    const bankTransactions = await prisma.bankTransaction.findMany();
    const bankStatements = await prisma.bankStatement.findMany();
    const cryptoTransactions = await prisma.cryptoTransaction.findMany();
    const assets = await prisma.asset.findMany();
    const tasks = await prisma.task.findMany();

    // 4. Compliance & Fiscal
    const complianceDocuments = await prisma.complianceDocument.findMany();
    const complianceEvents = await prisma.complianceEvent.findMany();
    const fiscalYears = await prisma.fiscalYear.findMany();
    const taxObligations = await prisma.taxObligation.findMany();

    // 5. Usuarios
    const users = await prisma.user.findMany();

    const seedContent = `// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding (TOTAL SYNC: All data from local)...');
  console.log('Generated at: ${new Date().toISOString()}');

  // --- 1. Company Settings ---
  console.log('Upserting Company Settings...');
  for (const item of ${JSON.stringify(companySettings, null, 2)} as any[]) {
    await prisma.companySettings.upsert({
      where: { id: item.id },
      update: item,
      create: item
    });
  }

  // --- 2. Transaction Categories ---
  console.log('Upserting Categories...');
  for (const cat of ${JSON.stringify(transactionCategories, null, 2)} as any[]) {
    await prisma.transactionCategory.upsert({
        where: { id: cat.id },
        update: cat,
        create: cat
    });
  }

  // --- 3. Banks & Accounts ---
  console.log('Upserting Banks...');
  for (const b of ${JSON.stringify(banks, null, 2)} as any[]) {
    await prisma.bank.upsert({ where: { id: b.id }, update: b, create: b });
  }
  console.log('Upserting Bank Accounts...');
  for (const acc of ${JSON.stringify(bankAccounts, null, 2)} as any[]) {
    await prisma.bankAccount.upsert({ 
        where: { id: acc.id }, 
        update: acc, 
        create: acc 
    });
  }

  // --- 4. Crypto Wallets ---
  console.log('Upserting Crypto Wallets...');
  for (const w of ${JSON.stringify(cryptoWallets, null, 2)} as any[]) {
    await prisma.cryptoWallet.upsert({ where: { id: w.id }, update: w, create: w });
  }

  // --- 5. CRM: Organizations & Contacts ---
  console.log('Upserting Organizations...');
  for (const org of ${JSON.stringify(organizations, null, 2)} as any[]) {
    await prisma.organization.upsert({ where: { id: org.id }, update: org, create: org });
  }
  console.log('Upserting Contacts...');
  for (const c of ${JSON.stringify(contacts, null, 2)} as any[]) {
    await prisma.contact.upsert({ where: { id: c.id }, update: c, create: c });
  }

  // --- 6. CRM: Leads, Deals & Activities ---
  console.log('Upserting Leads...');
  for (const l of ${JSON.stringify(leads, null, 2)} as any[]) {
    await prisma.lead.upsert({ where: { id: l.id }, update: l, create: l });
  }
  console.log('Upserting Deals...');
  for (const d of ${JSON.stringify(deals, null, 2)} as any[]) {
    await prisma.deal.upsert({ where: { id: d.id }, update: d, create: d });
  }
  console.log('Upserting Activities...');
  for (const a of ${JSON.stringify(activities, null, 2)} as any[]) {
    await prisma.activity.upsert({ where: { id: a.id }, update: a, create: a });
  }

  // --- 7. Invoices & Items ---
  console.log('Upserting Invoices...');
  for (const i of ${JSON.stringify(invoices, null, 2)} as any[]) {
    await prisma.invoice.upsert({ where: { id: i.id }, update: i, create: i });
  }
  console.log('Upserting Invoice Items...');
  for (const item of ${JSON.stringify(invoiceItems, null, 2)} as any[]) {
    await prisma.invoiceItem.upsert({ where: { id: item.id }, update: item, create: item });
  }

  // --- 8. Banking: Statements & Transactions ---
  console.log('Upserting Bank Statements...');
  for (const s of ${JSON.stringify(bankStatements, null, 2)} as any[]) {
    await prisma.bankStatement.upsert({ where: { id: s.id }, update: s, create: s });
  }
  console.log('Upserting Bank Transactions...');
  for (const t of ${JSON.stringify(bankTransactions, null, 2)} as any[]) {
    await prisma.bankTransaction.upsert({ where: { id: t.id }, update: t, create: t });
  }
  console.log('Upserting Attachments...');
  for (const att of ${JSON.stringify(attachments, null, 2)} as any[]) {
    await prisma.attachment.upsert({ where: { id: att.id }, update: att, create: att });
  }
  console.log('Upserting Crypto Transactions...');
  for (const ct of ${JSON.stringify(cryptoTransactions, null, 2)} as any[]) {
    await prisma.cryptoTransaction.upsert({ where: { id: ct.id }, update: ct, create: ct });
  }

  // --- 9. Assets & Tasks ---
  console.log('Upserting Assets...');
  for (const asset of ${JSON.stringify(assets, null, 2)} as any[]) {
    await prisma.asset.upsert({ where: { id: asset.id }, update: asset, create: asset });
  }
  console.log('Upserting Tasks...');
  for (const task of ${JSON.stringify(tasks, null, 2)} as any[]) {
    await prisma.task.upsert({ where: { id: task.id }, update: task, create: task });
  }

  // --- 10. Compliance & Fiscal ---
  console.log('Upserting Compliance Documents...');
  for (const doc of ${JSON.stringify(complianceDocuments, null, 2)} as any[]) {
    await prisma.complianceDocument.upsert({ where: { id: doc.id }, update: doc, create: doc });
  }
  console.log('Upserting Compliance Events...');
  for (const ev of ${JSON.stringify(complianceEvents, null, 2)} as any[]) {
    await prisma.complianceEvent.upsert({ where: { id: ev.id }, update: ev, create: ev });
  }
  console.log('Upserting Fiscal Years...');
  for (const fy of ${JSON.stringify(fiscalYears, null, 2)} as any[]) {
    await prisma.fiscalYear.upsert({ where: { id: fy.id }, update: fy, create: fy });
  }
  console.log('Upserting Tax Obligations...');
  for (const to of ${JSON.stringify(taxObligations, null, 2)} as any[]) {
    await prisma.taxObligation.upsert({ where: { id: to.id }, update: to, create: to });
  }

  // --- 11. Users ---
  console.log('Upserting Users...');
  for (const u of ${JSON.stringify(users, null, 2)} as any[]) {
    await prisma.user.upsert({ where: { email: u.email || '' }, update: u, create: u });
  }

  console.log('✅ TOTAL SEEDING FINISHED.');
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
    console.log('✅ prisma/seed.ts generado: INCLUYE ABSOLUTAMENTE TODO (Transactions, Invoices, Settings, etc.).');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
