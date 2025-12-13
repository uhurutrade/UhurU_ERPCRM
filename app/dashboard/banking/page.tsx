import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { TransactionTable } from '@/components/banking/transaction-table';
import { Upload } from 'lucide-react';
import { ExchangeRatesWidget } from '@/components/banking/exchange-rates-widget';

export default async function BankingPage() {
    const transactions = await prisma.bankTransaction.findMany({
        orderBy: { date: 'desc' },
        take: 50,
        include: {
            bankAccount: {
                include: {
                    bank: {
                        select: {
                            bankName: true
                        }
                    }
                }
            }
        }
    });

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-uhuru-blue to-uhuru-purple">
                            Banking
                        </h1>
                        <p className="text-slate-400 text-lg">Manage your transactions and bank accounts.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/dashboard/banking/upload"
                            className="flex items-center gap-2 bg-uhuru-blue hover:bg-uhuru-blue-light text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-uhuru hover:shadow-uhuru-sm transform hover:scale-105"
                        >
                            <Upload size={20} />
                            Upload Statement
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Transactions */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Transactions Card */}
                        <div className="bg-gradient-card backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-700/50">
                                <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
                            </div>
                            <TransactionTable transactions={transactions} />
                        </div>
                    </div>

                    {/* Sidebar - Exchange Rates & Tools */}
                    <div className="space-y-8">
                        <ExchangeRatesWidget />
                    </div>
                </div>
            </div>
        </div>
    );
}
