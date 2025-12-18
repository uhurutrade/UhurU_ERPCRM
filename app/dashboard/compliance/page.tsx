import { prisma } from '@/lib/prisma';
import { DeadlineCard } from '@/components/compliance/deadline-card';
import { calculateVATDeadline, calculateCorpTaxPaymentDeadline, calculateAccountsDeadline, calculateConfirmationStatementDeadline, ObligationType } from '@/lib/compliance/uk-tax';
import Link from 'next/link';

export default async function CompliancePage() {
    // Fetch current fiscal year and obligations
    // For MVP, if no obligations exist, we might want to generate some hypothetical ones based on current date
    // or show a "Setup Fiscal Year" state.

    // Let's simulation fetching from DB
    const obligations = await prisma.taxObligation.findMany({
        where: {
            status: 'PENDING'
        },
        orderBy: {
            dueDate: 'asc'
        }
    });

    // If we have no data, let's show some examples based on "Today" as a reference for the user to see how it looks
    const mockData = obligations.length > 0 ? obligations : [
        {
            id: '1',
            title: 'Q1 VAT Return',
            dueDate: calculateVATDeadline(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 0)), // Last month end
            status: 'PENDING',
            amount: 1250.00,
            type: ObligationType.VAT
        },
        {
            id: '2',
            title: 'Confirmation Statement',
            dueDate: calculateConfirmationStatementDeadline(new Date(new Date().getFullYear(), 0, 1)), // Jan 1st
            status: 'PENDING',
            amount: 13.00,
            type: ObligationType.CONFIRMATION_STATEMENT
        },
        {
            id: '3',
            title: 'Annual Accounts Filing',
            dueDate: calculateAccountsDeadline(new Date(new Date().getFullYear() - 1, 11, 31)), // Last year end
            status: 'PENDING',
            amount: null,
            type: ObligationType.ACCOUNTS
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Fiscal Compliance (UK)</h1>
                <p className="text-slate-500 dark:text-slate-400">Track your HMRC and Companies House obligations.</p>
            </div>

            {/* AI Tax Assistant Promo */}
            <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-500/20 p-6 md:p-8">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/20 blur-3xl rounded-full" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">New</span>
                            <h2 className="text-xl font-bold text-white">AI Tax Assistant (RAG)</h2>
                        </div>
                        <p className="text-slate-300 max-w-xl">
                            Train the assistant with your previous tax declarations. It will analyze your ERP data against your historical filings to automate your returns.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/compliance/tax-assistant"
                        className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium shadow-lg shadow-emerald-500/25 transition-all active:scale-95 whitespace-nowrap"
                    >
                        Open Assistant
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockData.map((item: any) => (
                    <DeadlineCard
                        key={item.id}
                        title={item.title}
                        dueDate={new Date(item.dueDate)}
                        status={item.status}
                        amount={item.amount ? Number(item.amount) : null}
                        type={item.type}
                    />
                ))}
            </div>

            {obligations.length === 0 && (
                <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900 rounded-lg text-indigo-700 dark:text-indigo-300 text-sm">
                    <strong>Note:</strong> Showing demo data. Configure your Fiscal Year in settings to generate real deadlines.
                </div>
            )}
        </div>
    );
}
