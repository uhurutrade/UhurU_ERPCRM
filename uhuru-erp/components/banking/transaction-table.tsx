'use client';

import { format } from 'date-fns';

type Transaction = {
    id: string;
    date: Date;
    description: string;
    amount: number; // Decimal in Prisma is usually string or number in JS depending on config, but let's assume number for display
    currency: string;
    category: string | null;
    bankAccount: {
        bankName: string;
    };
};

export function TransactionTable({ transactions }: { transactions: any[] }) {
    // Prisma decimals come as strings frequently in client components if not serialized
    // We'll handle basic display

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                        <th className="py-3 px-4 font-medium">Date</th>
                        <th className="py-3 px-4 font-medium">Description</th>
                        <th className="py-3 px-4 font-medium">Account</th>
                        <th className="py-3 px-4 font-medium text-right">Amount</th>
                        <th className="py-3 px-4 font-medium">Category</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {transactions.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500">
                                No transactions found.
                            </td>
                        </tr>
                    ) : (
                        transactions.map((tx) => (
                            <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                    {format(new Date(tx.date), 'MMM d, yyyy')}
                                </td>
                                <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">
                                    {tx.description}
                                </td>
                                <td className="py-3 px-4 text-slate-500">
                                    <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">
                                        {tx.bankAccount.bankName}
                                    </span>
                                </td>
                                <td className={`py-3 px-4 text-right font-medium ${Number(tx.amount) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                                    }`}>
                                    {new Intl.NumberFormat('en-GB', { style: 'currency', currency: tx.currency }).format(Number(tx.amount))}
                                </td>
                                <td className="py-3 px-4 text-slate-500">
                                    {tx.category || '-'}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
