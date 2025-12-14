
'use client';

import { useState } from 'react';
// import { Dialog... } removed as we used custom modal structure
import { X, Paperclip, FileText, Calendar, CreditCard, Tag, Upload, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { uploadTransactionAttachment } from '@/app/actions/banking';

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
}

export function TransactionDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
    const [uploading, setUploading] = useState(false);

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
                    // Refresh triggered by server action, but we might want to update local state or just wait for re-render
                    // Ideally we should have a way to refresh the view or router.refresh() 
                    // But since the parent component provided 'transaction', the parent needs to refresh.
                    // The server action 'revalidatePath' handles the data refresh on Next.js server components,
                    // but the client 'transaction' prop won't update instantly unless we trigger a router refresh.
                    window.location.reload(); // Quickest way to refetch for now, or use router.refresh()
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Transaction Details</h2>
                        <p className="text-slate-400 text-sm font-mono">{transaction.id}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Main Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Amount</label>
                                <div className={`text-3xl font-bold ${transaction.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                                    {new Intl.NumberFormat('en-GB', { style: 'currency', currency: transaction.currency }).format(transaction.amount)}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Description</label>
                                <div className="text-lg text-white font-medium">{transaction.description}</div>
                            </div>

                            {transaction.counterparty && (
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Counterparty</label>
                                    <div className="text-slate-300">{transaction.counterparty}</div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-3">
                                <Calendar className="text-purple-400" size={18} />
                                <div>
                                    <label className="text-xs text-slate-500 block">Date</label>
                                    <span className="text-slate-200">{format(new Date(transaction.date), 'MMMM d, yyyy')}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <CreditCard className="text-blue-400" size={18} />
                                <div>
                                    <label className="text-xs text-slate-500 block">Account</label>
                                    <span className="text-slate-200">{transaction.bankAccount.bank.bankName} - {transaction.bankAccount.currency}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Tag className="text-orange-400" size={18} />
                                <div>
                                    <label className="text-xs text-slate-500 block">Category</label>
                                    <span className="text-slate-200">{transaction.category || 'Uncategorized'}</span>
                                </div>
                            </div>

                            {transaction.reference && (
                                <div className="flex items-center gap-3">
                                    <FileText className="text-slate-400" size={18} />
                                    <div>
                                        <label className="text-xs text-slate-500 block">Reference</label>
                                        <span className="text-slate-200">{transaction.reference}</span>
                                    </div>
                                </div>
                            )}
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
                                    <a
                                        key={file.id}
                                        href={file.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center p-3 bg-slate-900 border border-slate-700 rounded-xl hover:border-uhuru-blue/50 transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center text-slate-400 group-hover:text-uhuru-blue border border-slate-700">
                                            {file.fileType?.includes('image') ? (
                                                <img src={file.path} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <FileText size={24} />
                                            )}
                                        </div>
                                        <div className="ml-3 overflow-hidden">
                                            <p className="text-sm font-medium text-slate-200 truncate">{file.originalName || 'Document'}</p>
                                            <p className="text-xs text-slate-500">{format(new Date(file.uploadedAt), 'MMM d, HH:mm')}</p>
                                        </div>
                                    </a>
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
    );
}
