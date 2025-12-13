import { prisma } from '@/lib/prisma';
import { DeadlineCard } from '@/components/compliance/deadline-card';
import { calculateVATDeadline, calculateCorpTaxPaymentDeadline, calculateAccountsDeadline, calculateConfirmationStatementDeadline, ObligationType } from '@/lib/compliance/uk-tax';

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
