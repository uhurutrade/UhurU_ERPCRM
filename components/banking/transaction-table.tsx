'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
    Trash2,
    AlertTriangle,
    X,
    CheckSquare,
    Square,
    Paperclip,
    Search,
    Tag,
    ChevronDown
} from 'lucide-react';

import { TransactionDetailsModal, type Transaction } from './transaction-details-modal';
import { CategoryBadge } from './category-badge';
import { bulkUpdateTransactionCategory } from '@/app/actions/banking';

export function TransactionTable({
    transactions,
    sequences = {},
    totalPages = 1,
    currentPage = 1,
    totalItems = 0,
    categories = []
}: {
    transactions: any[],
    sequences?: Record<string, number>,
    totalPages?: number,
    currentPage?: number,
    totalItems?: number,
    categories?: any[]
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSelectAllMatching, setIsSelectAllMatching] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteReason, setDeleteReason] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const [isCategorizing, setIsCategorizing] = useState(false);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState(searchParams.get('query')?.toString() || "");
    const currentCategoryStatus = (searchParams.get('categoryStatus') as 'all' | 'tagged' | 'untagged') || 'all';

    // Sync search with URL (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (searchTerm) {
                params.set('query', searchTerm);
            } else {
                params.delete('query');
            }
            params.set('page', '1');
            router.replace(`${pathname}?${params.toString()}`);
            setIsSelectAllMatching(false);
            setSelectedIds(new Set());
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, pathname, router]);

    const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null);

    // --- Logic ---
    const handleSelectAll = () => {
        if (isSelectAllMatching || (selectedIds.size === transactions.length && transactions.length > 0)) {
            setSelectedIds(new Set());
            setIsSelectAllMatching(false);
        } else {
            setSelectedIds(new Set(transactions.map(t => t.id)));
        }
    };

    const handleSelectAllMatching = () => {
        setIsSelectAllMatching(true);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
        setSelectedIds(new Set());
        setIsSelectAllMatching(false);
    };

    const handleSelectOne = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
            setIsSelectAllMatching(false);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleCategoryStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams);
        if (status === 'all') params.delete('categoryStatus');
        else params.set('categoryStatus', status);
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
        setSelectedIds(new Set());
        setIsSelectAllMatching(false);
    };

    const handleBulkCategory = async (catName: string) => {
        setIsCategorizing(true);
        setIsCategoryMenuOpen(false);
        try {
            const res = await bulkUpdateTransactionCategory(
                Array.from(selectedIds),
                catName,
                isSelectAllMatching,
                searchTerm
            );

            if (res.success) {
                toast.success(`Updated transactions successfully`);
                setSelectedIds(new Set());
                setIsSelectAllMatching(false);
                router.refresh();
            } else {
                toast.error(res.error || 'Failed to update categories');
            }
        } catch (error) {
            toast.error('Unexpected error during bulk update');
        } finally {
            setIsCategorizing(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteReason.trim()) return;
        setIsDeleting(true);
        try {
            const response = await fetch('/api/banking/transactions/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionIds: Array.from(selectedIds),
                    deleteAllMatching: isSelectAllMatching,
                    query: searchTerm,
                    reason: deleteReason
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete transactions");
            }

            setSelectedIds(new Set());
            setIsSelectAllMatching(false);
            setIsDeleteModalOpen(false);
            setDeleteReason("");
            router.refresh();
            toast.success("Transactions deleted and logged.");
        } catch (error: any) {
            toast.error(error.message || "An unexpected error occurred.");
        } finally {
            setIsDeleting(false);
        }
    };

    const linkAttachmentId = searchParams.get('attachmentId');
    const linkInvoiceId = searchParams.get('invoiceId');
    const isLinkingMode = searchParams.get('action') === 'link' && (linkAttachmentId || linkInvoiceId);

    const handleLinkDirect = async (transactionId: string) => {
        if (!linkAttachmentId && !linkInvoiceId) return;
        setIsDeleting(true);
        try {
            if (linkAttachmentId) {
                const { linkAttachmentToTransaction } = await import('@/app/actions/invoices');
                const res = await linkAttachmentToTransaction(linkAttachmentId, transactionId);
                if (res.success) {
                    toast.success('Attached successfully');
                    router.push('/dashboard/invoices');
                } else {
                    toast.error('Failed: ' + res.error);
                }
            } else if (linkInvoiceId) {
                const { linkInvoiceToTransaction } = await import('@/app/actions/invoicing');
                const res = await linkInvoiceToTransaction(linkInvoiceId, transactionId);
                if (res.success) {
                    toast.success('Invoice linked successfully');
                    router.push('/dashboard/invoices');
                } else {
                    toast.error('Failed: ' + res.error);
                }
            }
        } catch (err) {
            toast.error('Error linking');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="relative">
            {/* --- Action Bar (Floating) --- */}
            {selectedIds.size > 0 && (
                <div className="absolute -top-20 left-0 right-0 z-40 bg-slate-900 border border-slate-700 text-white p-4 rounded-2xl flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-uhuru-blue/20 rounded-xl text-uhuru-blue">
                            <CheckSquare size={20} />
                        </div>
                        <div>
                            <span className="font-black text-lg tracking-tight block">
                                {isSelectAllMatching ? `All ${totalItems} items selected` : `${selectedIds.size} Selected`}
                            </span>
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Bulk Management</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                                disabled={isCategorizing}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-white/5 shadow-lg group"
                            >
                                <Tag size={16} className="text-uhuru-blue group-hover:scale-110 transition-transform" />
                                {isCategorizing ? 'UPDATING...' : 'SET CATEGORY'}
                                <ChevronDown size={14} className={`transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isCategoryMenuOpen && (
                                <div className="absolute bottom-full right-0 mb-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <div className="p-2 border-b border-white/5">
                                        <p className="px-3 py-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">Choose Category</p>
                                    </div>
                                    <div className="max-h-72 overflow-y-auto p-1.5 custom-scrollbar">
                                        <button
                                            onClick={() => handleBulkCategory("")}
                                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2 mb-2 border-b border-white/5 pb-2"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                            Uncategorized (Clear)
                                        </button>

                                        {(() => {
                                            const groups: Record<string, any[]> = {};
                                            const ungrouped: any[] = [];

                                            categories.forEach(cat => {
                                                if (cat.name.includes(':')) {
                                                    const [groupName, itemName] = cat.name.split(':').map((s: string) => s.trim());
                                                    if (!groups[groupName]) groups[groupName] = [];
                                                    groups[groupName].push({ ...cat, displayName: itemName });
                                                } else {
                                                    ungrouped.push({ ...cat, displayName: cat.name });
                                                }
                                            });

                                            return (
                                                <>
                                                    {Object.entries(groups).map(([groupName, items]) => (
                                                        <div key={groupName} className="mb-2">
                                                            <div className="px-3 py-1 text-[9px] font-black text-uhuru-blue lg:text-slate-500 uppercase tracking-widest bg-slate-800/30 rounded flex items-center gap-2 mb-1">
                                                                <Tag size={10} />
                                                                {groupName}
                                                            </div>
                                                            {items.map((cat) => (
                                                                <button
                                                                    key={cat.name}
                                                                    onClick={() => handleBulkCategory(cat.name)}
                                                                    className="w-full text-left px-5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2 group"
                                                                >
                                                                    <div className={`w-1 h-1 rounded-full ${cat.color.split(' ')[0].replace('/10', '')}`} />
                                                                    {cat.displayName}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ))}

                                                    {ungrouped.map((cat) => (
                                                        <button
                                                            key={cat.name}
                                                            onClick={() => handleBulkCategory(cat.name)}
                                                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2 group"
                                                        >
                                                            <div className={`w-1.5 h-1.5 rounded-full ${cat.color.split(' ')[0].replace('/10', '')}`} />
                                                            {cat.displayName}
                                                        </button>
                                                    ))}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-8 bg-white/5" />

                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/30 rounded-xl font-bold transition-all"
                        >
                            <Trash2 size={16} />
                            DELETE
                        </button>

                        <button
                            onClick={() => { setSelectedIds(new Set()); setIsSelectAllMatching(false); }}
                            className="p-2.5 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* --- Search & Filters --- */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search recent transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-uhuru-blue text-white placeholder-slate-500 transition-all focus:bg-slate-900"
                    />
                </div>

                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700 h-12">
                    <button
                        onClick={() => handleCategoryStatusChange('all')}
                        className={`flex-1 px-6 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${currentCategoryStatus === 'all' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => handleCategoryStatusChange('tagged')}
                        className={`flex-1 px-6 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${currentCategoryStatus === 'tagged' ? 'bg-emerald-500/20 text-emerald-400 shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Tagged
                    </button>
                    <button
                        onClick={() => handleCategoryStatusChange('untagged')}
                        className={`flex-1 px-6 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${currentCategoryStatus === 'untagged' ? 'bg-rose-500/20 text-rose-400 shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Untagged
                    </button>
                </div>
            </div>

            {/* Selection Info */}
            {selectedIds.size > 0 && transactions.length > 0 && (
                <div className="bg-uhuru-blue/10 border-b border-uhuru-blue/20 p-2 text-center text-sm text-uhuru-blue rounded-t-xl">
                    {!isSelectAllMatching ? (
                        <span>
                            All <strong>{selectedIds.size}</strong> items on this page are selected.
                            {' '}
                            {totalItems > transactions.length && (
                                <button onClick={handleSelectAllMatching} className="underline font-bold hover:text-white">
                                    Select all {totalItems} items matching search/filter
                                </button>
                            )}
                        </span>
                    ) : (
                        <span>
                            All <strong>{totalItems}</strong> items are selected.
                            {' '}
                            <button onClick={() => { setIsSelectAllMatching(false); setSelectedIds(new Set()); }} className="underline font-bold hover:text-white">
                                Clear selection
                            </button>
                        </span>
                    )}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 text-slate-500 text-sm font-bold bg-slate-900/20">
                            <th className="py-4 px-4 w-12 text-center">
                                <button onClick={handleSelectAll} className="text-slate-400 hover:text-white transition-colors">
                                    {selectedIds.size === transactions.length && transactions.length > 0 ?
                                        <CheckSquare size={18} className="text-emerald-500" /> :
                                        <Square size={18} />
                                    }
                                </button>
                            </th>
                            {isLinkingMode && <th className="py-4 px-4 w-32 text-emerald-400 uppercase text-[10px]">Action</th>}
                            <th className="py-4 px-4 w-12 hidden sm:table-cell">#</th>
                            <th className="py-4 px-4">Date</th>
                            <th className="py-4 px-4">Description</th>
                            <th className="py-4 px-4 hidden md:table-cell">Account</th>
                            <th className="py-4 px-4 text-right">Amount</th>
                            <th className="py-4 px-4 hidden md:table-cell text-center">Category</th>
                            <th className="py-4 px-4 w-24 text-center">Link</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {transactions.map((tx) => {
                            const isSelected = selectedIds.has(tx.id);
                            const hasAttachments = tx.attachments && tx.attachments.length > 0;
                            return (
                                <tr
                                    key={tx.id}
                                    className={`border-b border-slate-800/50 transition-colors cursor-pointer h-16 ${isSelected ? 'bg-emerald-500/5' : 'hover:bg-slate-800/30'}`}
                                    onClick={() => setViewTransaction(tx)}
                                >
                                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => handleSelectOne(tx.id)}>
                                            {isSelected ?
                                                <CheckSquare size={18} className="text-emerald-500" /> :
                                                <Square size={18} className="text-slate-700" />
                                            }
                                        </button>
                                    </td>
                                    {isLinkingMode && (
                                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => handleLinkDirect(tx.id)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase transition-all">Link</button>
                                        </td>
                                    )}
                                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] hidden sm:table-cell">
                                        {sequences[tx.id] !== undefined ? `#${sequences[tx.id]}` : '-'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-300">
                                        {format(new Date(tx.date), 'MMM d, yyyy')}
                                    </td>
                                    <td className="py-3 px-4 text-white font-medium">
                                        <div className="truncate max-w-[200px] lg:max-w-md">{tx.description}</div>
                                        {tx.reference && <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">{tx.reference}</div>}
                                    </td>
                                    <td className="py-3 px-4 text-slate-500 hidden md:table-cell">
                                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                                            {tx.bankAccount.bank.bankName}
                                        </span>
                                    </td>
                                    <td className={`py-3 px-4 text-right font-bold whitespace-nowrap ${Number(tx.amount) > 0 ? 'text-emerald-400' : (Number(tx.amount) < 0 ? 'text-rose-400' : 'text-slate-300')}`}>
                                        {new Intl.NumberFormat('en-GB', { style: 'currency', currency: tx.currency }).format(Number(tx.amount))}
                                    </td>
                                    <td className="py-3 px-4 hidden md:table-cell text-center" onClick={(e) => e.stopPropagation()}>
                                        <CategoryBadge transactionId={tx.id} initialCategory={tx.category} allCategories={categories} />
                                    </td>
                                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => setViewTransaction(tx)}
                                            className={`p-2 rounded-xl transition-all ${hasAttachments ? 'bg-uhuru-blue/20 text-uhuru-blue' : 'text-slate-600 hover:text-white hover:bg-slate-800'}`}
                                        >
                                            {hasAttachments ? <Paperclip size={16} /> : <Search size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={10} className="py-20 text-center text-slate-600">No transactions found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Pagination --- */}
            <div className="flex items-center justify-between mt-8 p-4 bg-slate-900/30 rounded-2xl border border-slate-800">
                <div className="text-sm text-slate-500">
                    Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-white font-bold transition-all border border-slate-700">&lt;</button>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-white font-bold transition-all border border-slate-700">&gt;</button>
                </div>
            </div>

            <TransactionDetailsModal
                isOpen={!!viewTransaction}
                onClose={() => setViewTransaction(null)}
                transaction={viewTransaction}
                allCategories={categories}
            />

            {/* --- Delete Modal --- */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6 text-rose-500">
                            <AlertTriangle size={32} />
                            <h3 className="text-2xl font-bold text-white">Security Check</h3>
                        </div>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            Deleting <strong>{isSelectAllMatching ? totalItems : selectedIds.size}</strong> records.
                            This action logs an audit trail and is irreversible.
                        </p>
                        <input
                            type="text"
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            placeholder="Reason for deletion..."
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl mb-8 focus:ring-2 focus:ring-rose-500 outline-none text-white"
                        />
                        <div className="flex gap-4">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold">Cancel</button>
                            <button onClick={handleDelete} disabled={!deleteReason.trim() || isDeleting} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold disabled:opacity-50">
                                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
