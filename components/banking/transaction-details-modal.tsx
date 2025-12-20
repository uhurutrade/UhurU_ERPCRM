
'use client';

import { useState } from 'react';
// import { Dialog... } removed as we used custom modal structure
import { X, Paperclip, FileText, Calendar, CreditCard, Tag, Upload, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { uploadTransactionAttachment } from '@/app/actions/banking';
import { CategoryBadge } from './category-badge';

type Attachment = {
    id: string;
    path: string;
    originalName: string | null;
    fileType: string | null;
    uploadedAt: Date;
};

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
        bank: { bankName: string };
        accountName: string;
        currency: string;
    };
    attachments: Attachment[];
};

interface TransactionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    allCategories?: any[];
}

export function TransactionDetailsModal({ isOpen, onClose, transaction, allCategories = [] }: TransactionDetailsModalProps) {
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

    if (!isOpen || !transaction) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploading(true);

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await uploadTransactionAttachment(formData, transaction.id);
                if (res.success) {
                    window.location.reload();
                } else {
                    alert('Upload failed: ' + res.error);
                }
            } catch (err) {
                console.error(err);
                alert('Upload error');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleDeleteAttachment = async () => {
        if (!confirmDelete) return;

        setDeletingId(confirmDelete.id);
        try {
            const response = await fetch(`/api/banking/attachments/${confirmDelete.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                window.location.reload();
            } else {
                alert('Error al eliminar el archivo');
            }
        } catch (error) {
            console.error(error);
            alert('Error al eliminar el archivo');
        } finally {
            setDeletingId(null);
            setConfirmDelete(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 transition-opacity duration-300" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Card */}
            <div
                className="relative w-full max-w-6xl transform transition-all duration-300 scale-100 translate-y-0"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-uhuru-card backdrop-blur-3xl border border-slate-700/50 rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 mx-4 max-h-[90vh] overflow-y-auto">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center mb-6">
                        <h3 className="text-xl font-bold text-white mb-1">Transaction Details</h3>
                        <p className="text-xs text-slate-500 font-mono">{transaction.id}</p>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">

                        {/* Main Info Expansion */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Transaction Core */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-slate-900/40 p-8 rounded-[24px] border border-white/5">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <label className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-[0.2em] mb-2 block">Amount & Currency</label>
                                            <div className={`text-5xl font-black tracking-tight ${transaction.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                                                {new Intl.NumberFormat('en-GB', { style: 'currency', currency: transaction.currency }).format(transaction.amount)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <label className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-[0.2em] mb-2 block">Status</label>
                                            <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 uppercase">
                                                Verified
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-white/5">
                                        <div>
                                            <label className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-[0.2em] mb-2 block">Description</label>
                                            <div className="text-xl text-white font-semibold leading-relaxed">{transaction.description}</div>
                                        </div>

                                        {transaction.merchant && (
                                            <div className="pt-2">
                                                <label className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-[0.2em] mb-2 block">Identified Merchant</label>
                                                <div className="text-lg text-uhuru-blue font-bold">{transaction.merchant}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Metadata Cards */}
                            <div className="space-y-4">
                                <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-widest block">Transaction Date</label>
                                        <span className="text-white font-bold">{format(new Date(transaction.date), 'MMMM d, yyyy')}</span>
                                    </div>
                                </div>

                                <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <CreditCard size={24} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-widest block">Bank Connection</label>
                                        <span className="text-white font-bold">{transaction.bankAccount.bank.bankName}</span>
                                        <span className="text-[10px] text-uhuru-text-dim block">{transaction.bankAccount.accountName}</span>
                                    </div>
                                </div>

                                <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                                        <Tag size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-widest block">Internal Category</label>
                                        <div className="mt-1">
                                            <CategoryBadge
                                                transactionId={transaction.id}
                                                initialCategory={transaction.category}
                                                allCategories={allCategories}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attachments Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Paperclip size={20} className="text-uhuru-blue" />
                                    Attachments
                                </h3>
                                <label className="cursor-pointer">
                                    <span className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                    ${uploading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-uhuru-blue/10 text-uhuru-blue hover:bg-uhuru-blue/20'}
                                `}>
                                        {uploading ? 'Uploading...' : (
                                            <>
                                                <Upload size={14} />
                                                Add File
                                            </>
                                        )}
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        disabled={uploading}
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            </div>

                            {transaction.attachments && transaction.attachments.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {transaction.attachments.map((file) => (
                                        <div
                                            key={file.id}
                                            className="group relative flex items-center p-3 bg-slate-900 border border-slate-700 rounded-xl hover:border-uhuru-blue/50 transition-colors"
                                        >
                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setConfirmDelete({ id: file.id, name: file.originalName || 'Document' });
                                                }}
                                                disabled={deletingId === file.id}
                                                className="absolute top-2 right-2 p-1 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                title="Eliminar archivo"
                                            >
                                                <X size={14} />
                                            </button>

                                            {/* File Link */}
                                            <a
                                                href={file.path.startsWith('/uploads/') ? `/api/uploads/${file.path.replace('/uploads/', '')}` : file.path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center flex-1"
                                            >
                                                <div className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center text-slate-400 group-hover:text-uhuru-blue border border-slate-700">
                                                    {file.fileType?.includes('image') ? (
                                                        <img src={file.path.startsWith('/uploads/') ? `/api/uploads/${file.path.replace('/uploads/', '')}` : file.path} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FileText size={24} />
                                                    )}
                                                </div>
                                                <div className="ml-3 overflow-hidden">
                                                    <p className="text-sm font-medium text-slate-200 truncate">{file.originalName || 'Document'}</p>
                                                    <p className="text-xs text-slate-500">{format(new Date(file.uploadedAt), 'MMM d, HH:mm')}</p>
                                                </div>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                                    <p className="text-slate-500 text-sm">No attachments yet. Upload receipts, invoices, or proofs.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-red-900/50 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                            <X className="text-red-500" size={24} />
                            Eliminar Archivo
                        </h3>

                        <p className="text-slate-300 mb-2">
                            ¿Eliminar <strong className="text-white">"{confirmDelete.name}"</strong>?
                        </p>

                        <p className="text-sm text-slate-400 mb-6">
                            Esta acción no se puede deshacer.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteAttachment}
                                disabled={deletingId !== null}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold shadow-lg shadow-red-900/30 transition-all disabled:shadow-none"
                            >
                                {deletingId ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
