import Link from 'next/link';
// CORRECCIÓN FINAL: Se vuelve a añadir las llaves {} según el error del compilador, ya que es una exportación nombrada.
import { navItems } from '../../../lib/nav';
import { Plus, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export default async function ERPPage() {
    // Nota: El tipo 'invoice' y 'organization' deben estar definidos en tu schema.prisma
    const invoices = await prisma.invoice.findMany({
        orderBy: { date: 'desc' },
        take: 5,
        include: { organization: true }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ERP</h1>
                    <p className="text-slate-500 dark:text-slate-400">Financial overview and invoicing.</p>
                </div>
                <div>
                    <Link
                        href="/dashboard/erp/invoices/create"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                        <Plus size={18} />
                        New Invoice
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Total Receivables</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">£42,500.00</div>
                    <div className="text-xs text-emerald-500 flex items-center mt-1"><ArrowUpRight size={12} className="mr-1" /> +12% from last month</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Overdue Invoices</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">£1,200.00</div>
                    <div className="text-xs text-red-500 flex items-center mt-1">2 invoices overdue</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Drafts</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">3</div>
                    <div className="text-xs text-slate-500 mt-1">In progress</div>
                </div>
            </div>

            {/* Recent Invoices Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Invoices</h2>
                    <Link href="/dashboard/erp/invoices" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">View all</Link>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                            <th className="px-6 py-4">Number</th>
                            <th className="px-6 py-4 hidden md:table-cell">Client</th>
                            <th className="px-6 py-4 hidden md:table-cell">Date</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {invoices.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No invoices found.</td></tr>
                        ) : (
                            invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{inv.number}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 hidden md:table-cell">{inv.organization.name}</td>
                                    <td className="px-6 py-4 text-slate-500 text-sm hidden md:table-cell">{inv.date.toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">£{Number(inv.total).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                            inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
