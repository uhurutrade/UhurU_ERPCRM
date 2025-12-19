import Link from 'next/link';
import { Plus, FileText, ArrowUpRight, ArrowDownLeft, Upload, Check } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { InvoiceUploadButton } from '@/components/invoices/invoice-upload-button';

export default async function InvoicesPage() {
    const [invoices, unassignedAttachments] = await Promise.all([
        prisma.invoice.findMany({
            orderBy: { date: 'desc' },
            take: 5,
            include: { organization: true }
        }),
        prisma.attachment.findMany({
            where: { transactionId: null },
            orderBy: { uploadedAt: 'desc' },
            take: 10
        })
    ]);

    return (
        <div className="p-8 max-w-[1920px] mx-auto space-y-8">
            <header className="flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Invoice Management</h1>
                    <p className="text-uhuru-text-muted mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Financial Operations & Expense Matching</p>
                </div>
                <div className="flex gap-4">
                    <InvoiceUploadButton />

                    <Link
                        href="/dashboard/invoices/create"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        Generate Invoice
                    </Link>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-indigo-500/30 transition-all duration-300">
                    <div className="text-uhuru-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Total Receivables</div>
                    <div className="text-3xl font-bold text-white tracking-tight">£42,500.00</div>
                    <div className="mt-4 flex items-center text-[10px] text-emerald-400 font-bold bg-emerald-500/10 w-fit px-2 py-1 rounded-full uppercase tracking-tighter">
                        <ArrowUpRight size={10} className="mr-1" />
                        <span>+12% from last month</span>
                    </div>
                </div>
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-red-500/30 transition-all duration-300">
                    <div className="text-uhuru-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Overdue Invoices</div>
                    <div className="text-3xl font-bold text-white tracking-tight">£1,200.00</div>
                    <div className="mt-4 flex items-center text-[10px] text-red-400 font-bold bg-red-500/10 w-fit px-2 py-1 rounded-full uppercase tracking-tighter">
                        <span>2 invoices overdue</span>
                    </div>
                </div>
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-slate-500/30 transition-all duration-300">
                    <div className="text-uhuru-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Unmatched Expenses</div>
                    <div className="text-3xl font-bold text-white tracking-tight">{unassignedAttachments.length}</div>
                    <div className="mt-4 flex items-center text-[10px] text-amber-400 font-bold bg-amber-500/10 w-fit px-2 py-1 rounded-full uppercase tracking-tighter">
                        <span>Awaiting verification</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Invoices Table */}
                <div className="xl:col-span-2 bg-uhuru-card rounded-2xl border border-uhuru-border shadow-card overflow-hidden">
                    <div className="p-6 border-b border-uhuru-border flex justify-between items-center bg-slate-900/40">
                        <h2 className="text-lg font-bold text-white tracking-tight">Recent Outgoing Invoices</h2>
                        <Link href="/dashboard/invoices/ledger" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">View History</Link>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest border-b border-uhuru-border bg-slate-900/20">
                                <th className="px-6 py-4">Number</th>
                                <th className="px-6 py-4 hidden md:table-cell">Client</th>
                                <th className="px-6 py-4 hidden md:table-cell">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-uhuru-border">
                            {invoices.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-uhuru-text-dim italic">No invoices found.</td></tr>
                            ) : (
                                invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors group cursor-default">
                                        <td className="px-6 py-4 font-bold text-white text-sm">{inv.number}</td>
                                        <td className="px-6 py-4 text-slate-300 text-sm hidden md:table-cell">{inv.organization.name}</td>
                                        <td className="px-6 py-4 text-uhuru-text-dim text-xs hidden md:table-cell">{inv.date.toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-bold text-white text-sm">£{Number(inv.total).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                inv.status === 'OVERDUE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    'bg-slate-800 text-slate-400 border border-white/5'
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

                {/* Unassigned Expenses */}
                <div className="bg-uhuru-card rounded-2xl border border-uhuru-border shadow-card overflow-hidden">
                    <div className="p-6 border-b border-uhuru-border bg-slate-900/40">
                        <h2 className="text-lg font-bold text-white tracking-tight">Awaiting Matching</h2>
                        <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-widest mt-1">Pending Ledger Assignment</p>
                    </div>
                    <div className="p-4 space-y-3">
                        {unassignedAttachments.length === 0 ? (
                            <div className="py-12 text-center">
                                <Check className="mx-auto text-emerald-400 mb-2" size={24} />
                                <p className="text-uhuru-text-dim text-xs italic">All documents matched</p>
                            </div>
                        ) : (
                            unassignedAttachments.map((att) => (
                                <div key={att.id} className="p-4 bg-slate-900/30 border border-white/5 rounded-xl hover:border-white/10 transition-all flex justify-between items-center group">
                                    <div className="overflow-hidden">
                                        <p className="text-white text-sm font-medium truncate">{att.originalName}</p>
                                        <p className="text-[10px] text-uhuru-text-dim mt-0.5">{new Date(att.uploadedAt).toLocaleString()}</p>
                                        {(att as any).extractedData && (
                                            <p className="text-[10px] text-indigo-400 font-bold mt-1 uppercase">
                                                {((att as any).extractedData as any).issuer} • {((att as any).extractedData as any).currency} {((att as any).extractedData as any).amount}
                                            </p>
                                        )}
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
