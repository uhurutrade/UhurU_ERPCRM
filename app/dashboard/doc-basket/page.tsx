"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, Info, History, ShieldAlert, ShieldCheck, Clock, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { uploadToBasket, getBasketHistory, removeFromBasket } from '@/app/actions/basket';
import { format } from 'date-fns';

export default function DocBasketPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        const res = await getBasketHistory();
        if (res.success) {
            setHistory(res.data || []);
            setSelectedIds([]); // Reset selection on refresh
        }
        setIsLoadingHistory(false);
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setIsUploading(true);

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
            const res = await uploadToBasket(formData);
            if (res.success) {
                toast.success(`${files.length} documents added to your Strategic Basket`);
                setFiles([]);
                fetchHistory();
            } else {
                toast.error(res.error || 'Failed to upload documents');
                if (res.skipped && res.skipped > 0) fetchHistory(); // Still refresh if some were duplicates
            }
        } catch (err) {
            toast.error('Server error during upload');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this document?')) return;
        try {
            const res = await removeFromBasket(id);
            if (res.success) {
                toast.success('Document removed');
                fetchHistory();
            } else {
                toast.error(res.error || 'Failed to remove');
            }
        } catch (err) {
            toast.error('Error removing document');
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to remove ${selectedIds.length} documents?`)) return;

        let successCount = 0;
        for (const id of selectedIds) {
            const res = await removeFromBasket(id);
            if (res.success) successCount++;
        }

        toast.success(`${successCount} documents removed`);
        fetchHistory();
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <Upload size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Doc Basket</h1>
                        <p className="text-uhuru-text-dim mt-1">AI-Powered Strategic Document Repository for UK Ltd Compliance.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Section: Upload & History */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Upload Zone */}
                    <div className="space-y-6">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                                relative border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-500 group overflow-hidden
                                ${files.length > 0 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-uhuru-border hover:border-indigo-500/40 hover:bg-slate-900/40 hover:shadow-2xl'}
                            `}
                        >
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

                            <input
                                type="file"
                                multiple
                                {...({ webkitdirectory: "", directory: "" } as any)}
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <div className="relative z-10 flex flex-col items-center gap-6">
                                <div className={`p-6 rounded-full transition-transform duration-500 group-hover:scale-110 ${files.length > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400 ring-4 ring-indigo-500/5'}`}>
                                    <Upload size={32} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">Nourish the Engine</h3>
                                    <p className="text-uhuru-text-dim text-sm max-w-xs mx-auto">
                                        Drop contracts, HMRC letters, or valuation reports.
                                    </p>
                                </div>

                                {files.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                        {files.map((f, i) => (
                                            <div key={i} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                                <FileText size={12} />
                                                {f.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            {files.length > 0 && (
                                <button
                                    onClick={() => setFiles([])}
                                    className="px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest text-uhuru-text-dim hover:text-white transition-all"
                                >
                                    Clear Selection
                                </button>
                            )}
                            <button
                                onClick={handleUpload}
                                disabled={files.length === 0 || isUploading}
                                className={`
                                    flex items-center gap-2 px-10 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl
                                    ${isUploading ? 'bg-slate-800 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:scale-[1.02] active:scale-95'}
                                    disabled:opacity-30
                                `}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Analyzing Intel...
                                    </>
                                ) : (
                                    <>
                                        <Check size={16} />
                                        Commit to Basket
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* History Section */}
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-uhuru-text-dim">
                                <History size={16} />
                                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Strategic Basket History</h2>
                            </div>

                            <div className="flex items-center gap-3">
                                {selectedIds.length > 0 && (
                                    <button
                                        onClick={handleBulkDelete}
                                        className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-[10px] font-black text-rose-400 uppercase tracking-widest transition-all"
                                    >
                                        <Trash2 size={12} />
                                        Delete ({selectedIds.length})
                                    </button>
                                )}
                                <div className="relative group/search">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-uhuru-text-dim group-focus-within/search:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search intelligence..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-slate-900/40 border border-uhuru-border rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-uhuru-text-dim focus:outline-none focus:border-indigo-500/50 w-full sm:w-64 transition-all"
                                    />
                                </div>
                                <span className="text-[10px] text-uhuru-text-dim px-2 py-1 bg-white/5 rounded-full border border-white/5 font-bold whitespace-nowrap">
                                    {history.length} Docs
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {isLoadingHistory ? (
                                <div className="p-12 flex flex-col items-center gap-4 text-uhuru-text-dim">
                                    <Loader2 className="animate-spin" size={24} />
                                    <p className="text-xs font-bold uppercase tracking-widest">Loading Repository...</p>
                                </div>
                            ) : history.filter(d =>
                                d.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (d.strategicInsights?.toLowerCase() || "").includes(searchQuery.toLowerCase())
                            ).length > 0 ? (
                                history
                                    .filter(d =>
                                        d.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        (d.strategicInsights?.toLowerCase() || "").includes(searchQuery.toLowerCase())
                                    )
                                    .map((doc) => {
                                        const analysis = doc.extractedData as any;
                                        const isRelevant = analysis?.isRelevant !== false;
                                        const isSuperseded = (doc as any).isSuperseded === true;

                                        return (
                                            <div
                                                key={doc.id}
                                                onClick={() => toggleSelection(doc.id)}
                                                className={`
                                                group bg-uhuru-card border rounded-3xl p-5 hover:bg-slate-900/40 transition-all relative overflow-hidden cursor-pointer
                                                ${selectedIds.includes(doc.id) ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/50' : !isRelevant ? 'border-rose-500/20 opacity-70' : isSuperseded ? 'border-amber-500/20 opacity-50' : 'border-uhuru-border hover:border-indigo-500/30'}
                                            `}>
                                                <div className="flex items-start gap-4">
                                                    <div className="pt-3">
                                                        <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${selectedIds.includes(doc.id) ? 'bg-indigo-500 border-indigo-500' : 'border-uhuru-border group-hover:border-indigo-500/50'}`}>
                                                            {selectedIds.includes(doc.id) && <Check size={12} className="text-white" />}
                                                        </div>
                                                    </div>
                                                    <div className={`p-3 rounded-2xl flex-shrink-0 ${!isRelevant ? 'bg-rose-500/10 text-rose-400' : isSuperseded ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                                        {!isRelevant ? <ShieldAlert size={20} /> : isSuperseded ? <Clock size={20} /> : <FileText size={20} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0 space-y-2">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <h4 className={`font-bold text-white truncate ${isSuperseded ? 'line-through text-slate-500' : ''}`}>{doc.filename}</h4>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-uhuru-text-dim whitespace-nowrap flex items-center gap-1">
                                                                    <Clock size={10} />
                                                                    {format(new Date(doc.uploadedAt), 'MMM d, p')}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                                                                    className="p-1.5 text-uhuru-text-dim hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100"
                                                                    title="Remove document"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {!isRelevant ? (
                                                                <span className="px-2 py-0.5 bg-rose-500/10 text-[9px] font-black text-rose-400 rounded uppercase tracking-tighter flex items-center gap-1">
                                                                    Irrelevant to Uhuru
                                                                </span>
                                                            ) : isSuperseded ? (
                                                                <span className="px-2 py-0.5 bg-amber-500/10 text-[9px] font-black text-amber-400 rounded uppercase tracking-tighter flex items-center gap-1">
                                                                    Superseded by Newer Doc
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 bg-indigo-500/10 text-[9px] font-black text-indigo-400 rounded uppercase tracking-tighter flex items-center gap-1">
                                                                    <ShieldCheck size={10} />
                                                                    Strategic Context Vetted
                                                                </span>
                                                            )}
                                                            {analysis?.vatLiability?.mustCharge && !isSuperseded && (
                                                                <span className="px-2 py-0.5 bg-amber-500/10 text-[9px] font-black text-amber-400 rounded uppercase tracking-tighter">
                                                                    VAT Impact
                                                                </span>
                                                            )}
                                                        </div>

                                                        {doc.strategicInsights && (
                                                            <p className="text-xs text-uhuru-text-dim leading-relaxed line-clamp-2 italic">
                                                                "{doc.strategicInsights}"
                                                            </p>
                                                        )}

                                                        {!isRelevant && analysis?.irrelevanceReason && (
                                                            <p className="text-[10px] text-rose-400/70 font-medium">
                                                                Reason: {analysis.irrelevanceReason}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className="border-2 border-dashed border-uhuru-border rounded-[2rem] p-12 text-center">
                                    <p className="text-sm text-uhuru-text-dim italic">
                                        {searchQuery ? "No intelligence found matching your query." : "The basket is empty. Feed the intelligence engine."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-uhuru-card border border-uhuru-border rounded-[2rem] p-8 space-y-6 shadow-card sticky top-24">
                        <div className="flex items-center gap-3">
                            <Info size={18} className="text-indigo-400" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Safety & Integrity</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-2">
                                    <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                                    Global Deduplication
                                </div>
                                <p className="text-xs text-uhuru-text-dim leading-relaxed">
                                    Files are hashed (SHA-256). Bit-identical duplicates are caught before they touch your DB.
                                </p>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-2">
                                    <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                                    Relevance Filter
                                </div>
                                <p className="text-xs text-uhuru-text-dim leading-relaxed">
                                    AI rejects documents unrelated to UK business management to maintain a clean Strategic Wall.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-uhuru-border">
                            <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 space-y-2">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Strategic Engine Online</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
