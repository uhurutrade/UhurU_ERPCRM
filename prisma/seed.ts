
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // --- Users ---
  for (const user of []) {
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
    "corporationTaxReference": "f",
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
    "createdAt": "2025-12-13T18:58:17.860Z",
    "updatedAt": "2025-12-13T20:38:14.461Z"
  }
]) {
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
    "supportEmail": "support@revolut.com",
    "supportPhone": "+44 20 3322 8352",
    "bankAddress": "7 Westferry Circus",
    "bankCity": "London",
    "bankPostcode": "E14 4HD",
    "bankCountry": "United Kingdom",
    "isActive": true,
    "notes": "Multi-currency neobank with instant transfers and crypto support",
    "createdAt": "2025-12-13T19:18:54.349Z",
    "updatedAt": "2025-12-13T19:18:54.349Z",
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
        "sortCode": null,
        "accountNumberUK": null,
        "ibanCH": null,
        "bcNumber": null,
        "swiftBic": "REVOGB21",
        "currentBalance": "25000",
        "availableBalance": "25000",
        "lastBalanceUpdate": null,
        "isActive": true,
        "isPrimary": true,
        "order": 1,
        "notes": "Main EUR account for SEPA transfers",
        "createdAt": "2025-12-13T19:18:54.355Z",
        "updatedAt": "2025-12-13T20:33:18.110Z"
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
        "sortCode": "040004",
        "accountNumberUK": "12345678",
        "ibanCH": null,
        "bcNumber": null,
        "swiftBic": "REVOGB21",
        "currentBalance": "15000",
        "availableBalance": "15000",
        "lastBalanceUpdate": null,
        "isActive": true,
        "isPrimary": false,
        "order": 0,
        "notes": "Main GBP account for UK payments",
        "createdAt": "2025-12-13T19:18:54.362Z",
        "updatedAt": "2025-12-13T20:33:27.020Z"
      },
      {
        "id": "cmj4oiyea0006a47oohpl0vhd",
        "bankId": "cmj4oiydp0000a47op1qeul17",
        "accountName": "Revolut USD Business",
        "accountType": "BUSINESS",
        "currency": "USD",
        "iban": null,
        "accountNumber": "123456789012",
        "routingNumber": "026073150",
        "sortCode": null,
        "accountNumberUK": null,
        "ibanCH": null,
        "bcNumber": null,
        "swiftBic": "REVOGB21",
        "currentBalance": "50000",
        "availableBalance": "50000",
        "lastBalanceUpdate": null,
        "isActive": true,
        "isPrimary": false,
        "order": 2,
        "notes": "USD account for US payments and international transfers",
        "createdAt": "2025-12-13T19:18:54.370Z",
        "updatedAt": "2025-12-13T20:34:57.459Z"
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
    "supportEmail": "support@wise.com",
    "supportPhone": "+44 20 3695 8888",
    "bankAddress": "56 Shoreditch High Street",
    "bankCity": "London",
    "bankPostcode": "E1 6JJ",
    "bankCountry": "United Kingdom",
    "isActive": true,
    "notes": "International money transfer service with multi-currency accounts",
    "createdAt": "2025-12-13T19:18:54.383Z",
    "updatedAt": "2025-12-13T19:18:54.383Z",
    "accounts": [
      {
        "id": "cmj4oiyeq000ba47ouvhdn9cd",
        "bankId": "cmj4oiyen0009a47otrw1dys4",
        "accountName": "Wise EUR Business",
        "accountType": "MULTI_CURRENCY",
        "currency": "EUR",
        "iban": "BE68539007547034",
        "accountNumber": null,
        "routingNumber": null,
        "sortCode": null,
        "accountNumberUK": null,
        "ibanCH": null,
        "bcNumber": null,
        "swiftBic": "TRWIBEB1XXX",
        "currentBalance": "18500",
        "availableBalance": "18500",
        "lastBalanceUpdate": null,
        "isActive": true,
        "isPrimary": true,
        "order": 0,
        "notes": "EUR account for European SEPA transfers",
        "createdAt": "2025-12-13T19:18:54.386Z",
        "updatedAt": "2025-12-13T19:18:54.386Z"
      },
      {
        "id": "cmj4oiyeu000da47o4fd88rbb",
        "bankId": "cmj4oiyen0009a47otrw1dys4",
        "accountName": "Wise GBP Business",
        "accountType": "MULTI_CURRENCY",
        "currency": "GBP",
        "iban": "GB33BUKB20201555555555",
        "accountNumber": null,
        "routingNumber": null,
        "sortCode": "231470",
        "accountNumberUK": "87654321",
        "ibanCH": null,
        "bcNumber": null,
        "swiftBic": "TRWIGB22",
        "currentBalance": "22000",
        "availableBalance": "22000",
        "lastBalanceUpdate": null,
        "isActive": true,
        "isPrimary": false,
        "order": 0,
        "notes": "GBP account for UK domestic transfers",
        "createdAt": "2025-12-13T19:18:54.390Z",
        "updatedAt": "2025-12-13T20:33:22.979Z"
      },
      {
        "id": "cmj4oiyey000fa47o5rppwica",
        "bankId": "cmj4oiyen0009a47otrw1dys4",
        "accountName": "Wise USD Business",
        "accountType": "MULTI_CURRENCY",
        "currency": "USD",
        "iban": null,
        "accountNumber": "987654321098",
        "routingNumber": "026073008",
        "sortCode": null,
        "accountNumberUK": null,
        "ibanCH": null,
        "bcNumber": null,
        "swiftBic": "CMFGUS33",
        "currentBalance": "35000",
        "availableBalance": "35000",
        "lastBalanceUpdate": null,
        "isActive": true,
        "isPrimary": false,
        "order": 0,
        "notes": "USD account for US ACH and wire transfers",
        "createdAt": "2025-12-13T19:18:54.394Z",
        "updatedAt": "2025-12-13T20:33:44.947Z"
      }
    ]
  }
]) {
    await prisma.bank.create({
      data: {
        ...bank,
        accounts: {
            create: bank.accounts.map(acc => ({
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
    "contractAddress": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    "provider": "MetaMask",
    "currentBalance": "50000",
    "balanceUSD": "50000",
    "lastBalanceUpdate": null,
    "isMultiSig": false,
    "requiredSignatures": null,
    "isActive": true,
    "notes": "Main USDC wallet on Polygon for low-fee stablecoin transactions",
    "createdAt": "2025-12-13T19:18:54.403Z",
    "updatedAt": "2025-12-13T19:18:54.403Z"
  },
  {
    "id": "cmj4oiyfb000ja47o5epodl72",
    "walletName": "Corporate USDC - Ethereum",
    "walletType": "HOT_WALLET",
    "blockchain": "ETHEREUM",
    "network": "MAINNET",
    "asset": "USDC",
    "assetType": "ERC20",
    "contractAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "walletAddress": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    "provider": "MetaMask",
    "currentBalance": "25000",
    "balanceUSD": "25000",
    "lastBalanceUpdate": null,
    "isMultiSig": false,
    "requiredSignatures": null,
    "isActive": true,
    "notes": "USDC on Ethereum mainnet for DeFi and large transactions",
    "createdAt": "2025-12-13T19:18:54.407Z",
    "updatedAt": "2025-12-13T19:18:54.407Z"
  },
  {
    "id": "cmj4oiyfe000ka47oytj1h0pt",
    "walletName": "Corporate BTC Treasury",
    "walletType": "COLD_WALLET",
    "blockchain": "BITCOIN",
    "network": "MAINNET",
    "asset": "BTC",
    "assetType": "NATIVE",
    "contractAddress": null,
    "walletAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "provider": "Ledger",
    "currentBalance": "0.5",
    "balanceUSD": "21500",
    "lastBalanceUpdate": null,
    "isMultiSig": true,
    "requiredSignatures": 2,
    "isActive": true,
    "notes": "Cold storage for BTC treasury - requires 2 of 3 signatures",
    "createdAt": "2025-12-13T19:18:54.410Z",
    "updatedAt": "2025-12-13T19:18:54.410Z"
  },
  {
    "id": "cmj4oiyfi000la47om1bm9y7k",
    "walletName": "Corporate ETH Wallet",
    "walletType": "HOT_WALLET",
    "blockchain": "ETHEREUM",
    "network": "MAINNET",
    "asset": "ETH",
    "assetType": "NATIVE",
    "contractAddress": null,
    "walletAddress": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    "provider": "MetaMask",
    "currentBalance": "5.25",
    "balanceUSD": "11812.5",
    "lastBalanceUpdate": null,
    "isMultiSig": false,
    "requiredSignatures": null,
    "isActive": true,
    "notes": "Main ETH wallet for gas fees and ETH holdings",
    "createdAt": "2025-12-13T19:18:54.415Z",
    "updatedAt": "2025-12-13T19:18:54.415Z"
  },
  {
    "id": "cmj4oiyfm000ma47oi5coquht",
    "walletName": "Corporate USDT - Polygon",
    "walletType": "HOT_WALLET",
    "blockchain": "POLYGON",
    "network": "MAINNET",
    "asset": "USDT",
    "assetType": "ERC20",
    "contractAddress": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    "walletAddress": "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
    "provider": "MetaMask",
    "currentBalance": "15000",
    "balanceUSD": "15000",
    "lastBalanceUpdate": null,
    "isMultiSig": false,
    "requiredSignatures": null,
    "isActive": true,
    "notes": "USDT on Polygon for alternative stablecoin option",
    "createdAt": "2025-12-13T19:18:54.418Z",
    "updatedAt": "2025-12-13T19:18:54.418Z"
  }
]) {
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
  for (const org of []) {
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
  for (const contact of []) {
    await prisma.contact.create({
        data: {
            ...contact,
            createdAt: new Date(contact.createdAt),
            updatedAt: new Date(contact.updatedAt),
        } as any
    }).catch(e => console.log('Contact error'));
  }
  
 // --- CRM: Deals ---
  for (const deal of []) {
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
  for (const inv of []) {
    await prisma.invoice.create({
        data: {
            ...inv,
            date: new Date(inv.date),
            dueDate: new Date(inv.dueDate),
            createdAt: new Date(inv.createdAt),
            updatedAt: new Date(inv.updatedAt),
            items: {
                create: inv.items.map(item => ({
                    ...item,
                    invoiceId: undefined,
                    createdAt: undefined, // InvoiceItem usually doesn't have timestamps but let's check schema
                }))
            }
        } as any
    }).catch(e => console.log('Invoice error'));
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
