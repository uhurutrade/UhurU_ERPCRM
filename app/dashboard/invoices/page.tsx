import Link from 'next/link';
import { Plus, FileText, ArrowUpRight, ArrowDownLeft, Upload, Check, AlertCircle, Link as LinkIcon, Trash2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { InvoiceUploadButton } from '@/components/invoices/invoice-upload-button';
import { DeleteAttachmentButton, LinkAttachmentButton } from '@/components/invoices/invoice-actions';

export default async function InvoicesPage() {
    const [invoices, allRecentAttachments, unassignedAttachments] = await Promise.all([
        prisma.invoice.findMany({
            orderBy: { date: 'desc' },
            take: 5,
            include: { organization: true }
        }),
        prisma.attachment.findMany({
            orderBy: { uploadedAt: 'desc' },
            take: 10,
            include: {
                transaction: {
                    select: {
                        description: true,
                        amount: true,
                        currency: true
                    }
                }
            }
        }),
        prisma.attachment.findMany({
            where: { transactionId: null },
            orderBy: { uploadedAt: 'desc' },
            take: 10
        })
    ]);

    return (
        <div className="p-8 max-w-[1920px] mx-auto space-y-8 animate-in fade-in duration-500">
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
                    <div className="text-uhuru-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Outgoing Invoices</div>
                    <div className="text-3xl font-bold text-white tracking-tight">{invoices.length}</div>
                    <div className="mt-4 flex items-center text-[11px] text-emerald-400 font-bold bg-emerald-500/10 w-fit px-3 py-1 rounded-full uppercase tracking-tight">
                        <span>Total Records</span>
                    </div>
                </div>
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-blue-500/30 transition-all duration-300">
                    <div className="text-uhuru-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Processed Documents</div>
                    <div className="text-3xl font-bold text-white tracking-tight">{allRecentAttachments.length}</div>
                    <div className="mt-4 flex items-center text-[11px] text-blue-400 font-bold bg-blue-500/10 w-fit px-3 py-1 rounded-full uppercase tracking-tight">
                        <span>Matched & Unmatched</span>
                    </div>
                </div>
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-amber-500/30 transition-all duration-300">
                    <div className="text-uhuru-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Awaiting Matching</div>
                    <div className="text-3xl font-bold text-white tracking-tight text-amber-500">{unassignedAttachments.length}</div>
                    <div className="mt-4 flex items-center text-[11px] text-amber-400 font-bold bg-amber-500/10 w-fit px-3 py-1 rounded-full uppercase tracking-tight">
                        <span>Verification needed</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Document Feed (Matched & Unmatched) */}
                <div className="xl:col-span-2 bg-uhuru-card rounded-2xl border border-uhuru-border shadow-card overflow-hidden">
                    <div className="p-6 border-b border-uhuru-border flex justify-between items-center bg-slate-900/40">
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">Recent Document Activity</h2>
                            <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-widest mt-1">Audit trail for all incoming/outgoing documents</p>
                        </div>
                        <Link href="/dashboard/banking" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">General Ledger</Link>
                    </div>
                    <div className="divide-y divide-uhuru-border">
                        {allRecentAttachments.length === 0 ? (
                            <div className="px-6 py-12 text-center text-uhuru-text-dim italic">No document activity detected.</div>
                        ) : (
                            allRecentAttachments.map((att) => (
                                <div key={att.id} className="p-4 hover:bg-slate-800/40 transition-all flex items-center gap-4 group">
                                    <div className={`p-3 rounded-xl border ${att.transactionId ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-white truncate">{att.originalName}</p>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight ${att.transactionId ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                {att.transactionId ? 'MATCHED' : 'UNASSIGNED'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            {/* Nature Indicator */}
                                            <div className="flex items-center gap-1">
                                                {(att as any).extractedData?.documentRole === 'EMITTED' ? (
                                                    <>
                                                        <ArrowUpRight size={11} className="text-uhuru-blue" />
                                                        <span className="text-[10px] font-black text-uhuru-blue tracking-wider uppercase">Sales</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowDownLeft size={11} className="text-rose-500" />
                                                        <span className="text-[10px] font-black text-rose-500 tracking-wider uppercase">Expense</span>
                                                    </>
                                                )}
                                            </div>

                                            <div className="w-1 h-1 rounded-full bg-slate-700" />

                                            {/* Payment Status */}
                                            {att.transactionId ? (
                                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">PAID</span>
                                            ) : (
                                                (att as any).extractedData?.documentRole === 'RECEIVED' ? (
                                                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">A PAGAR / WAITING</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-uhuru-blue uppercase tracking-widest px-2 py-0.5 bg-uhuru-blue/10 rounded border border-uhuru-blue/20">AWAITING COLLECTION</span>
                                                )
                                            )}

                                            <div className="w-1 h-1 rounded-full bg-slate-700" />

                                            <p className="text-[9px] text-uhuru-text-dim uppercase font-bold tracking-widest">
                                                {new Date(att.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {att.transaction && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-1.5 h-[2px] bg-slate-700" />
                                                <p className="text-[10px] text-indigo-400 font-bold uppercase truncate max-w-[200px]">
                                                    Match: {att.transaction.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0 flex items-start gap-2">
                                        <div className="flex flex-col items-end">
                                            {(att as any).extractedData?.amount ? (
                                                <p className="text-sm font-mono font-bold text-white">
                                                    {(att as any).extractedData.currency || ''} {typeof (att as any).extractedData.amount === 'number' ? (att as any).extractedData.amount.toLocaleString() : (att as any).extractedData.amount || '0.00'}
                                                </p>
                                            ) : (
                                                <p className="text-[10px] text-uhuru-text-dim italic">No data</p>
                                            )}
                                            <Link
                                                href={att.path.startsWith('/uploads/') ? `/api/uploads/${att.path.replace('/uploads/', '')}` : att.path}
                                                target="_blank"
                                                className="text-[10px] font-bold text-indigo-400 hover:underline uppercase tracking-widest block mt-1"
                                            >
                                                View File
                                            </Link>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <LinkAttachmentButton id={att.id} hasTransaction={!!att.transactionId} />
                                            <DeleteAttachmentButton id={att.id} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Awaiting Matching (Sidebar focused on pending actions) */}
                <div className="bg-uhuru-card rounded-2xl border border-uhuru-border shadow-card overflow-hidden">
                    <div className="p-6 border-b border-uhuru-border bg-slate-900/40">
                        <h2 className="text-lg font-bold text-white tracking-tight">Attention Required</h2>
                        <p className="text-[10px] text-amber-500 uppercase font-bold tracking-widest mt-1">Found documents without ledger records</p>
                    </div>
                    <div className="p-4 space-y-3">
                        {unassignedAttachments.length === 0 ? (
                            <div className="py-12 text-center">
                                <Check className="mx-auto text-emerald-400 mb-2" size={24} />
                                <p className="text-uhuru-text-dim text-xs italic">All documents reconciled</p>
                            </div>
                        ) : (
                            unassignedAttachments.map((att) => (
                                <div key={att.id} className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl hover:bg-amber-500/10 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="overflow-hidden">
                                            <p className="text-white text-xs font-bold truncate">{att.originalName}</p>
                                            <p className="text-[9px] text-uhuru-text-dim mt-0.5">{new Date(att.uploadedAt).toLocaleString()}</p>
                                        </div>
                                        <Link
                                            href="/dashboard/banking"
                                            className="p-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 text-white rounded-lg transition-all"
                                            title="Assign to Ledger"
                                        >
                                            <Upload size={14} />
                                        </Link>
                                    </div>
                                    {(att as any).extractedData && (
                                        <div className="mt-3 p-2 bg-slate-950/50 rounded-lg border border-white/5">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-uhuru-text-dim font-bold uppercase tracking-widest">Extraction</span>
                                                <span className="text-indigo-400 font-bold">{((att as any).extractedData.confidence || 0) * 100}% Confidence</span>
                                            </div>
                                            <p className="text-xs text-slate-300 font-medium mt-1 truncate">
                                                {(att as any).extractedData.issuer || 'Unknown Issuer'}
                                            </p>
                                            <p className="text-xs font-bold text-white mt-1">
                                                {(att as any).extractedData.currency || ''} {typeof (att as any).extractedData.amount === 'number' ? (att as any).extractedData.amount.toLocaleString() : (att as any).extractedData.amount || '0.00'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Outgoing Invoices Section */}
            <div className="bg-uhuru-card rounded-2xl border border-uhuru-border shadow-card overflow-hidden">
                <div className="p-6 border-b border-uhuru-border flex justify-between items-center bg-slate-900/40">
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Outgoing Invoices Record</h2>
                        <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-widest mt-1">Legally binding invoices issued by your company</p>
                    </div>
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
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-uhuru-text-dim italic">No issued invoices found.</td></tr>
                        ) : (
                            invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors group cursor-default text-sm">
                                    <td className="px-6 py-4 font-bold text-white">{inv.number}</td>
                                    <td className="px-6 py-4 text-slate-300 hidden md:table-cell">{inv.organization.name}</td>
                                    <td className="px-6 py-4 text-uhuru-text-dim text-xs hidden md:table-cell">{inv.date.toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-bold text-white">{inv.currency} {Number(inv.total).toFixed(2)}</td>
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
        </div >
    );
}
