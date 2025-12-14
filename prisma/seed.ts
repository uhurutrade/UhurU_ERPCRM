
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // --- CLEANUP (Delete existing data to enforce strict sync) ---
  console.log('🧹 Cleaning up existing data (Transactions, Invoices, Settings, etc.)...');
  // Order matters due to Foreign Keys
  await prisma.attachment.deleteMany().catch(() => {});
  await prisma.invoiceItem.deleteMany().catch(() => {});
  // await prisma.deletedTransaction.deleteMany().catch(() => {});
  // await prisma.bankTransaction.deleteMany().catch(() => {});
  await prisma.transactionCategory.deleteMany().catch(() => {}); 
  // await prisma.bankStatement.deleteMany().catch(() => {});
  await prisma.cryptoTransaction.deleteMany().catch(() => {});
  await prisma.taxObligation.deleteMany().catch(() => {});
  await prisma.invoice.deleteMany().catch(() => {});
  await prisma.deal.deleteMany().catch(() => {});
  await prisma.activity.deleteMany().catch(() => {});
  await prisma.contact.deleteMany().catch(() => {});
  // await prisma.bankAccount.deleteMany().catch(() => {});
  // await prisma.bank.deleteMany().catch(() => {});
  await prisma.cryptoWallet.deleteMany().catch(() => {});
  await prisma.organization.deleteMany().catch(() => {});
  await prisma.companySettings.deleteMany().catch(() => {});
  
  // ... (Users loop same as before)

  // --- Transaction Categories ---
  for (const cat of [
  {
    "id": "cmj62n8yg0000sft23sncqxfz",
    "name": "hola",
    "color": "bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20",
    "createdAt": "2025-12-14T18:41:55.480Z",
    "updatedAt": "2025-12-14T18:41:55.480Z"
  },
  {
    "id": "cmj62oz0e0001sft22b5ep8rc",
    "name": "adios",
    "color": "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20",
    "createdAt": "2025-12-14T18:43:15.902Z",
    "updatedAt": "2025-12-14T18:43:15.902Z"
  },
  {
    "id": "cmj62s59a0002sft2iwrgtdu1",
    "name": "Loans",
    "color": "bg-yellow-400/10 text-yellow-300 border-yellow-400/20 hover:bg-yellow-400/20",
    "createdAt": "2025-12-14T18:45:43.966Z",
    "updatedAt": "2025-12-14T18:45:43.966Z"
  },
  {
    "id": "cmj62ua6y0003sft26nu3tbk7",
    "name": "Fees",
    "color": "bg-rose-400/10 text-rose-300 border-rose-400/20 hover:bg-rose-400/20",
    "createdAt": "2025-12-14T18:47:23.675Z",
    "updatedAt": "2025-12-14T18:47:23.675Z"
  }
] as any[]) {
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
  for (const user of [] as any[]) {
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
  for (const setting of [
  {
    "id": "cmj4nsgar0000124l7l4uqtjj",
    "companyName": "Uhuru Trade Ltd.",
    "companyNumber": "15883242",
    "incorporationDate": "2024-08-07T00:00:00.000Z",
    "registeredAddress": "Unit 13 Freeland Park Wareham Road",
    "registeredCity": "Lytchett Matravers, Poole",
    "registeredPostcode": "BH16 6FA",
    "registeredCountry": "United Kingdom",
    "tradingAddress": "Unit 13 Freeland Park Wareham Road",
    "tradingCity": "Lytchett Matravers, Poole",
    "tradingPostcode": "BH16 6FA",
    "companyType": "Ltd",
    "sicCodes": "47910, 62012, 62020, 70229",
    "financialYearEnd": "31-08",
    "accountsNextDueDate": "2027-05-31T00:00:00.000Z",
    "confirmationNextDueDate": "2026-08-09T00:00:00.000Z",
    "vatRegistered": false,
    "vatNumber": null,
    "vatRegistrationDate": null,
    "vatScheme": null,
    "vatReturnFrequency": null,
    "payeReference": null,
    "corporationTaxReference": "1234567890",
    "utr": null,
    "directors": "Raul Ortega Irus",
    "companySecretary": ".",
    "shareCapital": "1",
    "numberOfShares": 1,
    "accountingSoftware": null,
    "accountingMethod": null,
    "contactEmail": null,
    "contactPhone": null,
    "website": "https://uhurutrade.com",
    "notes": "Datos importados de Companies House el 12/12/2025",
    "createdAt": "2025-12-14T08:39:19.479Z",
    "updatedAt": "2025-12-14T12:55:05.625Z"
  }
] as any[]) {
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
  // SKIP: Banks and Accounts are preserved on VPS
  /*
  for (const bank of [] as any[]) {
     // ...
  }
  */

  // --- Crypto Wallets ---
  for (const wallet of [
  {
    "id": "cmj4oiyf7000ia47oqj0ofpgp",
    "walletName": "Corporate USDC - Polygon",
    "walletType": "HOT_WALLET",
    "blockchain": "POLYGON",
    "network": "MAINNET",
    "asset": "USDC",
    "assetType": "ERC20",
    "contractAddress": null,
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    "provider": "MetaMask",
    "currentBalance": "50000",
    "balanceUSD": "50000",
    "lastBalanceUpdate": null,
    "isMultiSig": false,
    "requiredSignatures": null,
    "isActive": true,
    "notes": null,
    "createdAt": "2025-12-14T08:39:19.622Z",
    "updatedAt": "2025-12-14T08:39:19.622Z"
  },
  {
    "id": "cmj5ixe7j00033sv84eiyfwao",
    "walletName": "hhhhhhhhhhhhhhhhhhhh",
    "walletType": "HOT_WALLET",
    "blockchain": "ETHEREUM",
    "network": "MAINNET",
    "asset": "USDC",
    "assetType": "ERC20",
    "contractAddress": null,
    "walletAddress": "das",
    "provider": null,
    "currentBalance": null,
    "balanceUSD": null,
    "lastBalanceUpdate": null,
    "isMultiSig": false,
    "requiredSignatures": 1,
    "isActive": true,
    "notes": null,
    "createdAt": "2025-12-14T09:29:56.527Z",
    "updatedAt": "2025-12-14T09:29:56.527Z"
  },
  {
    "id": "cmj5jc9cw0001ua0cyhdqrd3i",
    "walletName": "yyyyyyyyyyyyyyyyyyyyyyyyy",
    "walletType": "HOT_WALLET",
    "blockchain": "ETHEREUM",
    "network": "MAINNET",
    "asset": "USDC",
    "assetType": "ERC20",
    "contractAddress": null,
    "walletAddress": "ll",
    "provider": null,
    "currentBalance": null,
    "balanceUSD": null,
    "lastBalanceUpdate": null,
    "isMultiSig": false,
    "requiredSignatures": 1,
    "isActive": true,
    "notes": null,
    "createdAt": "2025-12-14T09:41:30.081Z",
    "updatedAt": "2025-12-14T09:41:30.081Z"
  }
] as any[]) {
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
  for (const org of [] as any[]) {
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
  for (const contact of [] as any[]) {
    await prisma.contact.create({
        data: {
            ...contact,
            createdAt: new Date(contact.createdAt),
            updatedAt: new Date(contact.updatedAt),
        } as any
    }).catch(e => console.log('Contact error'));
  }
  
 // --- CRM: Deals ---
  for (const deal of [] as any[]) {
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
  for (const inv of [] as any[]) {
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
  // SKIP

  // --- Transactions ---
  // SKIP

  // --- Deleted Transactions (Audit Log) ---
  // SKIP

  // --- Tax Obligations ---
  for (const tax of [
  {
    "id": "cmj5h4ax9001kqxyjcmi4qnsx",
    "type": "CORPORATION_TAX",
    "status": "PENDING",
    "periodStart": "2024-09-01T00:00:00.000Z",
    "periodEnd": "2025-08-31T00:00:00.000Z",
    "dueDate": "2026-06-01T00:00:00.000Z",
    "amountEstimated": "0",
    "amountActual": null,
    "fiscalYearId": null,
    "createdAt": "2025-12-14T08:39:19.630Z",
    "updatedAt": "2025-12-14T08:39:19.630Z"
  },
  {
    "id": "cmj5h4ax9001lqxyje57osnst",
    "type": "CONFIRMATION_STATEMENT",
    "status": "PENDING",
    "periodStart": "2025-08-08T00:00:00.000Z",
    "periodEnd": "2026-08-07T00:00:00.000Z",
    "dueDate": "2026-08-09T00:00:00.000Z",
    "amountEstimated": "13",
    "amountActual": null,
    "fiscalYearId": null,
    "createdAt": "2025-12-14T08:39:19.630Z",
    "updatedAt": "2025-12-14T08:39:19.630Z"
  },
  {
    "id": "cmj5h4ax9001mqxyj7y94tofc",
    "type": "ACCOUNTS",
    "status": "PENDING",
    "periodStart": "2025-09-01T00:00:00.000Z",
    "periodEnd": "2026-08-31T00:00:00.000Z",
    "dueDate": "2027-05-31T00:00:00.000Z",
    "amountEstimated": "0",
    "amountActual": null,
    "fiscalYearId": null,
    "createdAt": "2025-12-14T08:39:19.630Z",
    "updatedAt": "2025-12-14T08:39:19.630Z"
  }
] as any[]) {
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
