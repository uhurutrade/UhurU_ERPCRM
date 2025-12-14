
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

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
    "companyName": "UHURU TRADE LTD",
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
    "updatedAt": "2025-12-14T08:39:19.479Z"
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
        "accountName": "Revolut EUR Business",
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
        "currentBalance": "25000",
        "availableBalance": null,
        "lastBalanceUpdate": null,
        "isActive": true,
        "isPrimary": true,
        "order": 0,
        "notes": null,
        "createdAt": "2025-12-14T08:39:19.504Z",
        "updatedAt": "2025-12-14T08:39:19.504Z"
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
        "isPrimary": true,
        "order": 0,
        "notes": null,
        "createdAt": "2025-12-14T08:39:19.513Z",
        "updatedAt": "2025-12-14T08:39:19.513Z"
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
        "id": "cmj4oiyey000fa47o5rppwica",
        "bankId": "cmj4oiyen0009a47otrw1dys4",
        "accountName": "Wise USD Business",
        "accountType": "MULTI_CURRENCY",
        "currency": "USD",
        "iban": null,
        "accountNumber": "987654321098",
        "routingNumber": "026073008",
        "wireRoutingNumber": "026073009",
        "sortCode": null,
        "accountNumberUK": null,
        "ibanCH": null,
        "bcNumber": null,
        "swiftBic": "CMFGUS33",
        "currentBalance": "35000",
        "availableBalance": null,
        "lastBalanceUpdate": null,
        "isActive": true,
        "isPrimary": true,
        "order": 0,
        "notes": null,
        "createdAt": "2025-12-14T08:39:19.525Z",
        "updatedAt": "2025-12-14T08:39:19.525Z"
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

  // --- Transactions ---
  // Using simple create because IDs might conflict if we are not careful, but usually strict copy is fine
  for (const t of [
  {
    "id": "cmj5h4auj0001qxyjnam5a3dp",
    "externalId": null,
    "date": "2024-09-15T00:00:00.000Z",
    "description": "Consulting Fee - Client A",
    "amount": "5000",
    "currency": "EUR",
    "fee": null,
    "status": "COMPLETED",
    "category": "Income",
    "reference": "REF-3422",
    "hash": "2024-09-15_5000_ConsultingFee-ClientA_v1e0kw",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.532Z",
    "updatedAt": "2025-12-14T08:39:19.532Z"
  },
  {
    "id": "cmj5h4auq0003qxyjlvms3na7",
    "externalId": null,
    "date": "2024-10-20T00:00:00.000Z",
    "description": "Software Dev Project - Milestone 1",
    "amount": "12000",
    "currency": "EUR",
    "fee": null,
    "status": "COMPLETED",
    "category": "Income",
    "reference": "REF-6528",
    "hash": "2024-10-20_12000_SoftwareDevProject-Milestone1_o5jf8t",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.538Z",
    "updatedAt": "2025-12-14T08:39:19.538Z"
  },
  {
    "id": "cmj5h4aut0005qxyj2n1buib4",
    "externalId": null,
    "date": "2024-11-01T00:00:00.000Z",
    "description": "Maintenance Retainer",
    "amount": "2000",
    "currency": "EUR",
    "fee": null,
    "status": "COMPLETED",
    "category": "Income",
    "reference": "REF-6269",
    "hash": "2024-11-01_2000_MaintenanceRetainer_mdsrxk",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.541Z",
    "updatedAt": "2025-12-14T08:39:19.541Z"
  },
  {
    "id": "cmj5h4auw0007qxyjcym9nx3g",
    "externalId": null,
    "date": "2024-12-10T00:00:00.000Z",
    "description": "Consulting Fee - Client B",
    "amount": "7500",
    "currency": "GBP",
    "fee": null,
    "status": "COMPLETED",
    "category": "Income",
    "reference": "REF-6942",
    "hash": "2024-12-10_7500_ConsultingFee-ClientB_rc0tet",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.545Z",
    "updatedAt": "2025-12-14T08:39:19.545Z"
  },
  {
    "id": "cmj5h4av00009qxyj343apmb8",
    "externalId": null,
    "date": "2025-01-20T00:00:00.000Z",
    "description": "Software Dev Project - Milestone 2",
    "amount": "12000",
    "currency": "GBP",
    "fee": null,
    "status": "COMPLETED",
    "category": "Income",
    "reference": "REF-8880",
    "hash": "2025-01-20_12000_SoftwareDevProject-Milestone2_o3da97",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.549Z",
    "updatedAt": "2025-12-14T08:39:19.549Z"
  },
  {
    "id": "cmj5h4av5000bqxyj0fnrgvau",
    "externalId": null,
    "date": "2025-03-15T00:00:00.000Z",
    "description": "Q1 Bonus Payment",
    "amount": "3000",
    "currency": "GBP",
    "fee": null,
    "status": "COMPLETED",
    "category": "Income",
    "reference": "REF-73",
    "hash": "2025-03-15_3000_Q1BonusPayment_pqzr3p",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.553Z",
    "updatedAt": "2025-12-14T08:39:19.553Z"
  },
  {
    "id": "cmj5h4av8000dqxyj45pisvek",
    "externalId": null,
    "date": "2025-05-20T00:00:00.000Z",
    "description": "Consulting Fee - Client A",
    "amount": "5500",
    "currency": "GBP",
    "fee": null,
    "status": "COMPLETED",
    "category": "Income",
    "reference": "REF-3451",
    "hash": "2025-05-20_5500_ConsultingFee-ClientA_bghlz3",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.557Z",
    "updatedAt": "2025-12-14T08:39:19.557Z"
  },
  {
    "id": "cmj5h4avb000fqxyjjgty3lux",
    "externalId": null,
    "date": "2025-07-05T00:00:00.000Z",
    "description": "New Project Deposit",
    "amount": "8000",
    "currency": "EUR",
    "fee": null,
    "status": "COMPLETED",
    "category": "Income",
    "reference": "REF-271",
    "hash": "2025-07-05_8000_NewProjectDeposit_l2li6b",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.560Z",
    "updatedAt": "2025-12-14T08:39:19.560Z"
  },
  {
    "id": "cmj5h4avf000hqxyj72smirxb",
    "externalId": null,
    "date": "2024-09-01T00:00:00.000Z",
    "description": "Server Hosting (AWS)",
    "amount": "-150",
    "currency": "EUR",
    "fee": null,
    "status": "COMPLETED",
    "category": "Expense",
    "reference": "REF-3537",
    "hash": "2024-09-01_-150_ServerHosting(AWS)_yis14",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.563Z",
    "updatedAt": "2025-12-14T08:39:19.563Z"
  },
  {
    "id": "cmj5h4avi000jqxyjvdgtqgj3",
    "externalId": null,
    "date": "2024-09-05T00:00:00.000Z",
    "description": "Software Licenses",
    "amount": "-450",
    "currency": "EUR",
    "fee": null,
    "status": "COMPLETED",
    "category": "Expense",
    "reference": "REF-3858",
    "hash": "2024-09-05_-450_SoftwareLicenses_v7meef",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.566Z",
    "updatedAt": "2025-12-14T08:39:19.566Z"
  },
  {
    "id": "cmj5h4avl000lqxyjcj40xapm",
    "externalId": null,
    "date": "2024-10-15T00:00:00.000Z",
    "description": "Legal Fees",
    "amount": "-1200",
    "currency": "EUR",
    "fee": null,
    "status": "COMPLETED",
    "category": "Expense",
    "reference": "REF-4332",
    "hash": "2024-10-15_-1200_LegalFees_mqlvs3",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.570Z",
    "updatedAt": "2025-12-14T08:39:19.570Z"
  },
  {
    "id": "cmj5h4avo000nqxyjbgdrynbo",
    "externalId": null,
    "date": "2024-10-01T00:00:00.000Z",
    "description": "Server Hosting (AWS)",
    "amount": "-150",
    "currency": "EUR",
    "fee": null,
    "status": "COMPLETED",
    "category": "Expense",
    "reference": "REF-5727",
    "hash": "2024-10-01_-150_ServerHosting(AWS)_5dkzqe",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.572Z",
    "updatedAt": "2025-12-14T08:39:19.572Z"
  },
  {
    "id": "cmj5h4avr000pqxyjw27astpy",
    "externalId": null,
    "date": "2024-11-25T00:00:00.000Z",
    "description": "Contractor Payout",
    "amount": "-3500",
    "currency": "EUR",
    "fee": null,
    "status": "COMPLETED",
    "category": "Expense",
    "reference": "REF-3404",
    "hash": "2024-11-25_-3500_ContractorPayout_k00ahh",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.575Z",
    "updatedAt": "2025-12-14T08:39:19.575Z"
  },
  {
    "id": "cmj5h4avu000rqxyjdbigsjci",
    "externalId": null,
    "date": "2024-12-05T00:00:00.000Z",
    "description": "Office Supplies",
    "amount": "-300",
    "currency": "EUR",
    "fee": null,
    "status": "COMPLETED",
    "category": "Expense",
    "reference": "REF-4798",
    "hash": "2024-12-05_-300_OfficeSupplies_fd9v85",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.578Z",
    "updatedAt": "2025-12-14T08:39:19.578Z"
  },
  {
    "id": "cmj5h4avx000tqxyjgqjpyt2j",
    "externalId": null,
    "date": "2025-01-05T00:00:00.000Z",
    "description": "Annual Co. House Fee",
    "amount": "-13",
    "currency": "GBP",
    "fee": null,
    "status": "COMPLETED",
    "category": "Expense",
    "reference": "REF-8515",
    "hash": "2025-01-05_-13_AnnualCo.HouseFee_6olae",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.581Z",
    "updatedAt": "2025-12-14T08:39:19.581Z"
  },
  {
    "id": "cmj5h4aw1000vqxyjjqp9wsm2",
    "externalId": null,
    "date": "2025-02-01T00:00:00.000Z",
    "description": "Server Hosting (AWS)",
    "amount": "-160",
    "currency": "GBP",
    "fee": null,
    "status": "COMPLETED",
    "category": "Expense",
    "reference": "REF-9368",
    "hash": "2025-02-01_-160_ServerHosting(AWS)_lmdvl",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.585Z",
    "updatedAt": "2025-12-14T08:39:19.585Z"
  },
  {
    "id": "cmj5h4aw4000xqxyjir5xof20",
    "externalId": null,
    "date": "2025-04-10T00:00:00.000Z",
    "description": "Marketing Campaign",
    "amount": "-2500",
    "currency": "GBP",
    "fee": null,
    "status": "COMPLETED",
    "category": "Expense",
    "reference": "REF-10",
    "hash": "2025-04-10_-2500_MarketingCampaign_7a0w5",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.588Z",
    "updatedAt": "2025-12-14T08:39:19.588Z"
  },
  {
    "id": "cmj5h4aw7000zqxyjnsppj9w1",
    "externalId": null,
    "date": "2025-06-20T00:00:00.000Z",
    "description": "Travel Expenses",
    "amount": "-850",
    "currency": "GBP",
    "fee": null,
    "status": "COMPLETED",
    "category": "Expense",
    "reference": "REF-684",
    "hash": "2025-06-20_-850_TravelExpenses_6v856",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.591Z",
    "updatedAt": "2025-12-14T08:39:19.591Z"
  },
  {
    "id": "cmj5h4aw90011qxyj5ncez577",
    "externalId": null,
    "date": "2025-09-01T00:00:00.000Z",
    "description": "Retainer - Client C",
    "amount": "4000",
    "currency": "GBP",
    "fee": null,
    "status": "COMPLETED",
    "category": "Income",
    "reference": "REF-7810",
    "hash": "2025-09-01_4000_Retainer-ClientC_0phyr8",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.593Z",
    "updatedAt": "2025-12-14T08:39:19.593Z"
  },
  {
    "id": "cmj5h4awc0013qxyj54hqvutb",
    "externalId": null,
    "date": "2025-09-25T00:00:00.000Z",
    "description": "Web App Launch Payment",
    "amount": "15000",
    "currency": "GBP",
    "fee": null,
    "status": "COMPLETED",
    "category": "Income",
    "reference": "REF-9054",
    "hash": "2025-09-25_15000_WebAppLaunchPayment_xgdxcb",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.597Z",
    "updatedAt": "2025-12-14T08:39:19.597Z"
  },
  {
    "id": "cmj5h4awg0015qxyje3i28yau",
    "externalId": null,
    "date": "2025-10-15T00:00:00.000Z",
    "description": "Consulting Fee - Client A",
    "amount": "6000",
    "currency": "GBP",
    "fee": null,
    "status": "COMPLETED",
    "category": "Income",
    "reference": "REF-681",
    "hash": "2025-10-15_6000_ConsultingFee-ClientA_lby7fi",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.600Z",
    "updatedAt": "2025-12-14T08:39:19.600Z"
  },
  {
    "id": "cmj5h4awj0017qxyjmtbohnrf",
    "externalId": null,
    "date": "2025-11-05T00:00:00.000Z",
    "description": "Emergency Support",
    "amount": "1500",
    "currency": "GBP",
    "fee": null,
    "status": "COMPLETED",
    "category": "Income",
    "reference": "REF-6506",
    "hash": "2025-11-05_1500_EmergencySupport_1dtn2q",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.603Z",
    "updatedAt": "2025-12-14T08:39:19.603Z"
  },
  {
    "id": "cmj5h4awl0019qxyjqww3gatb",
    "externalId": null,
    "date": "2025-12-10T00:00:00.000Z",
    "description": "Holiday Promo Sales",
    "amount": "4500",
    "currency": "EUR",
    "fee": null,
    "status": "COMPLETED",
    "category": "Income",
    "reference": "REF-4060",
    "hash": "2025-12-10_4500_HolidayPromoSales_1yc88w",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.606Z",
    "updatedAt": "2025-12-14T08:39:19.606Z"
  },
  {
    "id": "cmj5h4awo001bqxyjltfco462",
    "externalId": null,
    "date": "2025-09-01T00:00:00.000Z",
    "description": "Server Hosting (AWS)",
    "amount": "-180",
    "currency": "EUR",
    "fee": null,
    "status": "COMPLETED",
    "category": "Expense",
    "reference": "REF-4754",
    "hash": "2025-09-01_-180_ServerHosting(AWS)_e9qxb",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.608Z",
    "updatedAt": "2025-12-14T08:39:19.608Z"
  },
  {
    "id": "cmj5h4awq001dqxyjhio4mn6r",
    "externalId": null,
    "date": "2025-09-10T00:00:00.000Z",
    "description": "Accounting Service",
    "amount": "-500",
    "currency": "EUR",
    "fee": null,
    "status": "COMPLETED",
    "category": "Expense",
    "reference": "REF-6738",
    "hash": "2025-09-10_-500_AccountingService_lo6fd4",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.610Z",
    "updatedAt": "2025-12-14T08:39:19.610Z"
  },
  {
    "id": "cmj5h4awt001fqxyjxke3uiu8",
    "externalId": null,
    "date": "2025-10-05T00:00:00.000Z",
    "description": "New Laptop Eqpt",
    "amount": "-2200",
    "currency": "EUR",
    "fee": null,
    "status": "COMPLETED",
    "category": "Expense",
    "reference": "REF-9731",
    "hash": "2025-10-05_-2200_NewLaptopEqpt_l0qwo",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.613Z",
    "updatedAt": "2025-12-14T08:39:19.613Z"
  },
  {
    "id": "cmj5h4aww001hqxyjtcpxdlz7",
    "externalId": null,
    "date": "2025-11-01T00:00:00.000Z",
    "description": "SaaS Subscriptions",
    "amount": "-250",
    "currency": "GBP",
    "fee": null,
    "status": "COMPLETED",
    "category": "Expense",
    "reference": "REF-6704",
    "hash": "2025-11-01_-250_SaaSSubscriptions_8wpon",
    "bankAccountId": "cmj4oiye20004a47open4oqfq",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.616Z",
    "updatedAt": "2025-12-14T08:39:19.616Z"
  },
  {
    "id": "cmj5h4awz001jqxyjpa28s9yx",
    "externalId": null,
    "date": "2025-12-12T00:00:00.000Z",
    "description": "Christmas Party",
    "amount": "-800",
    "currency": "EUR",
    "fee": null,
    "status": "COMPLETED",
    "category": "Expense",
    "reference": "REF-1880",
    "hash": "2025-12-12_-800_ChristmasParty_n42kh",
    "bankAccountId": "cmj4oiydv0002a47o3h33cgnc",
    "bankStatementId": null,
    "createdAt": "2025-12-14T08:39:19.619Z",
    "updatedAt": "2025-12-14T08:39:19.619Z"
  }
] as any[]) {
    await prisma.bankTransaction.create({
        data: {
            ...t,
            amount: t.amount ? Number(t.amount) : 0,
            fee: t.fee ? Number(t.fee) : null,
            date: new Date(t.date),
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            bankStatementId: undefined, // skip complex relations for now or keep if needed
        } as any
    }).catch(e => console.log('Transaction error (possibly duplicate hash)'));
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
