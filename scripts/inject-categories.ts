
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Injecting Hierarchical Categories into Database...');

    // Clear existing
    await prisma.transactionCategory.deleteMany({});

    const newCategories = [
        // 1. Loans
        { name: "Loans: In (Director)", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
        { name: "Loans: Out (Director)", color: "bg-amber-600/10 text-amber-500 border-amber-600/20" },

        // 2. Fees
        { name: "Fees: Bank Fees", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
        { name: "Fees: Amazon Fees", color: "bg-rose-600/10 text-rose-500 border-rose-600/20" },
        { name: "Fees: GBP Assets Service Fee", color: "bg-rose-400/10 text-rose-300 border-rose-400/20" },

        // 3. Intercompany
        { name: "Transfers: Intercompany", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },

        // 4. Sales
        { name: "Sales: Amazon Sales", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
        { name: "Sales: Consulting Income", color: "bg-emerald-600/10 text-emerald-500 border-emerald-600/20" },

        // 5. Marketing
        { name: "Marketing: Amazon Marketing", color: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20" },

        // 6. Operating Expenses
        { name: "Operating: Postage", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
        { name: "Operating: Hosting", color: "bg-slate-600/10 text-slate-500 border-slate-600/20" },
        { name: "Operating: Cloud Services", color: "bg-slate-400/10 text-slate-300 border-slate-400/20" },

        // 7. Other Income
        { name: "Income: Other / Cashback", color: "bg-teal-500/10 text-teal-400 border-teal-500/20" },

        // 8. FX
        { name: "FX: Exchange Gain", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
        { name: "FX: Exchange Loss", color: "bg-indigo-600/10 text-indigo-500 border-indigo-600/20" },

        // 9. Crypto
        { name: "Crypto: BTC Purchases", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
        { name: "Crypto: BTC Sales", color: "bg-orange-600/10 text-orange-500 border-orange-600/20" },
        { name: "Crypto: BTC Capital Gain", color: "bg-orange-400/10 text-orange-300 border-orange-400/20" },
        { name: "Crypto: BTC Capital Loss", color: "bg-orange-800/10 text-orange-600 border-orange-800/20" },

        // 10. System
        { name: "System: Uncategorized", color: "bg-slate-700/50 text-slate-400 border-slate-600/50" }
    ];

    for (const cat of newCategories) {
        await prisma.transactionCategory.create({
            data: cat
        });
    }

    console.log('✅ Database updated with new categories.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
