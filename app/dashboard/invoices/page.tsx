import Link from 'next/link';
import { Plus, FileText, ArrowUpRight, Upload, Check, Trash2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { InvoiceUploadButton } from '@/components/invoices/invoice-upload-button';
import { DeleteAttachmentButton, LinkAttachmentButton, LinkInvoiceButton } from '@/components/invoices/invoice-actions';
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge';
import { StandardPagination } from '@/components/invoices/invoices-pagination';
import { serializeData } from '@/lib/serialization';

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

    // CRITICAL: Serialize all data for production robustness
    const sInvoices = serializeData(invoices);
    const sDocs = serializeData(allRecentAttachments);
    const sUnassigned = serializeData(unassignedAttachments);

    return (
        <div className="p-0 sm:p-8 max-w-[1920px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Invoice Management</h1>
                    <p className="text-uhuru-text-muted mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Financial Operations & Expense Matching</p>
                </div>
                <div className="flex gap-3">
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
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border">
                    <div className="text-uhuru-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Outgoing Invoices {showTrash && '(Trash)'}</div>
                    <div className="text-3xl font-bold text-white">{totalInvoices}</div>
                </div>
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border">
                    <div className="text-uhuru-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Processed Documents</div>
                    <div className="text-3xl font-bold text-white">{totalAttachments}</div>
                </div>
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border">
                    <div className="text-uhuru-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Awaiting Matching</div>
                    <div className="text-3xl font-bold text-amber-500">{unassignedAttachments.length}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Feed */}
                <div className="xl:col-span-2 bg-uhuru-card rounded-2xl border border-uhuru-border overflow-hidden">
                    <div className="p-6 border-b border-uhuru-border flex justify-between items-center bg-slate-900/40">
                        <h2 className="text-lg font-bold text-white">Recent Activity</h2>
                        <Link href="/dashboard/banking" className="text-xs font-bold text-indigo-400 hover:underline px-4">Ledger</Link>
                    </div>
                    <div className="divide-y divide-uhuru-border">
                        {sDocs.map((att: any) => (
                            <div key={att.id} className="p-4 hover:bg-slate-800/40 transition-all flex items-center gap-4 group h-[60px]">
                                <div className={`p-2 rounded-xl border ${att.transactionId ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                    <FileText size={16} />
                                </div>
                                <div className="flex-1 min-w-0 flex justify-between items-center">
                                    <div>
                                        <p className="text-white text-[11px] font-bold truncate tracking-tight">{att.originalName}</p>
                                        <p className="text-[9px] text-uhuru-text-dim uppercase font-bold mt-0.5">
                                            {new Date(att.uploadedAt).toLocaleDateString()}
                                            {att.transaction && <span className="text-emerald-400 ml-2">• {att.transaction.description}</span>}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <LinkAttachmentButton id={att.id} hasTransaction={!!att.transactionId} />
                                        <DeleteAttachmentButton id={att.id} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <StandardPagination currentPage={docPage} totalPages={totalDocPages} baseUrl="/dashboard/invoices" pageParam="docPage" />
                </div>

                {/* Sidebar */}
                <div className="bg-uhuru-card rounded-2xl border border-uhuru-border overflow-hidden">
                    <div className="p-6 border-b border-uhuru-border bg-slate-900/40">
                        <h2 className="text-lg font-bold text-white">Attention Required</h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {sUnassigned.length === 0 ? (
                            <div className="py-12 text-center text-uhuru-text-dim text-xs italic">All clear</div>
                        ) : (
                            sUnassigned.map((att: any) => (
                                <div key={att.id} className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl hover:bg-amber-500/10 transition-all flex justify-between items-center">
                                    <div className="overflow-hidden">
                                        <p className="text-white text-xs font-bold truncate">{att.originalName}</p>
                                        <p className="text-[9px] text-uhuru-text-dim mt-0.5">{new Date(att.uploadedAt).toLocaleDateString()}</p>
                                    </div>
                                    <Link href="/dashboard/banking" className="p-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-all">
                                        <Upload size={14} />
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className={`bg-uhuru-card rounded-2xl border ${showTrash ? 'border-red-500/30' : 'border-uhuru-border'} shadow-card overflow-hidden`}>
                <div className="p-6 border-b border-uhuru-border flex justify-between items-center bg-slate-900/40">
                    <h2 className="text-lg font-bold text-white">Outgoing Invoices {showTrash && '(Trash)'}</h2>
                    <Link
                        href={showTrash ? "/dashboard/invoices" : "/dashboard/invoices?showTrash=true"}
                        className={`text-[10px] font-bold uppercase tracking-widest ${showTrash ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                        {showTrash ? 'Active Invoices' : 'Show Trash'}
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-uhuru-text-muted uppercase border-b border-uhuru-border bg-slate-900/20">
                                <th className="px-6 py-4">Number</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-uhuru-border">
                            {sInvoices.map((inv: any) => (
                                <tr key={inv.id} className="text-xs border-b border-uhuru-border hover:bg-uhuru-blue/5 transition-all group h-[60px]">
                                    <td className="px-6 py-4 font-bold text-white">{inv.number}</td>
                                    <td className="px-6 py-4 text-slate-300">{inv.organization?.name || '---'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <InvoiceStatusBadge invoiceId={inv.id} currentStatus={inv.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-white">
                                        {new Intl.NumberFormat('en-GB', { style: 'currency', currency: inv.currency }).format(inv.total)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {showTrash ? (
                                                <form action={async () => {
                                                    'use server';
                                                    const { restoreInvoice } = await import('@/app/actions/invoicing');
                                                    await restoreInvoice(inv.id);
                                                }}>
                                                    <button className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg">
                                                        <Upload className="rotate-0" size={16} />
                                                    </button>
                                                </form>
                                            ) : (
                                                <>
                                                    <Link href={`/invoice-pdf/${inv.id}`} target="_blank" className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg">
                                                        <FileText size={14} />
                                                    </Link>
                                                    {inv.status === 'DRAFT' && (
                                                        <Link href={`/dashboard/invoices/${inv.id}/edit`} className="p-2 bg-uhuru-blue/10 text-uhuru-blue hover:bg-uhuru-blue hover:text-white rounded-lg">
                                                            <ArrowUpRight size={14} />
                                                        </Link>
                                                    )}
                                                    {inv.status === 'PAID' && (
                                                        <LinkInvoiceButton id={inv.id} amount={inv.total} hasTransaction={!!inv.bankTransactionId} />
                                                    )}
                                                    <form action={async () => {
                                                        'use server';
                                                        const { deleteInvoice } = await import('@/app/actions/invoicing');
                                                        await deleteInvoice(inv.id);
                                                    }}>
                                                        <button className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </form>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <StandardPagination currentPage={currentPage} totalPages={totalPages} baseUrl={showTrash ? "/dashboard/invoices?showTrash=true" : "/dashboard/invoices"} />
            </div>
        </div>
    );
}
