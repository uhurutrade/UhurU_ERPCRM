
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');
  console.log('Generated at: 2025-12-16T18:46:21.159Z');

  // --- CLEANUP (Delete existing data to enforce strict sync) ---
  console.log('🧹 Cleaning up existing data...');
  
  // Order matters due to Foreign Keys
  await prisma.attachment.deleteMany().catch(() => {});
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
  for (const cat of [
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
  },
  {
    "id": "cmj62oz0e0001sft22b5ep8rc",
    "name": "adios",
    "color": "bg-yellow-400/10 text-yellow-300 border-yellow-400/20 hover:bg-yellow-400/20",
    "createdAt": "2025-12-14T18:43:15.902Z",
    "updatedAt": "2025-12-16T17:35:42.291Z"
  }
] as any[]) {
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
  for (const user of [] as any[]) {
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
  for (const asset of [] as any[]) {
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
  for (const bank of [
  {
    "id": "cmj4oiydp0000a47op1qeul17",
    "bankName": "Revolut",
    "bankType": "NEOBANK",
    "swiftBic": "REVOGB21",
    "bankCode": null,
    "website": "https://www.revolut.com",
    "supportEmail": null,
    "supportPhone": null,
    "bankAddress": null,
    "bankCity": null,
    "bankPostcode": null,
    "bankCountry": "United Kingdom",
    "isActive": true,
    "notes": null,
    "createdAt": "2025-12-14T08:39:19.496Z",
    "updatedAt": "2025-12-14T08:39:19.496Z"
  },
  {
    "id": "cmj8w781e0002e43oemxrcs8s",
    "bankName": "WorldFirst - JP Morgan",
    "bankType": "NEOBANK",
    "swiftBic": null,
    "bankCode": null,
    "website": null,
    "supportEmail": null,
    "supportPhone": null,
    "bankAddress": null,
    "bankCity": null,
    "bankPostcode": null,
    "bankCountry": null,
    "isActive": true,
    "notes": null,
    "createdAt": "2025-12-16T18:04:48.626Z",
    "updatedAt": "2025-12-16T18:04:48.626Z"
  },
  {
    "id": "cmj4oiyen0009a47otrw1dys4",
    "bankName": "Wise",
    "bankType": "PAYMENT_PROVIDER",
    "swiftBic": "TRWIGB22",
    "bankCode": null,
    "website": "https://wise.com",
    "supportEmail": null,
    "supportPhone": null,
    "bankAddress": "Rue du Trône 100, 3rd floor",
    "bankCity": "Brussels",
    "bankPostcode": "1050",
    "bankCountry": "Belgium",
    "isActive": true,
    "notes": null,
    "createdAt": "2025-12-14T08:39:19.520Z",
    "updatedAt": "2025-12-16T18:32:29.610Z"
  }
] as any[]) {
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
  for (const acc of [
  {
    "id": "cmj8xgrzg000ae43o2x8g7e53",
    "bankId": "cmj8w781e0002e43oemxrcs8s",
    "accountName": "WorldFirst -J.P. MORGAN ",
    "accountType": "BUSINESS",
    "currency": "USD",
    "iban": null,
    "accountNumber": "20000043560501",
    "routingNumber": "028000024",
    "wireRoutingNumber": "021000021",
    "sortCode": null,
    "accountNumberUK": null,
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": "CHASUS33  - JP MORGAN CHASE BANK, N.A. 383 MADISON AVENUE, NEW YORK, NY10179",
    "currentBalance": "0",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 0,
    "notes": null,
    "createdAt": "2025-12-16T18:40:13.996Z",
    "updatedAt": "2025-12-16T18:44:18.908Z"
  },
  {
    "id": "cmj8xf43o0008e43olbt0fv0b",
    "bankId": "cmj8w781e0002e43oemxrcs8s",
    "accountName": "WorldFirst",
    "accountType": "BUSINESS",
    "currency": "GBP",
    "iban": null,
    "accountNumber": null,
    "routingNumber": null,
    "wireRoutingNumber": null,
    "sortCode": "23-68-24",
    "accountNumberUK": "30404366",
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": "WFSTGB2L - GB67WFST23682430404366",
    "currentBalance": "0",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 1,
    "notes": null,
    "createdAt": "2025-12-16T18:38:56.388Z",
    "updatedAt": "2025-12-16T18:44:18.908Z"
  },
  {
    "id": "cmj8xdaot0006e43o1e3rdk2r",
    "bankId": "cmj8w781e0002e43oemxrcs8s",
    "accountName": "WorldFirst -J.P. MORGAN ",
    "accountType": "BUSINESS",
    "currency": "EUR",
    "iban": "IE38CHAS93090354358409",
    "accountNumber": null,
    "routingNumber": null,
    "wireRoutingNumber": null,
    "sortCode": null,
    "accountNumberUK": null,
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": "CHASIE4L",
    "currentBalance": "0",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 2,
    "notes": null,
    "createdAt": "2025-12-16T18:37:31.613Z",
    "updatedAt": "2025-12-16T18:44:18.908Z"
  },
  {
    "id": "cmj5yc6zc001bozg6maj5oz0p",
    "bankId": "cmj4oiyen0009a47otrw1dys4",
    "accountName": " Wise EUR Business",
    "accountType": "BUSINESS",
    "currency": "EUR",
    "iban": "BE13905028298139",
    "accountNumber": null,
    "routingNumber": null,
    "wireRoutingNumber": null,
    "sortCode": null,
    "accountNumberUK": null,
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": "TRWIBEB1XXX",
    "currentBalance": "0",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 0,
    "notes": null,
    "createdAt": "2025-12-14T16:41:21.240Z",
    "updatedAt": "2025-12-16T18:31:15.364Z"
  },
  {
    "id": "cmj61fe840007rjaqfor334p5",
    "bankId": "cmj4oiyen0009a47otrw1dys4",
    "accountName": " Wise GBP Business",
    "accountType": "BUSINESS",
    "currency": "GBP",
    "iban": null,
    "accountNumber": null,
    "routingNumber": null,
    "wireRoutingNumber": null,
    "sortCode": "23-14-70",
    "accountNumberUK": "40597527",
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": "IBAN: GB37TRWI23147040597527  Swift/BIC: TRWIGB2LXXX",
    "currentBalance": "0",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": true,
    "order": 0,
    "notes": null,
    "createdAt": "2025-12-14T18:07:49.444Z",
    "updatedAt": "2025-12-16T18:33:35.418Z"
  },
  {
    "id": "cmj61f1yo0005rjaqgvzc0t8k",
    "bankId": "cmj4oiyen0009a47otrw1dys4",
    "accountName": " Wise USD Business",
    "accountType": "CHECKING",
    "currency": "USD",
    "iban": null,
    "accountNumber": "213263141821",
    "routingNumber": "101019628",
    "wireRoutingNumber": "101019628",
    "sortCode": null,
    "accountNumberUK": null,
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": "TRWIUS35XXX",
    "currentBalance": "0",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 0,
    "notes": null,
    "createdAt": "2025-12-14T18:07:33.552Z",
    "updatedAt": "2025-12-16T18:34:54.712Z"
  },
  {
    "id": "cmj4oiye20004a47open4oqfq",
    "bankId": "cmj4oiydp0000a47op1qeul17",
    "accountName": "Revolut GBP Business",
    "accountType": "BUSINESS",
    "currency": "GBP",
    "iban": "GB29REVO00996987654321",
    "accountNumber": null,
    "routingNumber": null,
    "wireRoutingNumber": null,
    "sortCode": "23-01-20",
    "accountNumberUK": "12680250",
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": null,
    "currentBalance": "19.77",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 0,
    "notes": null,
    "createdAt": "2025-12-14T08:39:19.513Z",
    "updatedAt": "2025-12-16T18:44:06.462Z"
  },
  {
    "id": "cmj4oiydv0002a47o3h33cgnc",
    "bankId": "cmj4oiydp0000a47op1qeul17",
    "accountName": " Revolut EUR Business",
    "accountType": "BUSINESS",
    "currency": "EUR",
    "iban": "GB55REVO00996965975657",
    "accountNumber": null,
    "routingNumber": null,
    "wireRoutingNumber": null,
    "sortCode": null,
    "accountNumberUK": null,
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": "REVOGB21 - BIC intermediary: CHASDEFX",
    "currentBalance": "0.69",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 1,
    "notes": null,
    "createdAt": "2025-12-14T08:39:19.504Z",
    "updatedAt": "2025-12-16T18:44:06.462Z"
  },
  {
    "id": "cmj61chrg0001rjaqiqc473pe",
    "bankId": "cmj4oiydp0000a47op1qeul17",
    "accountName": " Revolut USD Business",
    "accountType": "BUSINESS",
    "currency": "USD",
    "iban": null,
    "accountNumber": "GB55REVO00996965975657",
    "routingNumber": null,
    "wireRoutingNumber": null,
    "sortCode": null,
    "accountNumberUK": null,
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": "REVOGB21 - BIC intermediary: CHASGB2L",
    "currentBalance": "3500",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 2,
    "notes": null,
    "createdAt": "2025-12-14T18:05:34.060Z",
    "updatedAt": "2025-12-16T18:44:06.462Z"
  },
  {
    "id": "cmj61crds0003rjaqauqkfr5y",
    "bankId": "cmj4oiydp0000a47op1qeul17",
    "accountName": " Revolut CHF Business",
    "accountType": "BUSINESS",
    "currency": "CHF",
    "iban": null,
    "accountNumber": null,
    "routingNumber": null,
    "wireRoutingNumber": null,
    "sortCode": null,
    "accountNumberUK": null,
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": "GB55REVO00996965975657 - BIC: REVOGB21 BIC intermediary: CHASGB2L",
    "currentBalance": "0",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 3,
    "notes": null,
    "createdAt": "2025-12-14T18:05:46.529Z",
    "updatedAt": "2025-12-16T18:44:06.462Z"
  }
] as any[]) {
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
  for (const tx of [] as any[]) {
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

  // --- 10. CRM: Contacts ---
  console.log('Seeding Contacts...');
  for (const contact of [] as any[]) {
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
  for (const lead of [] as any[]) {
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
  for (const deal of [] as any[]) {
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
  for (const act of [] as any[]) {
      await prisma.activity.create({
          data: {
              ...act,
              date: new Date(act.date),
          } as any
      }).catch(e => console.log('Activity error:', e.message));
  }

  // --- 14. Invoices ---
  console.log('Seeding Invoices...');
  for (const inv of [] as any[]) {
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

  // --- 15. Bank Statements ---
  console.log('Seeding Bank Statements...');
  for (const stmt of [
  {
    "id": "cmj5y8hua000oozg67yr5by3u",
    "filename": "revolut_2025.csv",
    "uploadedAt": "2025-12-14T16:38:28.691Z"
  },
  {
    "id": "cmj5yamnv0019ozg60qfgo0yw",
    "filename": "statement_96832043_GBP_2025-08-01_2025-08-29.csv",
    "uploadedAt": "2025-12-14T16:40:08.252Z"
  },
  {
    "id": "cmj5yclcr001cozg60r4va842",
    "filename": "statement_96832099_EUR_2024-08-01_2025-07-31.csv",
    "uploadedAt": "2025-12-14T16:41:39.868Z"
  },
  {
    "id": "cmj5yt69300aaozg6ahzfhm8r",
    "filename": "statement_96832099_EUR_2024-08-01_2025-07-31.csv",
    "uploadedAt": "2025-12-14T16:54:33.447Z"
  },
  {
    "id": "cmj5yts3000fzozg6r7mn40eh",
    "filename": "statement_96832099_EUR_2025-08-01_2025-08-29.csv",
    "uploadedAt": "2025-12-14T16:55:01.740Z"
  },
  {
    "id": "cmj5ywjhn00gwozg6az79xpss",
    "filename": "revolut_2025.csv",
    "uploadedAt": "2025-12-14T16:57:10.572Z"
  },
  {
    "id": "cmj5yy77l00hrozg6unsegdpn",
    "filename": "revolut_2025.csv",
    "uploadedAt": "2025-12-14T16:58:27.969Z"
  },
  {
    "id": "cmj5yz25u00icozg6xjpowot3",
    "filename": "revolut_2025.csv",
    "uploadedAt": "2025-12-14T16:59:08.083Z"
  },
  {
    "id": "cmj5yzmrl00idozg6c08ty1lg",
    "filename": "revolut_2025.csv",
    "uploadedAt": "2025-12-14T16:59:34.785Z"
  },
  {
    "id": "cmj626zjy000arjaqfri53142",
    "filename": "revolutttttt.csv",
    "uploadedAt": "2025-12-14T18:29:16.799Z"
  },
  {
    "id": "cmj627a32001xrjaqfpa6b3ae",
    "filename": "revolutttttt.csv",
    "uploadedAt": "2025-12-14T18:29:30.447Z"
  },
  {
    "id": "cmj627lpu0022rjaq638b45es",
    "filename": "revolutttttt.csv",
    "uploadedAt": "2025-12-14T18:29:45.522Z"
  },
  {
    "id": "cmj627z7y0023rjaqpycqwulx",
    "filename": "revolutttttt.csv",
    "uploadedAt": "2025-12-14T18:30:03.023Z"
  }
] as any[]) {
      await prisma.bankStatement.create({
          data: {
              ...stmt,
              uploadedAt: new Date(stmt.uploadedAt),
          } as any
      }).catch(e => console.log('Bank Statement error:', e.message));
  }

  // --- 16. Bank Transactions ---
  console.log('Seeding Bank Transactions...');
  for (const tx of [] as any[]) {
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
  
  // --- 17. Attachments ---
  console.log('Seeding Attachments...');
  for (const att of [
  {
    "id": "cmj5ozep100019kw2qgkpdsoy",
    "path": "/uploads/attachments/1765714768157-76204959.pdf",
    "fileType": "application/pdf",
    "originalName": "invoice_INV25-8 (1).pdf",
    "transactionId": null,
    "uploadedAt": "2025-12-14T12:19:28.165Z"
  },
  {
    "id": "cmj5p1xbp00039kw21vd90tra",
    "path": "/uploads/attachments/1765714885617-125972166.pdf",
    "fileType": "application/pdf",
    "originalName": "INV25-7.pdf",
    "transactionId": null,
    "uploadedAt": "2025-12-14T12:21:25.621Z"
  },
  {
    "id": "cmj5p8fkn00059kw2qzmo4uqv",
    "path": "/uploads/attachments/1765715189200-210844698.png",
    "fileType": "image/png",
    "originalName": "descarga.png",
    "transactionId": null,
    "uploadedAt": "2025-12-14T12:26:29.207Z"
  },
  {
    "id": "cmj5p937x00079kw22stoam3u",
    "path": "/uploads/attachments/1765715219850-93510644.png",
    "fileType": "image/png",
    "originalName": "descarga.png",
    "transactionId": null,
    "uploadedAt": "2025-12-14T12:26:59.853Z"
  },
  {
    "id": "cmj5p9o5m00099kw2xael2l4e",
    "path": "/uploads/attachments/1765715246982-223742510.png",
    "fileType": "image/png",
    "originalName": "linkedin4.png",
    "transactionId": null,
    "uploadedAt": "2025-12-14T12:27:26.986Z"
  }
] as any[]) {
      await prisma.attachment.create({
          data: {
              ...att,
              uploadedAt: new Date(att.uploadedAt),
          } as any
      }).catch(e => console.log('Attachment error:', e.message));
  }

  // --- 18. Deleted Transactions Audit ---
  console.log('Seeding Deleted Transactions Log...');
  for (const del of [] as any[]) {
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
  for (const fy of [] as any[]) {
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
    }).catch(e => console.log('Tax Obligation error:', e.message));
  }
  
  // --- 21. Compliance Events ---
  console.log('Seeding Compliance Events...');
  for (const evt of [] as any[]) {
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
  for (const task of [] as any[]) {
      await prisma.task.create({
          data: {
              ...task,
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              createdAt: new Date(task.createdAt),
              updatedAt: new Date(task.updatedAt),
          } as any
      }).catch(e => console.log('Task error:', e.message));
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
