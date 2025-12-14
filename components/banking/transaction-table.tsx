'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Trash2, AlertTriangle, X, CheckSquare, Square, Paperclip } from 'lucide-react';
import { useConfirm } from '@/components/providers/modal-provider';
import { TransactionDetailsModal } from './transaction-details-modal';

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

export function TransactionTable({ transactions }: { transactions: any[] }) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteReason, setDeleteReason] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Viewing State
    const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null);

    // --- Selection Logic ---
    const handleSelectAll = () => {
        if (selectedIds.size === transactions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(transactions.map(t => t.id)));
        }
    };

    const handleSelectOne = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    // --- Deletion Logic ---
    const handleDelete = async () => {
        if (!deleteReason.trim()) return;

        setIsDeleting(true);
        try {
            const response = await fetch('/api/banking/transactions/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionIds: Array.from(selectedIds),
                    reason: deleteReason
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete transactions");
            }

            // Success
            setSelectedIds(new Set());
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

            {/* --- Table --- */}
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
                            <th className="py-3 px-4 font-medium">Date</th>
                            <th className="py-3 px-4 font-medium">Description</th>
                            <th className="py-3 px-4 font-medium">Account</th>
                            <th className="py-3 px-4 font-medium text-right">Amount</th>
                            <th className="py-3 px-4 font-medium">Category</th>
                            {/* Attachments Column */}
                            <th className="py-3 px-4 w-12 text-center text-slate-400">
                                <Paperclip size={16} />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-500">
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx) => {
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
                                            <button onClick={() => handleSelectOne(tx.id)}>
                                                {isSelected ?
                                                    <CheckSquare size={20} className="text-emerald-500" /> :
                                                    <Square size={20} className="text-slate-600" />
                                                }
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 text-slate-300">
                                            {format(new Date(tx.date), 'MMM d, yyyy')}
                                        </td>
                                        <td className="py-3 px-4 text-white font-medium">
                                            {tx.description}
                                            {tx.reference && <span className="block text-xs text-slate-500 mt-0.5">{tx.reference}</span>}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500">
                                            <span className="px-2 py-1 rounded-full bg-slate-800 text-xs text-slate-300 border border-slate-700">
                                                {tx.bankAccount.bank.bankName}
                                            </span>
                                        </td>
                                        <td className={`py-3 px-4 text-right font-medium ${Number(tx.amount) > 0 ? 'text-emerald-400' : 'text-white'}`}>
                                            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: tx.currency }).format(Number(tx.amount))}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500">
                                            {tx.category || '-'}
                                        </td>
                                        {/* Attachments Cell */}
                                        <td className="py-3 px-4 text-center" onClick={(e) => { e.stopPropagation(); setViewTransaction(tx); }}>
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
                                    <li>Create a permanent record in the Audit Log ("Graveyard").</li>
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
