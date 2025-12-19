"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, Link as LinkIcon, ExternalLink, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { uploadAndAnalyzeInvoice, linkAttachmentToTransaction } from '@/app/actions/invoices';
import { toast } from 'sonner';

export function InvoiceUploadButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isConfirmingDuplicate, setIsConfirmingDuplicate] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [documentRole, setDocumentRole] = useState<'EMITTED' | 'RECEIVED' | null>(null);

    const handleUpload = async (e?: React.ChangeEvent<HTMLInputElement>, confirmed = false) => {
        const file = e?.target.files?.[0] || pendingFile;
        if (!file) return;
        if (!documentRole) {
            toast.error('Select if invoice is Emitted or Received');
            return;
        }

        setIsUploading(true);
        setError(null);
        setAnalysisResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentRole', documentRole);
        if (confirmed) {
            formData.append('confirmDuplicate', 'true');
        }

        try {
            const result = await uploadAndAnalyzeInvoice(formData);
            if (result.success) {
                if (result.isDuplicate && !confirmed) {
                    setIsConfirmingDuplicate(true);
                    setPendingFile(file);
                    setAnalysisResult(result); // Show the analysis anyway so they know why it's a duplicate
                } else {
                    setAnalysisResult(result);
                    setIsConfirmingDuplicate(false);
                    setPendingFile(null);
                    toast.success('Invoice processed successfully');
                }
            } else {
                setError(result.error || 'Failed to analyze invoice');
                toast.error(result.error || 'Check document format');
            }
        } catch (err) {
            setError('An error occurred during upload');
            toast.error('Server error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleLink = async (transactionId: string) => {
        if (!analysisResult?.attachmentId) return;

        try {
            const res = await linkAttachmentToTransaction(analysisResult.attachmentId, transactionId);
            if (res.success) {
                toast.success('Attached to transaction successfully');
                setIsOpen(false);
                setAnalysisResult(null);
            } else {
                toast.error('Failed to link: ' + res.error);
            }
        } catch (err) {
            toast.error('Error linking');
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-uhuru-card border border-uhuru-border hover:border-emerald-500/50 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
            >
                <Upload size={16} className="text-emerald-400" />
                Upload Invoice/Expense
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-uhuru-card border border-uhuru-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-uhuru-border flex justify-between items-center bg-slate-900/40">
                            <div>
                                <h3 className="text-xl font-bold text-white">Smart Invoice Upload</h3>
                                <p className="text-uhuru-text-dim text-xs mt-1">AI will analyze and suggest matches in General Ledger</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-uhuru-text-dim hover:text-white transition-colors">
                                <FileText size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {!analysisResult && !isUploading && (
                                <div className="space-y-6">
                                    {/* Role Selector */}
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-[0.2em] text-center">
                                            Step 1: Select Document Nature
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setDocumentRole('EMITTED')}
                                                className={`
                                                    p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                                                    ${documentRole === 'EMITTED'
                                                        ? 'bg-uhuru-blue/20 border-uhuru-blue text-white'
                                                        : 'bg-slate-900/40 border-uhuru-border text-uhuru-text-dim hover:border-uhuru-blue/30'}
                                                `}
                                            >
                                                <ArrowUpRight size={24} className={documentRole === 'EMITTED' ? 'text-uhuru-blue' : ''} />
                                                <div className="text-center">
                                                    <div className="font-bold text-sm">EMITTED</div>
                                                    <div className="text-[10px] opacity-70 italic font-medium">Sales / Income</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => setDocumentRole('RECEIVED')}
                                                className={`
                                                    p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                                                    ${documentRole === 'RECEIVED'
                                                        ? 'bg-rose-500/20 border-rose-500 text-white'
                                                        : 'bg-slate-900/40 border-uhuru-border text-uhuru-text-dim hover:border-rose-500/30'}
                                                `}
                                            >
                                                <ArrowDownLeft size={24} className={documentRole === 'RECEIVED' ? 'text-rose-500' : ''} />
                                                <div className="text-center">
                                                    <div className="font-bold text-sm">RECEIVED</div>
                                                    <div className="text-[10px] opacity-70 italic font-medium">Expenses / Purchases</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Upload Area */}
                                    <div
                                        onClick={() => {
                                            if (!documentRole) {
                                                toast.error('Select document nature first');
                                                return;
                                            }
                                            fileInputRef.current?.click();
                                        }}
                                        className={`
                                            border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all group
                                            ${!documentRole ? 'border-uhuru-border/20 grayscale opacity-50' : 'border-uhuru-border hover:border-indigo-500/50 hover:bg-indigo-500/5'}
                                        `}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleUpload}
                                            className="hidden"
                                            accept=".pdf,image/*"
                                        />
                                        <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Upload className="text-indigo-400" size={32} />
                                        </div>
                                        <p className="text-white font-medium">
                                            {!documentRole ? 'Select type to start upload' : 'Click or drag invoice file'}
                                        </p>
                                        <p className="text-uhuru-text-dim text-sm mt-1">PDF, JPG, PNG or WEBP</p>
                                    </div>
                                </div>
                            )}

                            {isUploading && (
                                <div className="py-12 text-center space-y-4">
                                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
                                    <p className="text-white font-medium animate-pulse">Analyzing document with AI...</p>
                                    <p className="text-uhuru-text-dim text-xs">Extracting amounts, dates and issuer</p>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-400">
                                    <AlertCircle className="shrink-0" size={20} />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            {analysisResult && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                    {isConfirmingDuplicate && (
                                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                                            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
                                                <AlertCircle size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold">Possible Duplicate Detected</h4>
                                                <p className="text-uhuru-text-dim text-sm mt-1">
                                                    An invoice with the same issuer, date, and amount already exists.
                                                    Do you want to upload it anyway or discard this copy?
                                                </p>
                                            </div>
                                            <div className="flex gap-3 w-full">
                                                <button
                                                    onClick={() => { setAnalysisResult(null); setIsConfirmingDuplicate(false); setPendingFile(null); }}
                                                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                                                >
                                                    Discard
                                                </button>
                                                <button
                                                    onClick={() => handleUpload(undefined, true)}
                                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                                                >
                                                    Upload Anyway
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Extracted Info */}
                                    <div className={`grid grid-cols-2 gap-4 ${isConfirmingDuplicate ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-widest mb-1">Issuer</p>
                                            <p className="text-white font-bold">{analysisResult.analysis.issuer}</p>
                                        </div>
                                        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-widest mb-1">Amount</p>
                                            <p className="text-emerald-400 font-bold text-lg">
                                                {analysisResult.analysis.currency} {typeof analysisResult.analysis.amount === 'number' ? analysisResult.analysis.amount.toLocaleString() : (analysisResult.analysis.amount || '0.00')}
                                            </p>
                                        </div>
                                        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-widest mb-1">Date</p>
                                            <p className="text-white font-medium">{new Date(analysisResult.analysis.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-widest mb-1">Confidence</p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500"
                                                        style={{ width: `${analysisResult.analysis.confidence * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-white">{(analysisResult.analysis.confidence * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Matches */}
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                                            <LinkIcon size={14} className="text-indigo-400" />
                                            Potential Ledger Matches
                                        </h4>
                                        <div className="space-y-2">
                                            {analysisResult.potentialMatches?.length > 0 ? (
                                                analysisResult.potentialMatches.map((match: any) => (
                                                    <div
                                                        key={match.id}
                                                        className="flex items-center justify-between p-4 bg-uhuru-hover/30 border border-uhuru-border rounded-xl hover:border-emerald-500/30 transition-all group"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-white font-medium text-sm">{match.description}</span>
                                                                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase">
                                                                    {match.matchScore}% Match
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-3 mt-1">
                                                                <span className="text-xs text-uhuru-text-dim">{new Date(match.date).toLocaleDateString()}</span>
                                                                <span className="text-xs text-uhuru-text-dim font-bold">{match.currency} {Number(match.amount).toFixed(2)}</span>
                                                                <span className="text-[10px] text-slate-500 bg-slate-800/50 px-1 rounded">{match.bankAccount.bank.bankName}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleLink(match.id)}
                                                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                                                        >
                                                            <Check size={14} />
                                                            Link
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-6 bg-slate-900/20 border border-dashed border-uhuru-border rounded-xl">
                                                    <p className="text-uhuru-text-dim text-sm italic">No close matches found in General Ledger</p>
                                                    <button
                                                        onClick={() => setIsOpen(false)}
                                                        className="text-indigo-400 text-xs font-bold uppercase tracking-widest mt-2 hover:text-indigo-300 transition-colors"
                                                    >
                                                        Keep as unassigned
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-uhuru-border gap-3">
                                        <button
                                            onClick={() => { setAnalysisResult(null); setError(null); }}
                                            className="text-xs font-bold text-uhuru-text-dim uppercase tracking-widest hover:text-white transition-colors"
                                        >
                                            Process another
                                        </button>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
