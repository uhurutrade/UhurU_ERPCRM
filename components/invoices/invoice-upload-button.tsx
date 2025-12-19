"use client";

import { useState, useRef, useMemo } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, Link as LinkIcon, ExternalLink, ArrowUpRight, ArrowDownLeft, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { uploadAndAnalyzeInvoice, linkAttachmentToTransaction } from '@/app/actions/invoices';
import { toast } from 'sonner';

export function InvoiceUploadButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isConfirmingDuplicate, setIsConfirmingDuplicate] = useState(false);
    const [isConfirmingLink, setIsConfirmingLink] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
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
                    setAnalysisResult(result);
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

    const handleLink = async () => {
        if (!analysisResult?.attachmentId || !selectedMatch) return;

        try {
            const res = await linkAttachmentToTransaction(analysisResult.attachmentId, selectedMatch.id);
            if (res.success) {
                toast.success('Attached to transaction successfully');
                setIsOpen(false);
                setAnalysisResult(null);
                setIsConfirmingLink(false);
                setSelectedMatch(null);
            } else {
                toast.error('Failed to link: ' + res.error);
            }
        } catch (err) {
            toast.error('Error linking');
        }
    };

    const initiateLink = (match: any) => {
        setSelectedMatch(match);
        setIsConfirmingLink(true);
    };

    // --- Logical Evaluation of the Match ---
    const matchAnalysis = useMemo(() => {
        if (!selectedMatch || !analysisResult?.analysis) return null;

        const invoiceAmount = Number(analysisResult.analysis.amount);
        const transactionAmount = Math.abs(Number(selectedMatch.amount));
        const amountMatches = Math.abs(invoiceAmount - transactionAmount) < 0.01;

        const invoiceDate = new Date(analysisResult.analysis.date);
        const transactionDate = new Date(selectedMatch.date);
        const daysDiff = Math.abs((invoiceDate.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
        const dateIsClose = daysDiff <= 10;

        const descriptionMatchScore = matchScore(selectedMatch.description, analysisResult.analysis.issuer);
        const descMatches = descriptionMatchScore > 40;

        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'HIGH'; // HIGH means high probability of error (LOW match)
        let message = "";
        let colorClass = "";
        let icon = null;

        if (amountMatches && dateIsClose) {
            riskLevel = 'LOW'; // Safe
            message = "This match is extremely likely to be correct.";
            colorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            icon = <ShieldCheck size={20} />;
        } else if (amountMatches || (dateIsClose && descMatches)) {
            riskLevel = 'MEDIUM';
            message = "We found some similarities, check carefully before linking.";
            colorClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
            icon = <ShieldQuestion size={20} />;
        } else {
            riskLevel = 'HIGH'; // Manual override level
            message = "WARNING: These records have NOTHING in common (Amount, Date and Description differ). Are you SURE you want to link them?";
            colorClass = "text-rose-400 bg-rose-500/10 border-rose-500/20";
            icon = <ShieldAlert size={20} />;
        }

        return { riskLevel, message, colorClass, icon, amountMatches, dateIsClose, descMatches };
    }, [selectedMatch, analysisResult]);

    function matchScore(s1: string, s2: string) {
        if (!s1 || !s2) return 0;
        const n1 = s1.toLowerCase();
        const n2 = s2.toLowerCase();
        if (n1.includes(n2) || n2.includes(n1)) return 100;
        return 0; // Simplified for this logic
    }

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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
                    <div className="bg-uhuru-card border border-uhuru-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in duration-300">
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
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-[0.2em] text-center">
                                            Step 1: Select Document Nature
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setDocumentRole('EMITTED')}
                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${documentRole === 'EMITTED' ? 'bg-uhuru-blue/20 border-uhuru-blue text-white' : 'bg-slate-900/40 border-uhuru-border text-uhuru-text-dim hover:border-uhuru-blue/30'}`}
                                            >
                                                <ArrowUpRight size={24} className={documentRole === 'EMITTED' ? 'text-uhuru-blue' : ''} />
                                                <div className="text-center">
                                                    <div className="font-bold text-sm">EMITTED</div>
                                                    <div className="text-[10px] opacity-70 italic font-medium">Sales / Income</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => setDocumentRole('RECEIVED')}
                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${documentRole === 'RECEIVED' ? 'bg-rose-500/20 border-rose-500 text-white' : 'bg-slate-900/40 border-uhuru-border text-uhuru-text-dim hover:border-rose-500/30'}`}
                                            >
                                                <ArrowDownLeft size={24} className={documentRole === 'RECEIVED' ? 'text-rose-500' : ''} />
                                                <div className="text-center">
                                                    <div className="font-bold text-sm">RECEIVED</div>
                                                    <div className="text-[10px] opacity-70 italic font-medium">Expenses / Purchases</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => documentRole && fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all group ${!documentRole ? 'border-uhuru-border/20 grayscale opacity-50' : 'border-uhuru-border hover:border-indigo-500/50 hover:bg-indigo-500/5'}`}
                                    >
                                        <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept=".pdf,image/*" />
                                        <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Upload className="text-indigo-400" size={32} />
                                        </div>
                                        <p className="text-white font-medium">{!documentRole ? 'Select type to start upload' : 'Click or drag invoice file'}</p>
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

                            {analysisResult && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                    {/* Extracted Info Card */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-widest mb-1">Issuer</p>
                                            <p className="text-white font-bold">{analysisResult.analysis.issuer}</p>
                                        </div>
                                        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-widest mb-1">Amount</p>
                                            <p className="text-emerald-400 font-bold text-lg">
                                                {analysisResult.analysis.currency} {(analysisResult.analysis.amount).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Matches List */}
                                    <div>
                                        <h4 className="text-[10px] font-bold text-uhuru-text-dim mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <LinkIcon size={12} className="text-indigo-400" />
                                            Potential Ledger Matches
                                        </h4>
                                        <div className="space-y-2">
                                            {analysisResult.potentialMatches?.length > 0 ? (
                                                analysisResult.potentialMatches.map((match: any) => (
                                                    <div key={match.id} className="p-4 bg-uhuru-hover/30 border border-uhuru-border rounded-xl hover:border-emerald-500/30 transition-all group">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-white font-medium text-sm">{match.description}</span>
                                                                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase">{match.matchScore}% Match</span>
                                                                </div>
                                                                <div className="flex gap-3 mt-1">
                                                                    <span className="text-xs text-uhuru-text-dim">{new Date(match.date).toLocaleDateString()}</span>
                                                                    <span className="text-xs text-uhuru-text-dim font-bold">{match.currency} {Number(match.amount).toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => initiateLink(match)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-emerald-900/20">
                                                                <Check size={14} /> Link
                                                            </button>
                                                        </div>
                                                        {match.description.toLowerCase().includes(analysisResult.analysis.amount.toFixed(2)) && match.currency !== analysisResult.analysis.currency && (
                                                            <div className="mt-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg inline-flex items-center gap-2">
                                                                <AlertCircle size={10} className="text-amber-400" />
                                                                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Amount found in description (Conversion detected)</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-6 bg-slate-900/20 border border-dashed border-uhuru-border rounded-xl">
                                                    <p className="text-uhuru-text-dim text-sm italic">No close matches found in General Ledger</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-uhuru-border gap-3">
                                        <button onClick={() => { setAnalysisResult(null); setError(null); }} className="text-xs font-bold text-uhuru-text-dim uppercase tracking-widest hover:text-white transition-colors">Process another</button>
                                        <button onClick={() => setIsOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">Close</button>
                                    </div>
                                </div>
                            )}

                            {/* --- DEFINTIVE CONFIRMATION MODAL --- */}
                            {isConfirmingLink && selectedMatch && matchAnalysis && (
                                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
                                    <div className="bg-uhuru-card border border-uhuru-border rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
                                        {/* Dynamic Header based on Risk */}
                                        <div className="flex flex-col items-center text-center gap-4">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ring-4 ring-white/5 ${matchAnalysis.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-500' : matchAnalysis.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                {matchAnalysis.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-white uppercase tracking-tight">Confirm Linkage</h4>
                                                <p className={`mt-3 p-3 rounded-xl border text-xs font-medium leading-relaxed ${matchAnalysis.colorClass}`}>
                                                    {matchAnalysis.message}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-0.5 p-1 rounded-full ${matchAnalysis.amountMatches ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                    <Check size={12} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Amount Match</span>
                                                    <span className="text-xs text-slate-400 truncate">
                                                        Doc: {analysisResult.analysis.currency} {Number(analysisResult.analysis.amount).toFixed(2)} | Ledger: {selectedMatch.currency} {Math.abs(Number(selectedMatch.amount)).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className={`mt-0.5 p-1 rounded-full ${matchAnalysis.dateIsClose ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                    <Check size={12} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Date Window</span>
                                                    <span className="text-xs text-slate-400">
                                                        Doc: {new Date(analysisResult.analysis.date).toLocaleDateString()} | Ledger: {new Date(selectedMatch.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {selectedMatch.attachments?.length > 0 && (
                                                <div className="mt-2 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl flex gap-3 text-rose-400 animate-pulse">
                                                    <AlertCircle size={18} className="shrink-0" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest leading-normal">Replaces existing document</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button onClick={() => { setIsConfirmingLink(false); setSelectedMatch(null); }} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all">Cancel</button>
                                            <button onClick={handleLink} className={`flex-1 py-3.5 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg ${matchAnalysis.riskLevel === 'HIGH' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'}`}>
                                                {matchAnalysis.riskLevel === 'HIGH' ? 'Link anyway' : 'Confirm Link'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div >
            )
            }
        </>
    );
}
