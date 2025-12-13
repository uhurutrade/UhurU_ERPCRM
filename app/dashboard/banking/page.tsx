import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { TransactionTable } from '@/components/banking/transaction-table';
import { Plus } from 'lucide-react';

export default async function BankingPage() {
    const transactions = await prisma.bankTransaction.findMany({
        orderBy: { date: 'desc' },
        take: 50,
        include: {
            bankAccount: {
                select: { bankName: true }
            }
        }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Banking</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your transactions and bank accounts.</p>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/dashboard/banking/upload"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <Plus size={18} />
                        Upload Statement
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Transactions</h2>
                </div>
                <TransactionTable transactions={transactions} />
            </div>
        </div>
    );
}
