
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // --- CLEANUP (Delete existing data to enforce strict sync) ---
  console.log('🧹 Cleaning up existing data (Transactions, Invoices, Settings, etc.)...');
  // Order matters due to Foreign Keys
  await prisma.attachment.deleteMany().catch(() => {});
  await prisma.invoiceItem.deleteMany().catch(() => {});
  await prisma.deletedTransaction.deleteMany().catch(() => {}); // New
  await prisma.bankTransaction.deleteMany().catch(() => {});
  await prisma.bankStatement.deleteMany().catch(() => {}); // New
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
    "updatedAt": "2025-12-14T08:39:19.496Z",
    "accounts": [
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
      }
    ]
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
    "updatedAt": "2025-12-14T08:39:19.520Z",
    "accounts": [
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
    ]
  }
] as any[]) {
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
  for (const st of [
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
  }
] as any[]) {
    await prisma.bankStatement.create({
        data: {
            ...st,
            uploadedAt: new Date(st.uploadedAt),
        } as any
    }).catch(e => console.log('Bank Statement error'));
  }

  // --- Transactions ---
  // Using simple create because IDs might conflict if we are not careful, but usually strict copy is fine
  for (const t of [] as any[]) {
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
  for (const dt of [] as any[]) {
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
