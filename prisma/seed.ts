
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');
  console.log('Generated at: 2025-12-15T14:15:43.904Z');

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
    "id": "cmj4oiyen0009a47otrw1dys4",
    "bankName": "Wise",
    "bankType": "PAYMENT_PROVIDER",
    "swiftBic": "TRWIGB22",
    "bankCode": null,
    "website": "https://wise.com",
    "supportEmail": null,
    "supportPhone": null,
    "bankAddress": null,
    "bankCity": null,
    "bankPostcode": null,
    "bankCountry": "United Kingdom",
    "isActive": true,
    "notes": null,
    "createdAt": "2025-12-14T08:39:19.520Z",
    "updatedAt": "2025-12-14T08:39:19.520Z"
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
    "id": "cmj4oiydv0002a47o3h33cgnc",
    "bankId": "cmj4oiydp0000a47op1qeul17",
    "accountName": " Revolut EUR Business",
    "accountType": "BUSINESS",
    "currency": "EUR",
    "iban": "GB33REVO00996912345678",
    "accountNumber": null,
    "routingNumber": null,
    "wireRoutingNumber": null,
    "sortCode": null,
    "accountNumberUK": null,
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": "REVOGB21",
    "currentBalance": "29.28",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 0,
    "notes": null,
    "createdAt": "2025-12-14T08:39:19.504Z",
    "updatedAt": "2025-12-14T16:58:04.339Z"
  },
  {
    "id": "cmj61chrg0001rjaqiqc473pe",
    "bankId": "cmj4oiydp0000a47op1qeul17",
    "accountName": " Revolut USD Business",
    "accountType": "BUSINESS",
    "currency": "USD",
    "iban": null,
    "accountNumber": null,
    "routingNumber": null,
    "wireRoutingNumber": null,
    "sortCode": null,
    "accountNumberUK": null,
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": null,
    "currentBalance": "0",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 0,
    "notes": null,
    "createdAt": "2025-12-14T18:05:34.060Z",
    "updatedAt": "2025-12-14T18:05:34.060Z"
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
    "swiftBic": null,
    "currentBalance": "0",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 0,
    "notes": null,
    "createdAt": "2025-12-14T18:05:46.529Z",
    "updatedAt": "2025-12-14T18:05:46.529Z"
  },
  {
    "id": "cmj5yc6zc001bozg6maj5oz0p",
    "bankId": "cmj4oiyen0009a47otrw1dys4",
    "accountName": " Wise EUR Business",
    "accountType": "BUSINESS",
    "currency": "EUR",
    "iban": null,
    "accountNumber": null,
    "routingNumber": null,
    "wireRoutingNumber": null,
    "sortCode": null,
    "accountNumberUK": null,
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": null,
    "currentBalance": "0",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 0,
    "notes": null,
    "createdAt": "2025-12-14T16:41:21.240Z",
    "updatedAt": "2025-12-14T18:06:56.095Z"
  },
  {
    "id": "cmj61f1yo0005rjaqgvzc0t8k",
    "bankId": "cmj4oiyen0009a47otrw1dys4",
    "accountName": " Wise USD Business",
    "accountType": "BUSINESS",
    "currency": "USD",
    "iban": null,
    "accountNumber": null,
    "routingNumber": null,
    "wireRoutingNumber": null,
    "sortCode": null,
    "accountNumberUK": null,
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": null,
    "currentBalance": "0",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 0,
    "notes": null,
    "createdAt": "2025-12-14T18:07:33.552Z",
    "updatedAt": "2025-12-14T18:07:33.552Z"
  },
  {
    "id": "cmj61fnhz0009rjaqs7rxl5h1",
    "bankId": "cmj4oiyen0009a47otrw1dys4",
    "accountName": " Wise CHF Business",
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
    "swiftBic": null,
    "currentBalance": "0",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 0,
    "notes": null,
    "createdAt": "2025-12-14T18:08:01.463Z",
    "updatedAt": "2025-12-14T18:08:01.463Z"
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
    "sortCode": "040004",
    "accountNumberUK": "12345678",
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": "REVOGB21",
    "currentBalance": "15000",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": false,
    "order": 0,
    "notes": null,
    "createdAt": "2025-12-14T08:39:19.513Z",
    "updatedAt": "2025-12-14T18:08:13.414Z"
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
    "sortCode": null,
    "accountNumberUK": null,
    "ibanCH": null,
    "bcNumber": null,
    "swiftBic": null,
    "currentBalance": "0",
    "availableBalance": null,
    "lastBalanceUpdate": null,
    "isActive": true,
    "isPrimary": true,
    "order": 0,
    "notes": null,
    "createdAt": "2025-12-14T18:07:49.444Z",
    "updatedAt": "2025-12-14T18:08:13.418Z"
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
  for (const tx of [
  {
    "id": "cmj626zl6000crjaqnlga1d72",
    "externalId": "69340537-f4f4-a432-b222-157abfeb79ca",
    "date": "2025-12-06T00:00:00.000Z",
    "description": "Dinero añadido por R. ORTEGA IRUS",
    "amount": "0.05",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Test",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "0.68",
    "exchangeRate": null,
    "type": "TOPUP",
    "hash": "e2948e59ffa89e2d9d2c35e891129d0d77792b35b28e65895c96b3c7119bff49",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.843Z",
    "updatedAt": "2025-12-14T18:29:16.843Z"
  },
  {
    "id": "cmj626zld000erjaqscw4a6eh",
    "externalId": "69280cf5-7f1d-a74e-9ce7-faa27e668aec",
    "date": "2025-11-27T00:00:00.000Z",
    "description": "Main · EUR → BTC",
    "amount": "-50",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "0.63",
    "exchangeRate": "0.00001254",
    "type": "EXCHANGE",
    "hash": "a20041e390997650b09795eb6029673e5917d0ae29bfd6e40f8207aaffe8d01b",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.850Z",
    "updatedAt": "2025-12-14T18:29:16.850Z"
  },
  {
    "id": "cmj626zlr000irjaq65jbqfum",
    "externalId": "69177844-9b30-a1f0-8664-f70a3bc83117",
    "date": "2025-11-14T00:00:00.000Z",
    "description": "Main · EUR → Main · GBP",
    "amount": "-63",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "0.63",
    "exchangeRate": "0.882801",
    "type": "EXCHANGE",
    "hash": "ddfe7fd77679bb69d0016d1bf6547de5a9816302211158f63b7d7916ddaddf3f",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.863Z",
    "updatedAt": "2025-12-14T18:29:16.863Z"
  },
  {
    "id": "cmj626zm5000mrjaqvq1lfrqr",
    "externalId": "69086277-f592-ad7a-ab7c-a211a450c4f6",
    "date": "2025-11-03T00:00:00.000Z",
    "description": "Google*cloud 4w8phl",
    "amount": "-0.16",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "13.63",
    "exchangeRate": null,
    "type": "CARD_PAYMENT",
    "hash": "814955b4e3a37a5f6320ead2f7f6d7df54c5b94aa887e9fd14c69ef06cda242e",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.877Z",
    "updatedAt": "2025-12-14T18:29:16.877Z"
  },
  {
    "id": "cmj626zmb000orjaqvr3ij3nl",
    "externalId": "69031659-f57d-a213-abde-3e52bb6f5e27",
    "date": "2025-10-30T00:00:00.000Z",
    "description": "Main · EUR → BTC",
    "amount": "-40",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "13.79",
    "exchangeRate": "0.00001033",
    "type": "EXCHANGE",
    "hash": "4767cd62bb4cfd82e0f550eba18debea32ef3df48f24271a81308b9baea51d97",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.883Z",
    "updatedAt": "2025-12-14T18:29:16.883Z"
  },
  {
    "id": "cmj626zmn000srjaqtioxua2v",
    "externalId": "68ec9152-815f-a4da-a00c-290cbf30a14d",
    "date": "2025-10-13T00:00:00.000Z",
    "description": "Main · EUR → Main · GBP",
    "amount": "-57.48",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "2.79",
    "exchangeRate": "0.869915",
    "type": "EXCHANGE",
    "hash": "099243161dd29f4b87c20ca9f123c5e3ea57db41c76d916d96437df8c060eef2",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.896Z",
    "updatedAt": "2025-12-14T18:29:16.896Z"
  },
  {
    "id": "cmj626zmu000urjaqfdwc5yzu",
    "externalId": "68d8f8d2-3960-a789-be55-0213556b07c3",
    "date": "2025-09-28T00:00:00.000Z",
    "description": "Main · EUR → BTC",
    "amount": "-50",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "60.27",
    "exchangeRate": "0.00001055",
    "type": "EXCHANGE",
    "hash": "0f9c2e46167ff0defa2718b65c8ecde2a23de7ab396834d66bce75ffcb61d2e2",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.902Z",
    "updatedAt": "2025-12-14T18:29:16.902Z"
  },
  {
    "id": "cmj626zn6000yrjaqedqw3555",
    "externalId": "68cfadd2-81fb-a0e7-8cd2-9139a3428cce",
    "date": "2025-09-21T00:00:00.000Z",
    "description": "Main · EUR → BTC",
    "amount": "-10",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "59.27",
    "exchangeRate": "0.00001002",
    "type": "EXCHANGE",
    "hash": "52e16ffbba5d1b3d882d24b7e6171e31c85661ec049fbc09adfef731d6daaade",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.914Z",
    "updatedAt": "2025-12-14T18:29:16.914Z"
  },
  {
    "id": "cmj626zni0012rjaqxuhoioz3",
    "externalId": "68cda236-69fe-a5d7-b950-0d3368b57224",
    "date": "2025-09-19T00:00:00.000Z",
    "description": "Main · EUR → BTC",
    "amount": "-10",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "19.27",
    "exchangeRate": "0.00001006",
    "type": "EXCHANGE",
    "hash": "9137c9975439d962ea2ba9cc7d937fa2e41c8ad33ab0b6cdc497b3f82fd01b61",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.927Z",
    "updatedAt": "2025-12-14T18:29:16.927Z"
  },
  {
    "id": "cmj626zno0014rjaqbmel6ivo",
    "externalId": "685eac27-744f-af19-af12-5d2e05a0f826",
    "date": "2025-06-27T00:00:00.000Z",
    "description": "Www_contabo_com",
    "amount": "-30.78",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "29.27",
    "exchangeRate": null,
    "type": "CARD_PAYMENT",
    "hash": "f0fbac3084791afe4701890e9ad9076fafa3e4c5b0b475ba21d57bc5852405ba",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.933Z",
    "updatedAt": "2025-12-14T18:29:16.933Z"
  },
  {
    "id": "cmj626zo00018rjaqbell7o92",
    "externalId": "68396b3d-f28c-a438-a12b-78fb3f00e782",
    "date": "2025-05-30T00:00:00.000Z",
    "description": "Main · EUR → Main · GBP",
    "amount": "-50",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "0.05",
    "exchangeRate": "0.841009",
    "type": "EXCHANGE",
    "hash": "3a2d9b79314f620303d8034f3a02466ae2283519e357c6744015194da4abb6a0",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.945Z",
    "updatedAt": "2025-12-14T18:29:16.945Z"
  },
  {
    "id": "cmj626zoc001crjaqidhyghs2",
    "externalId": "68284a38-6367-ab4a-ba10-a7a2968709a7",
    "date": "2025-05-17T00:00:00.000Z",
    "description": "Main · EUR → Main · GBP",
    "amount": "-1.2",
    "currency": "EUR",
    "fee": "0.01",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "0.05",
    "exchangeRate": "0.839368",
    "type": "EXCHANGE",
    "hash": "b2f5de8fc775060bdb1db81c4cd4eece3bb491746dd862a152cc7fc5e10f8aa8",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.956Z",
    "updatedAt": "2025-12-14T18:29:16.956Z"
  },
  {
    "id": "cmj626zoh001erjaq86lcm7ax",
    "externalId": "68274030-408b-a740-b863-22906dbaff48",
    "date": "2025-05-16T00:00:00.000Z",
    "description": "Comisión de Revolut Business",
    "amount": "-11.9",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Tarifa del plan Basic",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "1.25",
    "exchangeRate": null,
    "type": "FEE",
    "hash": "c398adfa94e071434e7d1d82d5a7d7e18994d8a8381556d46600e72f76c25ff0",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.962Z",
    "updatedAt": "2025-12-14T18:29:16.962Z"
  },
  {
    "id": "cmj626zon001grjaqc76976o6",
    "externalId": "68259233-456b-a832-ba7e-5a1983efb2a5",
    "date": "2025-05-15T00:00:00.000Z",
    "description": "Dinero añadido por RAUL ORTEGA",
    "amount": "12.8",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Enviada desde N26",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "13.15",
    "exchangeRate": null,
    "type": "TOPUP",
    "hash": "317540603e992e86efb28ba9fd0d88ccbc66e201a7d95286c21af38d263fb9c1",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.968Z",
    "updatedAt": "2025-12-14T18:29:16.968Z"
  },
  {
    "id": "cmj626zou001irjaqj6vt3myn",
    "externalId": "67ffb1ae-c309-a141-ade0-e445b7f0b9c8",
    "date": "2025-04-16T00:00:00.000Z",
    "description": "Comisión de Revolut Business",
    "amount": "-11.7",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Tarifa del plan Basic",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "0.35",
    "exchangeRate": null,
    "type": "FEE",
    "hash": "2ffef8e36338b047e0f67269b05aa155375140038ca6054882785ce8625ead40",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.974Z",
    "updatedAt": "2025-12-14T18:29:16.974Z"
  },
  {
    "id": "cmj626zoy001krjaqxnvad9i6",
    "externalId": "67e9103d-f134-aa63-b0a3-1a1fcbdd49de",
    "date": "2025-03-30T00:00:00.000Z",
    "description": "Dinero añadido por RAUL ORTEGA",
    "amount": "11",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Expenses",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "12.05",
    "exchangeRate": null,
    "type": "TOPUP",
    "hash": "933f4410baefd2fa9490bb61180ce3ee989bfbb30831971c341e3146cab393fc",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.979Z",
    "updatedAt": "2025-12-14T18:29:16.979Z"
  },
  {
    "id": "cmj626zp5001mrjaqy44fsy4f",
    "externalId": "67d73027-50d9-a855-83a8-1d74c1bc9514",
    "date": "2025-03-16T00:00:00.000Z",
    "description": "Main · EUR → Main · GBP",
    "amount": "-0.94",
    "currency": "EUR",
    "fee": "0.01",
    "status": null,
    "category": null,
    "reference": "Transfer to Main to recover negative balance",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "1.05",
    "exchangeRate": "0.84127",
    "type": "EXCHANGE",
    "hash": "aeeecb0bd80a4ebeebd425c701276da1af2ecf3918b895cd4e1b1795a74f9c12",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.985Z",
    "updatedAt": "2025-12-14T18:29:16.985Z"
  },
  {
    "id": "cmj626zpb001orjaqtul0r6vp",
    "externalId": "67d73026-51ba-ad30-9839-2610fe951560",
    "date": "2025-03-16T00:00:00.000Z",
    "description": "Dinero añadido por RAUL ORTEGA",
    "amount": "2",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Uk business 2",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "2",
    "exchangeRate": null,
    "type": "TOPUP",
    "hash": "8dd1863d940c5f6b14a13d5b2c4dcb8dddc4bedd076d1a7c8842d35838256aea",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.992Z",
    "updatedAt": "2025-12-14T18:29:16.992Z"
  },
  {
    "id": "cmj626zly000krjaqtwdnps4z",
    "externalId": "6917780d-2672-a8b5-9d0a-8b608c7f5fbb",
    "date": "2025-11-14T00:00:00.000Z",
    "description": "Dinero añadido por RAUL ORTEGA",
    "amount": "50",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": "Loans",
    "reference": "Director Loan",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "63.63",
    "exchangeRate": null,
    "type": "TOPUP",
    "hash": "399aedff7c79d66786e4d3a438ca6f4b1b2985d998b00d64fb614870da830d25",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.870Z",
    "updatedAt": "2025-12-14T18:49:32.739Z"
  },
  {
    "id": "cmj626zmi000qrjaqlurtttos",
    "externalId": "69031514-8826-ab80-899a-79011fc13644",
    "date": "2025-10-30T00:00:00.000Z",
    "description": "Dinero añadido por RAUL ORTEGA",
    "amount": "51",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": "Loans",
    "reference": "Director Loan",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "53.79",
    "exchangeRate": null,
    "type": "TOPUP",
    "hash": "2fdf020e773d0498419fc1c486c9f6322067d6dab6525ca11e2054ae8df6ccc8",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.890Z",
    "updatedAt": "2025-12-14T18:49:34.823Z"
  },
  {
    "id": "cmj626zn0000wrjaqenokeic6",
    "externalId": "68d8f895-9ecf-a693-8e63-9eddaed894b4",
    "date": "2025-09-28T00:00:00.000Z",
    "description": "Dinero añadido por RAUL ORTEGA",
    "amount": "51",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": "Loans",
    "reference": "Director Loan",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "110.27",
    "exchangeRate": null,
    "type": "TOPUP",
    "hash": "e0c274c3c2a79aea769bdc487e6bc61c4190a1921913cde1868ee30d6e94a6ee",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.909Z",
    "updatedAt": "2025-12-14T18:49:36.387Z"
  },
  {
    "id": "cmj626znc0010rjaqe7eqxnj9",
    "externalId": "68cfada3-e3e3-a84d-8e3a-ff005d1e233d",
    "date": "2025-09-21T00:00:00.000Z",
    "description": "Dinero añadido por RAUL ORTEGA",
    "amount": "50",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": "Loans",
    "reference": "Director Loan",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "69.27",
    "exchangeRate": null,
    "type": "TOPUP",
    "hash": "0c0570ed1938d52ebf3be743784659330a80d4993082f7df7617d97741288fd9",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.920Z",
    "updatedAt": "2025-12-14T18:49:38.377Z"
  },
  {
    "id": "cmj626znv0016rjaqbhjn80u7",
    "externalId": "685e5f4f-e591-a7fc-a9bc-24f5fda766b4",
    "date": "2025-06-27T00:00:00.000Z",
    "description": "Dinero añadido por RAUL ORTEGA",
    "amount": "60",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": "Loans",
    "reference": "Expenses",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "60.05",
    "exchangeRate": null,
    "type": "TOPUP",
    "hash": "67ee82150ef644c96f24b26266848c0e4ff4e48aa8f53a857271507a995d7491",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.939Z",
    "updatedAt": "2025-12-14T18:49:42.543Z"
  },
  {
    "id": "cmj626zo6001arjaqdsoh5qjs",
    "externalId": "68396b03-7736-a555-8dfd-50bd8c1eba43",
    "date": "2025-05-30T00:00:00.000Z",
    "description": "Dinero añadido por RAUL ORTEGA",
    "amount": "50",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": "Loans",
    "reference": "Enviada desde N26",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "50.05",
    "exchangeRate": null,
    "type": "TOPUP",
    "hash": "9012ce4f1391cbab696193dc66467d38307d0dce595b9801e877d917e7c5e900",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.950Z",
    "updatedAt": "2025-12-14T18:49:44.697Z"
  },
  {
    "id": "cmj626zph001qrjaqogfirh6a",
    "externalId": "67d72f9e-38f7-aaa4-bde7-36009c66fc2a",
    "date": "2025-03-16T00:00:00.000Z",
    "description": "Main · EUR → Main · GBP",
    "amount": "-11",
    "currency": "EUR",
    "fee": "0.09",
    "status": null,
    "category": null,
    "reference": "Transfer to Main to recover negative balance",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "0",
    "exchangeRate": "0.84127",
    "type": "EXCHANGE",
    "hash": "50a3a7bc445d0a154aacb2b00f303251774606fc8f2d0128350580a4e3365eaa",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.997Z",
    "updatedAt": "2025-12-14T18:29:16.997Z"
  },
  {
    "id": "cmj626zpm001srjaqi2eyv35n",
    "externalId": "67d72f9d-5b76-adfa-b4a6-4693c678f8a3",
    "date": "2025-03-16T00:00:00.000Z",
    "description": "Dinero añadido por RAUL ORTEGA",
    "amount": "11",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Uk business 2",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "11",
    "exchangeRate": null,
    "type": "TOPUP",
    "hash": "d65dfa6364afe289a5a2bcd6cbe2c4a9ac3467646d0ea73908ecf5df287b1a6f",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:17.002Z",
    "updatedAt": "2025-12-14T18:29:17.002Z"
  },
  {
    "id": "cmj626zpt001urjaqqvpbwaf1",
    "externalId": "67d6d9d2-f646-aea3-afd0-01b420d9bc40",
    "date": "2025-03-16T00:00:00.000Z",
    "description": "Main · EUR → Main · GBP",
    "amount": "-0.05",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Transfer to Main to recover negative balance",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "0",
    "exchangeRate": "0.841203",
    "type": "EXCHANGE",
    "hash": "63b02c29e2dfc1b78f8ec304f2432fb9d76afe09d8c99a8506038c459cdfe058",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:17.009Z",
    "updatedAt": "2025-12-14T18:29:17.009Z"
  },
  {
    "id": "cmj626zpy001wrjaqq7snoq3z",
    "externalId": "67d6d4ee-d751-aad7-9621-620e1a1dca8e",
    "date": "2025-03-16T00:00:00.000Z",
    "description": "Dinero añadido por RAUL ORTEGA",
    "amount": "0.05",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Uk business",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "0.05",
    "exchangeRate": null,
    "type": "TOPUP",
    "hash": "1d549354f3429379973c96f995c98e905d986a940b4030c78dfbc05699616b84",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:17.015Z",
    "updatedAt": "2025-12-14T18:29:17.015Z"
  },
  {
    "id": "cmj627z9k0029rjaqpvg796d3",
    "externalId": "69340698-aca8-ae9c-b661-d4acb8129a02",
    "date": "2025-12-06T00:00:00.000Z",
    "description": "A Raul Ortega",
    "amount": "-1",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Test",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "20.31",
    "exchangeRate": null,
    "type": "TRANSFER",
    "hash": "e8919e6f4df9760bea71a392cdf98cfa2be7777d279d0c755e2e9b1ac0c4160a",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.081Z",
    "updatedAt": "2025-12-14T18:30:03.081Z"
  },
  {
    "id": "cmj627z9q002brjaqjkqtzgzo",
    "externalId": "691d6605-eb51-a828-bb87-13a62f15ab29",
    "date": "2025-11-19T00:00:00.000Z",
    "description": "Www_contabo_com",
    "amount": "-28.21",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "21.31",
    "exchangeRate": "1.134614",
    "type": "CARD_PAYMENT",
    "hash": "41dfe0a2e36ad31d41db682fb0304d444ed25502d226e8ffb0ab92dfba0eac8b",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.086Z",
    "updatedAt": "2025-12-14T18:30:03.086Z"
  },
  {
    "id": "cmj627za1002frjaq0eegaqr4",
    "externalId": "6917786d-0303-ab8d-88e3-596fc9a163ba",
    "date": "2025-11-14T00:00:00.000Z",
    "description": "Main · GBP → BTC",
    "amount": "-40",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "59.52",
    "exchangeRate": "0.00001364",
    "type": "EXCHANGE",
    "hash": "2dae9d9e9cfdc3509c7a423d1166ba8c8414cc76cf60f506b19531a11edc6ea9",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.097Z",
    "updatedAt": "2025-12-14T18:30:03.097Z"
  },
  {
    "id": "cmj627za7002hrjaqbai9jlie",
    "externalId": "69177844-9b30-a1f0-8664-f70a3bc83117",
    "date": "2025-11-14T00:00:00.000Z",
    "description": "Main · EUR → Main · GBP",
    "amount": "55.61",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "99.52",
    "exchangeRate": "1.132759",
    "type": "EXCHANGE",
    "hash": "89f59350bc75115893c4b19432aa4649fcf8b61cc756ab0756c7935c2362833c",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.104Z",
    "updatedAt": "2025-12-14T18:30:03.104Z"
  },
  {
    "id": "cmj627zad002jrjaqkd09hzeq",
    "externalId": "68f0f37a-8bc8-a31e-9541-0ad068f68d93",
    "date": "2025-10-16T00:00:00.000Z",
    "description": "Comisión de Revolut Business",
    "amount": "-10",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Tarifa del plan Basic",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "43.91",
    "exchangeRate": null,
    "type": "FEE",
    "hash": "24ba20059425c3905f5251da37059be22a40fd180a6705eadcd4804d07db47a1",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.110Z",
    "updatedAt": "2025-12-14T18:30:03.110Z"
  },
  {
    "id": "cmj627zaj002lrjaq1xxw4r6h",
    "externalId": "68ec9152-815f-a4da-a00c-290cbf30a14d",
    "date": "2025-10-13T00:00:00.000Z",
    "description": "Main · EUR → Main · GBP",
    "amount": "50",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "53.91",
    "exchangeRate": "1.149537",
    "type": "EXCHANGE",
    "hash": "40cacf069e22bf7f7ffd3cff6977e4b5d13108b55a873e260e3cd25ce07a8831",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.115Z",
    "updatedAt": "2025-12-14T18:30:03.115Z"
  },
  {
    "id": "cmj627zap002nrjaqlws2kr0l",
    "externalId": "68c966c1-de05-ab88-8b02-e6e132a1118d",
    "date": "2025-09-16T00:00:00.000Z",
    "description": "Comisión de Revolut Business",
    "amount": "-10",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Tarifa del plan Basic",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "3.91",
    "exchangeRate": null,
    "type": "FEE",
    "hash": "c63cd571cafb90d537688193eaa112b467aa5acbe3fead8dad017b29cc8da83d",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.121Z",
    "updatedAt": "2025-12-14T18:30:03.121Z"
  },
  {
    "id": "cmj627zav002prjaq5hc7w4x5",
    "externalId": "68b4ff08-beeb-a2e5-9bef-77cc9b6e515a",
    "date": "2025-09-01T00:00:00.000Z",
    "description": "De Libra esterlina",
    "amount": "0.87",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "13.91",
    "exchangeRate": null,
    "type": "TRANSFER",
    "hash": "0e56077f3e392df0467442aa0cbe1685009a1e7a81a82baf063f9fc493e08f26",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.127Z",
    "updatedAt": "2025-12-14T18:30:03.127Z"
  },
  {
    "id": "cmj627zb0002rrjaqern992d5",
    "externalId": "68a08812-fd6d-a5b3-a837-666da98d9d14",
    "date": "2025-08-16T00:00:00.000Z",
    "description": "Comisión de Revolut Business",
    "amount": "-10",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Tarifa del plan Basic",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "13.04",
    "exchangeRate": null,
    "type": "FEE",
    "hash": "e90c12f460709f0d05b1488760d345e7a70ed0a618efce67e237f2d34284745c",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.132Z",
    "updatedAt": "2025-12-14T18:30:03.132Z"
  },
  {
    "id": "cmj627zb7002trjaq3d33p2g8",
    "externalId": "6877a9ee-4679-aedd-9473-a8f0bedc16e1",
    "date": "2025-07-16T00:00:00.000Z",
    "description": "Comisión de Revolut Business",
    "amount": "-10",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Tarifa del plan Basic",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "23.04",
    "exchangeRate": null,
    "type": "FEE",
    "hash": "ed3e065944c85d6dce7ce368fc6484fecdfed16521666c35e82db82ec1ac6c23",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.139Z",
    "updatedAt": "2025-12-14T18:30:03.139Z"
  },
  {
    "id": "cmj627zbd002vrjaqzwe42v5x",
    "externalId": "68501ffc-5f2a-a305-a1ff-0d46c9e319e5",
    "date": "2025-06-16T00:00:00.000Z",
    "description": "Comisión de Revolut Business",
    "amount": "-10",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Tarifa del plan Basic",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "33.04",
    "exchangeRate": null,
    "type": "FEE",
    "hash": "0eecf2e6ac17f5e097c3a321ccd67400ae9b2e0704e43de021f41862e9e27538",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.145Z",
    "updatedAt": "2025-12-14T18:30:03.145Z"
  },
  {
    "id": "cmj627zbi002xrjaq8uzpoy1n",
    "externalId": "68396b3d-f28c-a438-a12b-78fb3f00e782",
    "date": "2025-05-30T00:00:00.000Z",
    "description": "Main · EUR → Main · GBP",
    "amount": "42.05",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "43.04",
    "exchangeRate": "1.189048",
    "type": "EXCHANGE",
    "hash": "b85c360ab612885a14f35606ca1d9a96dc7e458df1bcbaf666b10e884fc2c880",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.151Z",
    "updatedAt": "2025-12-14T18:30:03.151Z"
  },
  {
    "id": "cmj627zbp002zrjaqpvrp6uwr",
    "externalId": "68284a38-6367-ab4a-ba10-a7a2968709a7",
    "date": "2025-05-17T00:00:00.000Z",
    "description": "Main · EUR → Main · GBP",
    "amount": "1",
    "currency": "GBP",
    "fee": "0.01",
    "status": null,
    "category": null,
    "reference": "",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "0.99",
    "exchangeRate": "1.191373",
    "type": "EXCHANGE",
    "hash": "39374033b7b553692a1f6b6d29130ae22f652123031697b6835da383c2ce3421",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.157Z",
    "updatedAt": "2025-12-14T18:30:03.157Z"
  },
  {
    "id": "cmj627zbv0031rjaqudt7jkrh",
    "externalId": "67d73027-50d9-a855-83a8-1d74c1bc9514",
    "date": "2025-03-16T00:00:00.000Z",
    "description": "Main · EUR → Main · GBP",
    "amount": "0.79",
    "currency": "GBP",
    "fee": "0.01",
    "status": null,
    "category": null,
    "reference": "Transfer to Main to recover negative balance",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "0",
    "exchangeRate": "1.188679",
    "type": "EXCHANGE",
    "hash": "4197413d1231beea503a2e92c4368b844658ba8366f58ba02cf35189d570e572",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.163Z",
    "updatedAt": "2025-12-14T18:30:03.163Z"
  },
  {
    "id": "cmj627zc10033rjaqwamokt3p",
    "externalId": "67d72f9e-38f7-aaa4-bde7-36009c66fc2a",
    "date": "2025-03-16T00:00:00.000Z",
    "description": "Main · EUR → Main · GBP",
    "amount": "9.25",
    "currency": "GBP",
    "fee": "0.09",
    "status": null,
    "category": null,
    "reference": "Transfer to Main to recover negative balance",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "-0.79",
    "exchangeRate": "1.188679",
    "type": "EXCHANGE",
    "hash": "95628e6af395232caa70d847075bde3568e780dc9bc13f3513b9956dede88f50",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.169Z",
    "updatedAt": "2025-12-14T18:30:03.169Z"
  },
  {
    "id": "cmj627a3d0021rjaqomzcko9j",
    "externalId": "693b128c-8361-a43c-b913-a88dbc253893",
    "date": "2025-12-11T00:00:00.000Z",
    "description": "Dinero añadido por PUROSYS",
    "amount": "3500",
    "currency": "USD",
    "fee": "0",
    "status": null,
    "category": "aaa",
    "reference": "BRANCH 009969. SUB-CONTRACTING FEES",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "3500",
    "exchangeRate": null,
    "type": "TOPUP",
    "hash": "c1d76164e617e70f7214c15f6c753ffca3be3a9e6e11f9a8f7f768064163d28c",
    "bankAccountId": "cmj61chrg0001rjaqiqc473pe",
    "bankStatementId": "cmj627a32001xrjaqfpa6b3ae",
    "createdAt": "2025-12-14T18:29:30.458Z",
    "updatedAt": "2025-12-14T18:39:19.781Z"
  },
  {
    "id": "cmj627z9f0027rjaq46d4fe3d",
    "externalId": "69369a1e-c204-a732-8c0c-581dcdd2662d",
    "date": "2025-12-08T00:00:00.000Z",
    "description": "A Uhuru Trade Ltd.",
    "amount": "-0.44",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": "hola",
    "reference": "Revolut",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "19.87",
    "exchangeRate": "1.14288",
    "type": "TRANSFER",
    "hash": "51766bdf15071a786087730928e71ea141d026da218ee3e3cda9bdf7fa36ebbc",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.075Z",
    "updatedAt": "2025-12-14T18:41:59.980Z"
  },
  {
    "id": "cmj627z970025rjaq7dmbb1n0",
    "externalId": "69369b18-429e-a3ea-ae96-ac5d533889c9",
    "date": "2025-12-08T00:00:00.000Z",
    "description": "A Uhuru Trade Ltd",
    "amount": "-0.2",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": "hola",
    "reference": "Revolut pounds",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "19.67",
    "exchangeRate": null,
    "type": "TRANSFER",
    "hash": "13e41f137e7081698f2d92cf456df0aed0df47044e4a578c0cc6660350d2a6eb",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.068Z",
    "updatedAt": "2025-12-14T18:42:03.097Z"
  },
  {
    "id": "cmj627z9w002drjaqkwtwnh4e",
    "externalId": "6919d219-99f5-a46d-adf6-aa61c74fef61",
    "date": "2025-11-16T00:00:00.000Z",
    "description": "Comisión de Revolut Business",
    "amount": "-10",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": "Fees",
    "reference": "Tarifa del plan Basic",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "49.52",
    "exchangeRate": null,
    "type": "FEE",
    "hash": "e7675711ba06ccf567def41a6e61e815e86e22a04cb49d6bea46aa48a3d82b9d",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.092Z",
    "updatedAt": "2025-12-14T18:47:23.879Z"
  },
  {
    "id": "cmj627zc70035rjaqe6vpjhew",
    "externalId": "67d6d9d2-f646-aea3-afd0-01b420d9bc40",
    "date": "2025-03-16T00:00:00.000Z",
    "description": "Main · EUR → Main · GBP",
    "amount": "0.04",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Transfer to Main to recover negative balance",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "-9.95",
    "exchangeRate": "1.188773",
    "type": "EXCHANGE",
    "hash": "e79625318796e475cce9f6c91cb4c82f6a66fc238025151210dcc842bf159065",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.176Z",
    "updatedAt": "2025-12-14T18:30:03.176Z"
  },
  {
    "id": "cmj627zcd0037rjaqsa2465f6",
    "externalId": "67d6d9d2-8593-a16b-9267-c4f3518d7c05",
    "date": "2025-03-16T00:00:00.000Z",
    "description": "Comisión de Revolut Business",
    "amount": "-10",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "Tarifa del plan Basic",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "-9.99",
    "exchangeRate": null,
    "type": "FEE",
    "hash": "5d691541dd55c3bcb6c939bda00ef1fab234a4da02682ef5e88ccd6eaa5c3156",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.181Z",
    "updatedAt": "2025-12-14T18:30:03.181Z"
  },
  {
    "id": "cmj627zcj0039rjaqomz92mw7",
    "externalId": "67d6d5e0-21cf-a60a-a7ed-ba67752bc4ad",
    "date": "2025-03-16T00:00:00.000Z",
    "description": "Dinero añadido por UHURU TRADE LTD",
    "amount": "0.01",
    "currency": "GBP",
    "fee": "0",
    "status": null,
    "category": null,
    "reference": "UHURU TRADE LTD",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "0.01",
    "exchangeRate": null,
    "type": "TOPUP",
    "hash": "a80ea929689d55de34820a79890f9677e174152ea8bf9418c1e6de725382e405",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": "cmj627z7y0023rjaqpycqwulx",
    "createdAt": "2025-12-14T18:30:03.187Z",
    "updatedAt": "2025-12-14T18:30:03.187Z"
  },
  {
    "id": "cmj627a37001zrjaqwkxds63i",
    "externalId": "693baf9d-e626-a004-95ff-5910cced1323",
    "date": "2025-12-12T00:00:00.000Z",
    "description": "A Raul Ortega",
    "amount": "-1173.96",
    "currency": "USD",
    "fee": "0",
    "status": null,
    "category": "Loans",
    "reference": "Dir Loan Repay",
    "counterparty": "Raul Ortega Irus",
    "merchant": null,
    "balanceAfter": "2326.04",
    "exchangeRate": "0.851819",
    "type": "TRANSFER",
    "hash": "bef49cbf6cc224372d2528c6f4e7ed2c3c4774a5c3f6f0ffc4ce666f77dd47f7",
    "bankAccountId": "cmj61chrg0001rjaqiqc473pe",
    "bankStatementId": "cmj627a32001xrjaqfpa6b3ae",
    "createdAt": "2025-12-14T18:29:30.452Z",
    "updatedAt": "2025-12-14T18:45:44.067Z"
  },
  {
    "id": "cmj626zll000grjaqvjles39s",
    "externalId": "69280c7e-2ccb-afb5-a214-ce4a7104b368",
    "date": "2025-11-27T00:00:00.000Z",
    "description": "Dinero añadido por RAUL ORTEGA",
    "amount": "50",
    "currency": "EUR",
    "fee": "0",
    "status": null,
    "category": "Loans",
    "reference": "Director Loan",
    "counterparty": "",
    "merchant": null,
    "balanceAfter": "50.63",
    "exchangeRate": null,
    "type": "TOPUP",
    "hash": "5a6118e3f21b22162a4610cb92e9f2f464a27f4a18a5fb2d43728290552b1795",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": "cmj626zjy000arjaqfri53142",
    "createdAt": "2025-12-14T18:29:16.857Z",
    "updatedAt": "2025-12-14T18:49:30.286Z"
  }
] as any[]) {
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
