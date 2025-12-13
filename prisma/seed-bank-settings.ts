/**
 * Seed script para insertar datos de ejemplo de bancos y wallets crypto
 * Incluye: Revolut y Wise con cuentas dummy en múltiples divisas
 * 
 * Para ejecutar:
 * npx tsx prisma/seed-bank-settings.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding bank settings with example data...\n');

    // ========================================
    // REVOLUT
    // ========================================
    console.log('📱 Creating Revolut...');
    const revolut = await prisma.bank.create({
        data: {
            bankName: 'Revolut',
            bankType: 'NEOBANK',
            swiftBic: 'REVOGB21',
            website: 'https://www.revolut.com',
            supportEmail: 'support@revolut.com',
            supportPhone: '+44 20 3322 8352',
            bankAddress: '7 Westferry Circus',
            bankCity: 'London',
            bankPostcode: 'E14 4HD',
            bankCountry: 'United Kingdom',
            notes: 'Multi-currency neobank with instant transfers and crypto support',
        },
    });

    console.log('  ✅ Revolut created');

    // Revolut EUR Account (SEPA)
    console.log('  💶 Creating Revolut EUR account...');
    await prisma.bankAccount.create({
        data: {
            bankId: revolut.id,
            accountName: 'Revolut EUR Business',
            accountType: 'BUSINESS',
            currency: 'EUR',
            iban: 'GB33REVO00996912345678',
            swiftBic: 'REVOGB21',
            currentBalance: 25000.00,
            availableBalance: 25000.00,
            isPrimary: true,
            isActive: true,
            notes: 'Main EUR account for SEPA transfers',
        },
    });

    // Revolut GBP Account (UK)
    console.log('  💷 Creating Revolut GBP account...');
    await prisma.bankAccount.create({
        data: {
            bankId: revolut.id,
            accountName: 'Revolut GBP Business',
            accountType: 'BUSINESS',
            currency: 'GBP',
            sortCode: '040004',
            accountNumberUK: '12345678',
            iban: 'GB29REVO00996987654321',
            swiftBic: 'REVOGB21',
            currentBalance: 15000.00,
            availableBalance: 15000.00,
            isPrimary: true,
            isActive: true,
            notes: 'Main GBP account for UK payments',
        },
    });

    // Revolut USD Account (USA)
    console.log('  💵 Creating Revolut USD account...');
    await prisma.bankAccount.create({
        data: {
            bankId: revolut.id,
            accountName: 'Revolut USD Business',
            accountType: 'BUSINESS',
            currency: 'USD',
            accountNumber: '123456789012',
            routingNumber: '026073150',
            swiftBic: 'REVOGB21',
            currentBalance: 50000.00,
            availableBalance: 50000.00,
            isPrimary: true,
            isActive: true,
            notes: 'USD account for US payments and international transfers',
        },
    });

    // Revolut CHF Account (Switzerland)
    console.log('  🇨🇭 Creating Revolut CHF account...');
    await prisma.bankAccount.create({
        data: {
            bankId: revolut.id,
            accountName: 'Revolut CHF Business',
            accountType: 'BUSINESS',
            currency: 'CHF',
            ibanCH: 'CH9300762011623852957',
            swiftBic: 'REVOGB21',
            currentBalance: 10000.00,
            availableBalance: 10000.00,
            isPrimary: true,
            isActive: true,
            notes: 'Swiss Franc account for Switzerland payments',
        },
    });

    console.log('  ✅ Revolut accounts created\n');

    // ========================================
    // WISE (formerly TransferWise)
    // ========================================
    console.log('🌍 Creating Wise...');
    const wise = await prisma.bank.create({
        data: {
            bankName: 'Wise',
            bankType: 'PAYMENT_PROVIDER',
            swiftBic: 'TRWIGB22',
            website: 'https://wise.com',
            supportEmail: 'support@wise.com',
            supportPhone: '+44 20 3695 8888',
            bankAddress: '56 Shoreditch High Street',
            bankCity: 'London',
            bankPostcode: 'E1 6JJ',
            bankCountry: 'United Kingdom',
            notes: 'International money transfer service with multi-currency accounts',
        },
    });

    console.log('  ✅ Wise created');

    // Wise EUR Account (SEPA)
    console.log('  💶 Creating Wise EUR account...');
    await prisma.bankAccount.create({
        data: {
            bankId: wise.id,
            accountName: 'Wise EUR Business',
            accountType: 'MULTI_CURRENCY',
            currency: 'EUR',
            iban: 'BE68539007547034',
            swiftBic: 'TRWIBEB1XXX',
            currentBalance: 18500.00,
            availableBalance: 18500.00,
            isPrimary: true,
            isActive: true,
            notes: 'EUR account for European SEPA transfers',
        },
    });

    // Wise GBP Account (UK)
    console.log('  💷 Creating Wise GBP account...');
    await prisma.bankAccount.create({
        data: {
            bankId: wise.id,
            accountName: 'Wise GBP Business',
            accountType: 'MULTI_CURRENCY',
            currency: 'GBP',
            sortCode: '231470',
            accountNumberUK: '87654321',
            iban: 'GB33BUKB20201555555555',
            swiftBic: 'TRWIGB22',
            currentBalance: 22000.00,
            availableBalance: 22000.00,
            isPrimary: true,
            isActive: true,
            notes: 'GBP account for UK domestic transfers',
        },
    });

    // Wise USD Account (USA)
    console.log('  💵 Creating Wise USD account...');
    await prisma.bankAccount.create({
        data: {
            bankId: wise.id,
            accountName: 'Wise USD Business',
            accountType: 'MULTI_CURRENCY',
            currency: 'USD',
            accountNumber: '987654321098',
            routingNumber: '026073008',
            swiftBic: 'CMFGUS33',
            currentBalance: 35000.00,
            availableBalance: 35000.00,
            isPrimary: true,
            isActive: true,
            notes: 'USD account for US ACH and wire transfers',
        },
    });

    // Wise CHF Account (Switzerland)
    console.log('  🇨🇭 Creating Wise CHF account...');
    await prisma.bankAccount.create({
        data: {
            bankId: wise.id,
            accountName: 'Wise CHF Business',
            accountType: 'MULTI_CURRENCY',
            currency: 'CHF',
            ibanCH: 'CH5604835012345678009',
            swiftBic: 'TRWICHZZXXX',
            currentBalance: 8500.00,
            availableBalance: 8500.00,
            isPrimary: true,
            isActive: true,
            notes: 'Swiss Franc account for Swiss payments',
        },
    });

    console.log('  ✅ Wise accounts created\n');

    // ========================================
    // CRYPTO WALLETS
    // ========================================
    console.log('🔐 Creating crypto wallets...\n');

    // USDC on Polygon
    console.log('  💎 Creating USDC Polygon wallet...');
    await prisma.cryptoWallet.create({
        data: {
            walletName: 'Corporate USDC - Polygon',
            walletType: 'HOT_WALLET',
            blockchain: 'POLYGON',
            network: 'MAINNET',
            asset: 'USDC',
            assetType: 'ERC20',
            contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
            provider: 'MetaMask',
            currentBalance: 50000.00000000,
            balanceUSD: 50000.00,
            isMultiSig: false,
            isActive: true,
            notes: 'Main USDC wallet on Polygon for low-fee stablecoin transactions',
        },
    });

    // USDC on Ethereum
    console.log('  💎 Creating USDC Ethereum wallet...');
    await prisma.cryptoWallet.create({
        data: {
            walletName: 'Corporate USDC - Ethereum',
            walletType: 'HOT_WALLET',
            blockchain: 'ETHEREUM',
            network: 'MAINNET',
            asset: 'USDC',
            assetType: 'ERC20',
            contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            walletAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
            provider: 'MetaMask',
            currentBalance: 25000.00000000,
            balanceUSD: 25000.00,
            isMultiSig: false,
            isActive: true,
            notes: 'USDC on Ethereum mainnet for DeFi and large transactions',
        },
    });

    // Bitcoin Native
    console.log('  ₿ Creating Bitcoin wallet...');
    await prisma.cryptoWallet.create({
        data: {
            walletName: 'Corporate BTC Treasury',
            walletType: 'COLD_WALLET',
            blockchain: 'BITCOIN',
            network: 'MAINNET',
            asset: 'BTC',
            assetType: 'NATIVE',
            walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            provider: 'Ledger',
            currentBalance: 0.50000000,
            balanceUSD: 21500.00,
            isMultiSig: true,
            requiredSignatures: 2,
            isActive: true,
            notes: 'Cold storage for BTC treasury - requires 2 of 3 signatures',
        },
    });

    // Ethereum Native
    console.log('  ⟠ Creating Ethereum wallet...');
    await prisma.cryptoWallet.create({
        data: {
            walletName: 'Corporate ETH Wallet',
            walletType: 'HOT_WALLET',
            blockchain: 'ETHEREUM',
            network: 'MAINNET',
            asset: 'ETH',
            assetType: 'NATIVE',
            walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            provider: 'MetaMask',
            currentBalance: 5.25000000,
            balanceUSD: 11812.50,
            isMultiSig: false,
            isActive: true,
            notes: 'Main ETH wallet for gas fees and ETH holdings',
        },
    });

    // USDT on Polygon
    console.log('  💵 Creating USDT Polygon wallet...');
    await prisma.cryptoWallet.create({
        data: {
            walletName: 'Corporate USDT - Polygon',
            walletType: 'HOT_WALLET',
            blockchain: 'POLYGON',
            network: 'MAINNET',
            asset: 'USDT',
            assetType: 'ERC20',
            contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            walletAddress: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            provider: 'MetaMask',
            currentBalance: 15000.00000000,
            balanceUSD: 15000.00,
            isMultiSig: false,
            isActive: true,
            notes: 'USDT on Polygon for alternative stablecoin option',
        },
    });

    console.log('  ✅ Crypto wallets created\n');

    // ========================================
    // SUMMARY
    // ========================================
    console.log('📊 Summary:');
    console.log('  ✅ 2 Banks created (Revolut, Wise)');
    console.log('  ✅ 8 Bank accounts created (4 per bank: EUR, GBP, USD, CHF)');
    console.log('  ✅ 5 Crypto wallets created (USDC, BTC, ETH, USDT)');
    console.log('\n💰 Total Balances:');
    console.log('  Traditional Banking:');
    console.log('    EUR: €43,500.00');
    console.log('    GBP: £37,000.00');
    console.log('    USD: $85,000.00');
    console.log('    CHF: ₣18,500.00');
    console.log('  Crypto:');
    console.log('    USDC: $75,000.00');
    console.log('    BTC: $21,500.00');
    console.log('    ETH: $11,812.50');
    console.log('    USDT: $15,000.00');
    console.log('\n🎯 Access at: http://localhost:3000/dashboard/bank-settings');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding bank settings:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
