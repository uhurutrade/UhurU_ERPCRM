
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  try {
    // --- 1. Clean up existing data (optional but good for dev) ---
    // In production be careful, but for dev:
    // await prisma.bankTransaction.deleteMany();
    // await prisma.bankAccount.deleteMany();
    // await prisma.bank.deleteMany();
    // await prisma.companySettings.deleteMany();
    // await prisma.taxObligation.deleteMany();

    // --- 2. Company Settings ---
    const company = await prisma.companySettings.upsert({
      where: { id: "cmj4nsgar0000124l7l4uqtjj" },
      update: {},
      create: {
        id: "cmj4nsgar0000124l7l4uqtjj",
        companyName: "UHURU TRADE LTD",
        companyNumber: "15883242",
        incorporationDate: new Date("2024-08-07T00:00:00.000Z"),
        registeredAddress: "Unit 13 Freeland Park Wareham Road",
        registeredCity: "Lytchett Matravers, Poole",
        registeredPostcode: "BH16 6FA",
        registeredCountry: "United Kingdom",
        tradingAddress: "Unit 13 Freeland Park Wareham Road",
        tradingCity: "Lytchett Matravers, Poole",
        tradingPostcode: "BH16 6FA",
        companyType: "Ltd",
        sicCodes: "47910, 62012, 62020, 70229",
        financialYearEnd: "31-08",
        accountsNextDueDate: new Date("2027-05-31T00:00:00.000Z"),
        confirmationNextDueDate: new Date("2026-08-09T00:00:00.000Z"),
        vatRegistered: false,
        corporationTaxReference: "1234567890",
        directors: "Raul Ortega Irus",
        companySecretary: ".",
        shareCapital: "1",
        numberOfShares: 1,
        website: "https://uhurutrade.com",
        notes: "Datos importados de Companies House el 12/12/2025",
      }
    });

    // --- 3. Banks & Accounts ---
    // Revolut
    const revolut = await prisma.bank.upsert({
      where: { id: "cmj4oiydp0000a47op1qeul17" },
      update: {},
      create: {
        id: "cmj4oiydp0000a47op1qeul17",
        bankName: "Revolut",
        bankType: "NEOBANK",
        swiftBic: "REVOGB21",
        website: "https://www.revolut.com",
        bankCountry: "United Kingdom",
        isActive: true,
      }
    });

    // Revolut Accounts
    const revEur = await prisma.bankAccount.upsert({
      where: { id: "cmj4oiydv0002a47o3h33cgnc" },
      update: {},
      create: {
        id: "cmj4oiydv0002a47o3h33cgnc",
        bankId: revolut.id,
        accountName: "Revolut EUR Business",
        accountType: "BUSINESS",
        currency: "EUR",
        iban: "GB33REVO00996912345678",
        swiftBic: "REVOGB21",
        currentBalance: 25000,
        isActive: true,
        isPrimary: true,
      }
    });

    const revGbp = await prisma.bankAccount.upsert({
      where: { id: "cmj4oiye20004a47open4oqfq" },
      update: {},
      create: {
        id: "cmj4oiye20004a47open4oqfq",
        bankId: revolut.id,
        accountName: "Revolut GBP Business",
        accountType: "BUSINESS",
        currency: "GBP",
        iban: "GB29REVO00996987654321",
        sortCode: "040004",
        accountNumberUK: "12345678",
        swiftBic: "REVOGB21",
        currentBalance: 15000,
        isActive: true,
        isPrimary: true,
      }
    });

    // Wise
    const wise = await prisma.bank.upsert({
      where: { id: "cmj4oiyen0009a47otrw1dys4" },
      update: {},
      create: {
        id: "cmj4oiyen0009a47otrw1dys4",
        bankName: "Wise",
        bankType: "PAYMENT_PROVIDER",
        swiftBic: "TRWIGB22",
        website: "https://wise.com",
        bankCountry: "United Kingdom",
        isActive: true,
      }
    });

    // Wise Accounts
    const wiseUsd = await prisma.bankAccount.upsert({
      where: { id: "cmj4oiyey000fa47o5rppwica" },
      update: {},
      create: {
        id: "cmj4oiyey000fa47o5rppwica",
        bankId: wise.id,
        accountName: "Wise USD Business",
        accountType: "MULTI_CURRENCY",
        currency: "USD",
        accountNumber: "987654321098",
        routingNumber: "026073008",
        wireRoutingNumber: "026073009", // Wired routing number
        swiftBic: "CMFGUS33",
        currentBalance: 35000,
        isActive: true,
        isPrimary: true,
      }
    });

    // --- 4. Transactions (Simulating History) ---
    console.log('Adding transactions...');

    const transactions = [
      // FY 2024 (Closed): Aug 2024 - Aug 2025
      // Income
      { desc: "Consulting Fee - Client A", amount: 5000, date: "2024-09-15" },
      { desc: "Software Dev Project - Milestone 1", amount: 12000, date: "2024-10-20" },
      { desc: "Maintenance Retainer", amount: 2000, date: "2024-11-01" },
      { desc: "Consulting Fee - Client B", amount: 7500, date: "2024-12-10" },
      { desc: "Software Dev Project - Milestone 2", amount: 12000, date: "2025-01-20" },
      { desc: "Q1 Bonus Payment", amount: 3000, date: "2025-03-15" },
      { desc: "Consulting Fee - Client A", amount: 5500, date: "2025-05-20" },
      { desc: "New Project Deposit", amount: 8000, date: "2025-07-05" },

      // Expenses
      { desc: "Server Hosting (AWS)", amount: -150, date: "2024-09-01" },
      { desc: "Software Licenses", amount: -450, date: "2024-09-05" },
      { desc: "Legal Fees", amount: -1200, date: "2024-10-15" },
      { desc: "Server Hosting (AWS)", amount: -150, date: "2024-10-01" },
      { desc: "Contractor Payout", amount: -3500, date: "2024-11-25" },
      { desc: "Office Supplies", amount: -300, date: "2024-12-05" },
      { desc: "Annual Co. House Fee", amount: -13, date: "2025-01-05" },
      { desc: "Server Hosting (AWS)", amount: -160, date: "2025-02-01" },
      { desc: "Marketing Campaign", amount: -2500, date: "2025-04-10" },
      { desc: "Travel Expenses", amount: -850, date: "2025-06-20" },

      // FY 2025 (Current): Aug 2025 - Present (Dec 2025)
      // Income
      { desc: "Retainer - Client C", amount: 4000, date: "2025-09-01" },
      { desc: "Web App Launch Payment", amount: 15000, date: "2025-09-25" },
      { desc: "Consulting Fee - Client A", amount: 6000, date: "2025-10-15" },
      { desc: "Emergency Support", amount: 1500, date: "2025-11-05" },
      { desc: "Holiday Promo Sales", amount: 4500, date: "2025-12-10" },

      // Expenses
      { desc: "Server Hosting (AWS)", amount: -180, date: "2025-09-01" },
      { desc: "Accounting Service", amount: -500, date: "2025-09-10" },
      { desc: "New Laptop Eqpt", amount: -2200, date: "2025-10-05" },
      { desc: "SaaS Subscriptions", amount: -250, date: "2025-11-01" },
      { desc: "Christmas Party", amount: -800, date: "2025-12-12" },
    ];

    for (const t of transactions) {
      // Distribute randomly across accounts primarily GBP and EUR for realism
      const accountId = Math.random() > 0.5 ? revGbp.id : revEur.id;

      // Basic hash generation: date_amount_desc
      const simpleHash = `${t.date}_${t.amount}_${t.desc.replace(/\s+/g, '')}_${Math.random().toString(36).substring(7)}`;

      await prisma.bankTransaction.create({
        data: {
          bankAccountId: accountId,
          amount: t.amount,
          currency: accountId === revGbp.id ? 'GBP' : 'EUR', // Simplified currency match
          date: new Date(t.date),
          description: t.desc,
          status: "COMPLETED",
          reference: `REF-${Math.floor(Math.random() * 10000)}`,
          category: t.amount > 0 ? "Income" : "Expense",
          hash: simpleHash, // Unique hash
        }
      });
    }

    // --- 5. Crypto Wallets ---
    await prisma.cryptoWallet.upsert({
      where: { id: "cmj4oiyf7000ia47oqj0ofpgp" },
      update: {},
      create: {
        id: "cmj4oiyf7000ia47oqj0ofpgp",
        walletName: "Corporate USDC - Polygon",
        walletType: "HOT_WALLET",
        blockchain: "POLYGON",
        network: "MAINNET",
        asset: "USDC",
        assetType: "ERC20",
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
        provider: "MetaMask",
        currentBalance: 50000,
        balanceUSD: 50000,
        isActive: true,
      }
    });

    // --- 6. Compliance (Tax Obligations) ---
    // Seed mocked obligations matching user screenshot requirement
    console.log('Adding tax obligations...');
    await prisma.taxObligation.deleteMany(); // Clear simulation data first

    await prisma.taxObligation.createMany({
      data: [
        {
          type: "CORPORATION_TAX",
          status: "PENDING",
          dueDate: new Date("2026-06-01"), // 01/06/2026
          periodStart: new Date("2024-09-01"),
          periodEnd: new Date("2025-08-31"),
          amountEstimated: 0,
          amountActual: null,
        },
        {
          type: "CONFIRMATION_STATEMENT",
          status: "PENDING",
          dueDate: new Date("2026-08-09"), // 09/08/2026
          periodStart: new Date("2025-08-08"),
          periodEnd: new Date("2026-08-07"),
          amountEstimated: 13, // Standard Companies House fee
          amountActual: null,
        },
        {
          type: "ACCOUNTS",
          status: "PENDING",
          dueDate: new Date("2027-05-31"), // 31/05/2027
          periodStart: new Date("2025-09-01"),
          periodEnd: new Date("2026-08-31"),
          amountEstimated: 0,
          amountActual: null,
        }
      ]
    });

    console.log('✅ Seeding finished.');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
