import Link from 'next/link';
import { Plus, FileText, ArrowUpRight, ArrowDownLeft, Upload, Check, AlertCircle, Link as LinkIcon, Trash2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { InvoiceUploadButton } from '@/components/invoices/invoice-upload-button';
import { DeleteAttachmentButton, LinkAttachmentButton } from '@/components/invoices/invoice-actions';
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge';

import { StandardPagination } from '@/components/invoices/invoices-pagination';

export default async function InvoicesPage({
    searchParams
}: {
    searchParams: { page?: string, docPage?: string, showTrash?: string }
}) {
    const currentPage = Number(searchParams.page) || 1;
    const docPage = Number(searchParams.docPage) || 1;
    const showTrash = searchParams.showTrash === 'true';
    const invoicesPerPage = 5;
    const docItemsPerPage = 20;

    const [totalInvoices, invoices, totalAttachments, allRecentAttachments, unassignedAttachments] = await Promise.all([
        prisma.invoice.count({ where: { deletedAt: showTrash ? { not: null } : null } }),
        prisma.invoice.findMany({
            where: {
                deletedAt: showTrash ? { not: null } : null
            },
            orderBy: { date: 'desc' },
            take: invoicesPerPage,
            skip: (currentPage - 1) * invoicesPerPage,
            include: { organization: true }
        }),
        prisma.attachment.count(),
        prisma.attachment.findMany({
            orderBy: { uploadedAt: 'desc' },
            take: docItemsPerPage,
            skip: (docPage - 1) * docItemsPerPage,
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
            take: 20
        })
    ]);

    const totalPages = Math.ceil(totalInvoices / invoicesPerPage);
    const totalDocPages = Math.ceil(totalAttachments / docItemsPerPage);

    return (
        <div className="p-0 sm:p-8 max-w-[1920px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 shrink-0">
                <div className="text-center lg:text-left">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Invoice Management</h1>
                    <p className="text-uhuru-text-muted mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Financial Operations & Expense Matching</p>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-end gap-3 lg:gap-4">
                    <InvoiceUploadButton />

                    <Link
                        href="/dashboard/invoices/create"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold text-[10px] lg:text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        Generate Invoice
                    </Link>
                </div>
            </header>

            {/* Stats Cards (Keep existing ones) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-indigo-500/30 transition-all duration-300">
                    <div className="text-uhuru-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Outgoing Invoices {showTrash && '(Trash)'}</div>
                    <div className="text-3xl font-bold text-white tracking-tight">{totalInvoices}</div>
                    <div className="mt-4 flex items-center text-[11px] text-emerald-400 font-bold bg-emerald-500/10 w-fit px-3 py-1 rounded-full uppercase tracking-tight">
                        <span>Total Records</span>
                    </div>
                </div>
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-blue-500/30 transition-all duration-300">
                    <div className="text-uhuru-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Processed Documents</div>
                    <div className="text-3xl font-bold text-white tracking-tight">{totalAttachments}</div>
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
                {/* Recent Document Feed (Matched & Unmatched) - Existing logic ... */}
                <div className="xl:col-span-2 bg-uhuru-card rounded-2xl border border-uhuru-border shadow-card overflow-hidden min-h-[1200px] flex flex-col">
                    <div className="p-6 border-b border-uhuru-border flex justify-between items-center bg-slate-900/40">
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">Recent Document Activity</h2>
                            <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-widest mt-1">Audit trail for all incoming/outgoing documents</p>
                        </div>
                        <Link href="/dashboard/banking" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">General Ledger</Link>
                    </div>
                    <div className="divide-y divide-uhuru-border flex-1">
                        {allRecentAttachments.map((att) => (
                            <div key={att.id} className="p-4 hover:bg-slate-800/40 transition-all flex items-center gap-4 group h-[60px]">
                                <div className={`p-2 rounded-xl border ${att.transactionId ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                    <FileText size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-white truncate">{att.originalName}</p>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight ${att.transactionId ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            {att.transactionId ? 'MATCHED' : 'UNASSIGNED'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <div className="flex items-center gap-1">
                                            {(att as any).extractedData?.documentRole === 'EMITTED' ? (
                                                <span className="text-[10px] font-black text-uhuru-blue tracking-wider uppercase">Sales</span>
                                            ) : (
                                                <span className="text-[10px] font-black text-rose-500 tracking-wider uppercase">Expense</span>
                                            )}
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                                        <p className="text-[9px] text-uhuru-text-dim uppercase font-bold tracking-widest">
                                            {new Date(att.uploadedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 flex items-center gap-2">
                                    <Link
                                        href={att.path.startsWith('/uploads/') ? `/api/uploads/${att.path.replace('/uploads/', '')}` : att.path}
                                        target="_blank"
                                        className="text-[10px] font-bold text-indigo-400 hover:underline uppercase tracking-widest"
                                    >
                                        View
                                    </Link>
                                    <div className="flex items-center gap-1">
                                        <LinkAttachmentButton id={att.id} hasTransaction={!!att.transactionId} />
                                        <DeleteAttachmentButton id={att.id} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* Dummy Items to fill 20 slots */}
                        {Array.from({ length: Math.max(0, 20 - allRecentAttachments.length) }).map((_, i) => (
                            <div key={`dummy-att-${i}`} className="p-4 flex items-center gap-4 h-[60px]">
                                <div className="w-8 h-8 rounded-xl bg-slate-800/10" />
                                <div className="flex-1">
                                    {allRecentAttachments.length === 0 && i === 10 && (
                                        <div className="text-center text-uhuru-text-dim ">No document activity detected.</div>
                                    )}
                                    &nbsp;
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Activity Pagination */}
                    <div className="bg-slate-900/10">
                        <StandardPagination
                            currentPage={docPage}
                            totalPages={totalDocPages}
                            baseUrl="/dashboard/invoices"
                            pageParam="docPage"
                        />
                    </div>
                </div>

                {/* Sidebar focus remains same ... */}
                <div className="bg-uhuru-card rounded-2xl border border-uhuru-border shadow-card overflow-hidden">
                    <div className="p-6 border-b border-uhuru-border bg-slate-900/40">
                        <h2 className="text-lg font-bold text-white tracking-tight">Attention Required</h2>
                        <p className="text-[10px] text-amber-500 uppercase font-bold tracking-widest mt-1">Found documents without ledger records</p>
                    </div>
                    <div className="p-4 space-y-3">
                        {unassignedAttachments.length === 0 ? (
                            <div className="py-12 text-center">
                                <Check className="mx-auto text-emerald-400 mb-2" size={24} />
                                <p className="text-uhuru-text-dim text-xs ">All documents reconciled</p>
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

            {/* Outgoing Invoices Section (5 records) */}
            <div className={`bg-uhuru-card rounded-2xl border ${showTrash ? 'border-red-500/30' : 'border-uhuru-border'} shadow-card overflow-hidden min-h-[400px] flex flex-col transition-colors`}>
                <div className="p-6 border-b border-uhuru-border flex justify-between items-center bg-slate-900/40">
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Outgoing Invoices Record {showTrash && '(Trash)'}</h2>
                        <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-widest mt-1">Legally binding invoices issued by your company</p>
                    </div>
                    <Link
                        href={showTrash ? "/dashboard/invoices" : "/dashboard/invoices?showTrash=true"}
                        className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${showTrash ? 'text-emerald-400 hover:text-emerald-300' : 'text-red-400 hover:text-red-300'} transition-colors`}
                    >
                        {showTrash ? (
                            <> <Check size={14} /> Show Active Invoices</>
                        ) : (
                            <> <Trash2 size={14} /> Show Trash</>
                        )}
                    </Link>
                </div>
                <div className="flex-1">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest border-b border-uhuru-border bg-slate-900/20">
                                <th className="px-6 py-4">Number</th>
                                <th className="px-6 py-4 hidden md:table-cell">Client</th>
                                <th className="px-6 py-4 hidden md:table-cell">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-uhuru-border">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors group cursor-default text-sm h-[60px]">
                                    <td className="px-6 py-4 font-bold text-white">{inv.number}</td>
                                    <td className="px-6 py-4 text-slate-300 hidden md:table-cell">{inv.organization.name}</td>
                                    <td className="px-6 py-4 text-uhuru-text-dim text-xs hidden md:table-cell">{inv.date.toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-bold text-white">{inv.currency} {Number(inv.total).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <InvoiceStatusBadge
                                            invoiceId={inv.id}
                                            currentStatus={inv.status}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                                        <Link
                                            href={`/dashboard/invoices/${inv.id}/pdf`}
                                            target="_blank"
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/5 transition-colors"
                                        >
                                            <Upload className="rotate-180" size={14} /> PDF
                                        </Link>

                                        {!showTrash && (
                                            <Link
                                                href={`/dashboard/invoices/${inv.id}/edit`}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-indigo-500/20 transition-colors"
                                            >
                                                Edit
                                            </Link>
                                        )}

                                        {showTrash ? (
                                            <form action={async () => {
                                                'use server';
                                                const { restoreInvoice } = await import('@/app/actions/invoicing');
                                                await restoreInvoice(inv.id);
                                            }}>
                                                <button className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all" title="Restore">
                                                    <Upload className="rotate-0" size={16} />
                                                </button>
                                            </form>
                                        ) : (
                                            <form action={async () => {
                                                'use server';
                                                const { deleteInvoice } = await import('@/app/actions/invoicing');
                                                await deleteInvoice(inv.id);
                                            }}>
                                                <button className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Move to Trash">
                                                    <Trash2 size={16} />
                                                </button>
                                            </form>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {/* Dummy Rows to fill 5 slots */}
                            {Array.from({ length: Math.max(0, 5 - invoices.length) }).map((_, i) => (
                                <tr key={`dummy-${i}`} className="h-[60px]">
                                    <td className="px-6 py-4">
                                        {invoices.length === 0 && i === 2 && (
                                            <div className="text-center text-uhuru-text-dim ">No invoices found in {showTrash ? 'trash' : 'active list'}.</div>
                                        )}
                                        &nbsp;
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">&nbsp;</td>
                                    <td className="px-6 py-4 hidden md:table-cell">&nbsp;</td>
                                    <td className="px-6 py-4">&nbsp;</td>
                                    <td className="px-6 py-4">&nbsp;</td>
                                    <td className="px-6 py-4">&nbsp;</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <StandardPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl="/dashboard/invoices"
                    additionalParams={showTrash ? { showTrash: 'true' } : undefined}
                />
            </div>
        </div >
    );
}


