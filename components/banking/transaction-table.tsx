'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { Trash2, AlertTriangle, X, CheckSquare, Square, Paperclip, Search } from 'lucide-react';
import { useConfirm } from '@/components/providers/modal-provider';
import { toast } from 'sonner';
import { TransactionDetailsModal } from './transaction-details-modal';
import { CategoryBadge } from './category-badge';

type Transaction = {
    id: string;
    date: Date;
    description: string;
    amount: number;
    currency: string;
    category: string | null;
    status: string | null;
    reference: string | null;
    counterparty: string | null;
    merchant: string | null;
    bankAccount: {
        bank: {
            bankName: string;
        };
        accountName: string;
        currency: string;
    };
    attachments: any[]; // Extended via include
};

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
    const [isSelectAllMatching, setIsSelectAllMatching] = useState(false); // Global selection state

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteReason, setDeleteReason] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('query')?.toString() || "");

    // Sync search with URL (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (searchTerm) {
                params.set('query', searchTerm);
            } else {
                params.delete('query');
            }
            params.set('page', '1'); // Reset to page 1 on search
            router.replace(`${pathname}?${params.toString()}`);
            setIsSelectAllMatching(false); // Reset global selection on search change
            setSelectedIds(new Set());
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, pathname, router]); // Intentionally omitting searchParams to avoid loop if possible, but strict deps needed. 
    // Actually, searchParams changes on push, so this might loop if not careful.
    // Better strategy: Only push if value is different from current param.

    // Viewing State
    const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null);

    // --- Selection Logic ---
    const handleSelectAll = () => {
        if (isSelectAllMatching || (selectedIds.size === transactions.length && transactions.length > 0)) {
            setSelectedIds(new Set());
            setIsSelectAllMatching(false);
        } else {
            setSelectedIds(new Set(transactions.map(t => t.id)));
            // Global selection prompt logic handled in UI render
        }
    };

    const handleSelectAllMatching = () => {
        setIsSelectAllMatching(true);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
        setSelectedIds(new Set()); // Reset local selection on page change
        setIsSelectAllMatching(false);
    };

    const handleSelectOne = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
            setIsSelectAllMatching(false); // If unselecting one, global selection is broken
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    // --- Deletion Logic ---
    // --- Linking Logic ---
    const linkAttachmentId = searchParams.get('attachmentId');
    const isLinkingMode = searchParams.get('action') === 'link' && linkAttachmentId;

    const handleLinkDirect = async (transactionId: string) => {
        if (!linkAttachmentId) return;

        setIsDeleting(true); // Loading state
        try {
            const { linkAttachmentToTransaction } = await import('@/app/actions/invoices');
            const res = await linkAttachmentToTransaction(linkAttachmentId, transactionId);
            if (res.success) {
                toast.success('Attached successfully');
                router.push('/dashboard/invoices');
            } else {
                toast.error('Failed: ' + res.error);
            }
        } catch (err) {
            toast.error('Error linking');
        } finally {
            setIsDeleting(false);
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
                    query: searchTerm, // Send query for global deletion
                    reason: deleteReason
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete transactions");
            }

            // Success
            setSelectedIds(new Set());
            setIsSelectAllMatching(false);
            setIsDeleteModalOpen(false);
            setDeleteReason("");
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "An unexpected error occurred.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="relative">
            {/* --- Action Bar (Floating) --- */}
            {selectedIds.size > 0 && (
                <div className="absolute -top-16 left-0 right-0 z-10 bg-rose-950/90 backdrop-blur-md border border-rose-800 text-white p-4 rounded-xl flex justify-between items-center shadow-2xl animate-in slide-in-from-top-4 fade-in duration-200">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">{selectedIds.size} Selected</span>
                        <span className="text-rose-300 text-sm">Create Audit Log & Delete</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="px-4 py-2 hover:bg-rose-900/50 rounded-lg text-rose-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold shadow-lg shadow-rose-900/20 transition-all hover:scale-105"
                        >
                            <Trash2 size={18} />
                            DELETE SECURELY
                        </button>
                    </div>
                </div>
            )}

            {/* --- Search Bar --- */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search recent transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-uhuru-blue text-white placeholder-slate-500 transition-all focus:bg-slate-900"
                />
            </div>

            {/* --- Table --- */}
            {/* Active Filters / Bulk Actions Warning */}
            {selectedIds.size > 0 && transactions.length > 0 && (
                <div className="bg-uhuru-blue/10 border-b border-uhuru-blue/20 p-2 text-center text-sm text-uhuru-blue">
                    {!isSelectAllMatching ? (
                        <span>
                            All <strong>{selectedIds.size}</strong> items on this page are selected.
                            {' '}
                            {totalItems > transactions.length && (
                                <button
                                    onClick={handleSelectAllMatching}
                                    className="underline font-bold hover:text-white"
                                >
                                    Select all {totalItems} items matching this search
                                </button>
                            )}
                        </span>
                    ) : (
                        <span>
                            All <strong>{totalItems}</strong> items matching this search are selected.
                            {' '}
                            <button
                                onClick={() => { setIsSelectAllMatching(false); setSelectedIds(new Set()); }}
                                className="underline font-bold hover:text-white"
                            >
                                Clear selection
                            </button>
                        </span>
                    )}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                            <th className="py-3 px-4 w-12">
                                <button
                                    onClick={handleSelectAll}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    {selectedIds.size === transactions.length && transactions.length > 0 ?
                                        <CheckSquare size={20} className="text-emerald-500" /> :
                                        <Square size={20} />
                                    }
                                </button>
                            </th>
                            {isLinkingMode && <th className="py-3 px-4 w-32 text-emerald-400 font-bold uppercase text-[10px]">Action</th>}
                            <th className="py-3 px-4 w-12 text-slate-500 font-bold">#</th>
                            <th className="py-3 px-4 font-medium">Date</th>
                            <th className="py-3 px-4 font-medium">Description</th>
                            <th className="py-3 px-4 font-medium hidden md:table-cell">Account</th>
                            <th className="py-3 px-4 font-medium text-right">Amount</th>
                            <th className="py-3 px-4 font-medium hidden md:table-cell">Category</th>
                            {/* Attachments Column */}
                            <th className="py-3 px-4 w-12 text-center text-slate-400 hidden md:table-cell">
                                <Paperclip size={16} />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-500">
                                    {searchTerm ? "No matching transactions found." : "No transactions found."}
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx, index) => {
                                const isSelected = selectedIds.has(tx.id);
                                const hasAttachments = tx.attachments && tx.attachments.length > 0;
                                return (
                                    <tr
                                        key={tx.id}
                                        className={`
                                            border-b border-slate-800 transition-colors cursor-pointer
                                            ${isSelected ? 'bg-emerald-900/20' : 'hover:bg-slate-800/50'}
                                        `}
                                        onClick={() => setViewTransaction(tx)}
                                    >
                                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                            {isLinkingMode ? (
                                                <div className="w-5 h-5 rounded border border-emerald-500/50 bg-emerald-500/10" />
                                            ) : (
                                                <button onClick={() => handleSelectOne(tx.id)}>
                                                    {isSelected ?
                                                        <CheckSquare size={20} className="text-emerald-500" /> :
                                                        <Square size={20} className="text-slate-600" />
                                                    }
                                                </button>
                                            )}
                                        </td>
                                        {isLinkingMode && (
                                            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleLinkDirect(tx.id)}
                                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold uppercase transition-all"
                                                >
                                                    Link Here
                                                </button>
                                            </td>
                                        )}
                                        <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">
                                            {sequences[tx.id] !== undefined ? `#${sequences[tx.id]}` : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-slate-300">
                                            {format(new Date(tx.date), 'MMM d, yyyy')}
                                        </td>
                                        <td className="py-3 px-4 text-white font-medium">
                                            {tx.description}
                                            {tx.reference && <span className="block text-xs text-slate-500 mt-0.5">{tx.reference}</span>}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 hidden md:table-cell">
                                            <span className="px-2 py-1 rounded-full bg-slate-800 text-xs text-slate-300 border border-slate-700">
                                                {tx.bankAccount.bank.bankName}
                                            </span>
                                        </td>
                                        <td className={`py-3 px-4 text-right font-medium ${Number(tx.amount) > 0 ? 'text-emerald-400' : (Number(tx.amount) < 0 ? 'text-rose-400' : 'text-slate-300')}`}>
                                            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: tx.currency }).format(Number(tx.amount))}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 hidden md:table-cell">
                                            <CategoryBadge transactionId={tx.id} initialCategory={tx.category} allCategories={categories} />
                                        </td>
                                        {/* Attachments Cell */}
                                        <td className="py-3 px-4 text-center hidden md:table-cell" onClick={(e) => { e.stopPropagation(); setViewTransaction(tx); }}>
                                            <div className="flex justify-center">
                                                <button className={`p-1.5 rounded-lg transition-colors ${hasAttachments ? 'text-uhuru-blue bg-uhuru-blue/10' : 'text-slate-600 hover:text-slate-400'}`}>
                                                    <Paperclip size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Pagination --- */}
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-slate-400">
                    Page <span className="text-white font-medium">{currentPage}</span> of <span className="text-white font-medium">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors border border-slate-700"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors border border-slate-700"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* --- Transaction Details Modal (with Attachments) --- */}
            <TransactionDetailsModal
                isOpen={!!viewTransaction}
                onClose={() => setViewTransaction(null)}
                transaction={viewTransaction}
            />

            {/* --- Super Confirmation Modal --- */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-rose-900/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
                        {/* Background warning pattern */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 text-rose-900/20 opacity-50">
                            <AlertTriangle size={150} />
                        </div>

                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4 text-rose-500">
                                <AlertTriangle size={32} />
                                <h3 className="text-2xl font-bold text-white">Secure Deletion</h3>
                            </div>

                            <p className="text-slate-300 mb-6">
                                You are about to remove <strong>{selectedIds.size} transactions</strong>.
                                <br /><br />
                                This action will:
                                <ul className="list-disc list-inside mt-2 text-slate-400 text-sm">
                                    <li>Create a permanent record in the Audit Log ("Avoided Transactions").</li>
                                    <li>Permanently remove the items from the active ledger.</li>
                                    <li>Delete any attached files.</li>
                                </ul>
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Reason for deletion (Required)
                                </label>
                                <input
                                    type="text"
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    placeholder="e.g., Duplicate entry, Error in import..."
                                    className="w-full px-4 py-3 bg-slate-950 border border-rose-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-white placeholder-slate-600"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={!deleteReason.trim() || isDeleting}
                                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold shadow-lg shadow-rose-900/30 transition-all disabled:shadow-none"
                                >
                                    {isDeleting ? "Processing..." : "CONFIRM DELETE"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
