import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { TransactionTable } from '@/components/banking/transaction-table';
import { Upload, History as HistoryIcon } from 'lucide-react';
import { ExchangeRatesWidget } from '@/components/banking/exchange-rates-widget';
import { serializeData } from '@/lib/serialization';
import { getTransactionCategories } from '@/app/actions/categories';
import { getTransactionSequences } from '@/lib/banking/sequences';
import { InvoiceUploadButton } from '@/components/invoices/invoice-upload-button';

export default async function BankingPage({
    searchParams
}: {
    searchParams: { page?: string, query?: string, accountId?: string }
}) {
    const currentPage = Number(searchParams.page) || 1;
    const query = searchParams.query || "";
    const accountId = searchParams.accountId;
    const itemsPerPage = 20;

    // --- Build Where Clause ---
    const whereClause: any = {
        AND: [
            accountId ? { bankAccountId: accountId } : {},
            query ? {
                OR: [
                    { description: { contains: query, mode: 'insensitive' } },
                    { category: { contains: query, mode: 'insensitive' } },
                    { reference: { contains: query, mode: 'insensitive' } },
                    { counterparty: { contains: query, mode: 'insensitive' } },
                    { merchant: { contains: query, mode: 'insensitive' } },
                    { bankAccount: { bank: { bankName: { contains: query, mode: 'insensitive' } } } }
                ]
            } : {}
        ]
    };

    // --- Execute Query ---
    const [totalItems, transactions, categoriesRes] = await Promise.all([
        prisma.bankTransaction.count({ where: whereClause }),
        prisma.bankTransaction.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
            take: itemsPerPage,
            skip: (currentPage - 1) * itemsPerPage,
            include: {
                attachments: true,
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
        }),
        getTransactionCategories()
    ]);

    const sequences = await getTransactionSequences(transactions);
    const categories = categoriesRes.success ? categoriesRes.categories : [];

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-uhuru-blue to-uhuru-purple">
                            General Ledger
                        </h1>
                        <p className="text-slate-400 text-lg">Manage your transactions and bank accounts.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/dashboard/banking/audit-log"
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all border border-slate-700"
                            title="View Deleted Transactions Audit Log"
                        >
                            <HistoryIcon size={20} />
                            Audit Log
                        </Link>
                        <InvoiceUploadButton />
                        <Link
                            href="/dashboard/banking/upload"
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all border border-slate-700 shadow-lg"
                        >
                            <Upload size={20} />
                            Upload Statement
                        </Link>
                    </div>
                </div>

                <ExchangeRatesWidget />

                {/* Transactions Card */}
                <div className="bg-gradient-card backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl min-h-[1200px]">
                    <div className="p-6 border-b border-slate-700/50">
                        <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
                    </div>
                    <TransactionTable
                        transactions={serializeData(transactions)}
                        sequences={sequences}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        totalItems={totalItems}
                        categories={categories}
                    />
                </div>
            </div>
        </div>
    );
}
