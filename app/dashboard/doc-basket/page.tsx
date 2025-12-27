"use client";
export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, Info, History, ShieldAlert, ShieldCheck, Clock, Trash2, Search, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { uploadToBasket, getBasketHistory, removeFromBasket, updateDocumentNotes, reprocessDocument } from '@/app/actions/basket';
import { format } from 'date-fns';
import { StandardPagination } from '@/components/invoices/invoices-pagination';

import { useConfirm } from "@/components/providers/modal-provider";

export default function DocBasketPage() {
    const { confirm } = useConfirm();
    const [isUploading, setIsUploading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [modalLang, setModalLang] = useState<'en' | 'es'>('en');
    const [docNotes, setDocNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [isReprocessing, setIsReprocessing] = useState(false);
    const [basketPage, setBasketPage] = useState(1);
    const [basketTotalPages, setBasketTotalPages] = useState(1);
    const [initialNotes, setInitialNotes] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);


    const fetchHistory = async (page = 1) => {
        setIsLoadingHistory(true);
        const res = await getBasketHistory(page);
        if (res.success) {
            setHistory(res.data || []);
            setBasketTotalPages((res as any).totalPages || 1);
            setBasketPage(page);
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
        if (initialNotes.trim()) {
            formData.append('notes', initialNotes);
        }

        try {
            const res = await uploadToBasket(formData);
            if (res.success) {
                toast.success(res.message || `${files.length} documents added to your Strategic Basket`);
                setFiles([]);
                setInitialNotes('');
                fetchHistory();
            } else {
                toast.error(res.error || 'Failed to upload documents');
                if (res.skipped && res.skipped > 0) fetchHistory();
            }
        } catch (err) {
            toast.error('Server error during upload');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: 'Delete Document',
            message: 'Are you sure you want to remove this document? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

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

    const toggleSelection = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        const confirmed = await confirm({
            title: 'Delete Multiple Documents',
            message: `Are you sure you want to remove ${selectedIds.length} documents? This action cannot be undone.`,
            type: 'danger',
            confirmText: `Delete ${selectedIds.length} Docs`,
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        let successCount = 0;
        for (const id of selectedIds) {
            const res = await removeFromBasket(id);
            if (res.success) successCount++;
        }

        toast.success(`${successCount} documents removed`);
        fetchHistory();
    };

    const handleSaveNotes = async () => {
        if (!selectedDoc) return;
        setIsSavingNotes(true);
        const res = await updateDocumentNotes(selectedDoc.id, docNotes);
        if (res.success) {
            toast.success('Intelligence context updated');
            fetchHistory();
            setSelectedDoc({ ...selectedDoc, userNotes: docNotes });
        } else {
            toast.error(res.error || 'Failed to update notes');
        }
        setIsSavingNotes(false);
    };

    const handleReprocess = async () => {
        if (!selectedDoc) return;
        setIsReprocessing(true);
        const res = await reprocessDocument(selectedDoc.id);
        if (res.success) {
            toast.success('Intelligence re-generated with new context');
            const updatedRes = await getBasketHistory();
            if (updatedRes.success && updatedRes.data) {
                setHistory(updatedRes.data);
                const updated = updatedRes.data.find((d: any) => d.id === selectedDoc.id);
                if (updated) setSelectedDoc(updated);
            }
        } else {
            toast.error(res.error || 'Failed to reprocess');
        }
        setIsReprocessing(false);
    };

    const openDocDetail = (doc: any) => {
        setSelectedDoc(doc);
        setDocNotes(doc.userNotes || '');
        setModalLang('en');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Modal de Detalle */}
            {selectedDoc && (
                <div
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto"
                    onClick={() => { setSelectedDoc(null); setModalLang('en'); }}
                >
                    <div
                        className="bg-uhuru-card border border-uhuru-border w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-0 sm:p-8 space-y-6 overflow-y-auto">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
                                        <FileText size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-tight">{selectedDoc.filename}</h3>
                                        <p className="text-xs text-uhuru-text-dim uppercase tracking-widest font-black mt-1">
                                            {selectedDoc.extractedData?.docTopic || "General Intelligence"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={selectedDoc.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-uhuru-text-dim hover:text-white transition-all group"
                                        title="View Original"
                                    >
                                        <Eye size={20} className="group-hover:scale-110 transition-transform" />
                                    </a>
                                    <a
                                        href={selectedDoc.path}
                                        download={selectedDoc.filename}
                                        className="p-3 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-2xl text-indigo-400 transition-all flex items-center gap-2 group"
                                        title="Download Original"
                                    >
                                        <Download size={20} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Download Source</span>
                                    </a>
                                    <button
                                        onClick={() => { setSelectedDoc(null); setModalLang('en'); }}
                                        className="p-3 hover:bg-white/5 rounded-2xl text-uhuru-text-dim hover:text-white transition-all"
                                    >
                                        <AlertCircle size={20} className="rotate-45" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div
                                    onClick={() => setModalLang('en')}
                                    className={`space-y-3 p-6 rounded-3xl border transition-all cursor-pointer relative group ${modalLang === 'en' ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-slate-900/40 border-white/5 opacity-60 hover:opacity-100'}`}
                                >
                                    <div className="absolute top-4 right-4 text-[10px] font-black text-indigo-400/50 uppercase tracking-widest">English</div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Executive Summary</h4>
                                    <p className="text-sm text-slate-300 leading-relaxed ">
                                        {selectedDoc.extractedData?.summaryEN || "No English summary generated for this document."}
                                    </p>
                                </div>
                                <div
                                    onClick={() => setModalLang('es')}
                                    className={`space-y-3 p-6 rounded-3xl border transition-all cursor-pointer relative group ${modalLang === 'es' ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-slate-900/40 border-white/5 opacity-60 hover:opacity-100'}`}
                                >
                                    <div className="absolute top-4 right-4 text-[10px] font-black text-indigo-400/50 uppercase tracking-widest">Español</div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Resumen Ejecutivo</h4>
                                    <p className="text-sm text-slate-300 leading-relaxed ">
                                        {selectedDoc.extractedData?.summaryES || "No se ha generado un resumen en español para este documento."}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-900/60 rounded-3xl border border-uhuru-border/50 animate-in fade-in duration-500" key={modalLang}>
                                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">
                                    {modalLang === 'en' ? 'Strategic Insight' : 'Visión Estratégica'}
                                </h4>
                                <p className="text-sm text-white font-medium leading-relaxed">
                                    {modalLang === 'en'
                                        ? (selectedDoc.extractedData?.strategicInsightEN || selectedDoc.strategicInsights || "Strategic assessment pending deeper analysis.")
                                        : (selectedDoc.extractedData?.strategicInsightES || "Análisis estratégico en español pendiente.")
                                    }
                                </p>
                            </div>

                            <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 space-y-4">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">Additional Context / Notes</h4>
                                <textarea
                                    value={docNotes}
                                    onChange={(e) => setDocNotes(e.target.value)}
                                    placeholder="Add notes to help the AI understand this document's purpose..."
                                    className="w-full bg-slate-900/60 border border-uhuru-border rounded-2xl p-4 text-sm text-white placeholder:text-uhuru-text-dim focus:outline-none focus:border-indigo-500/50 min-h-[100px] transition-all"
                                />
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={handleReprocess}
                                        disabled={isReprocessing || isSavingNotes}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-[10px] font-black text-indigo-400 uppercase tracking-widest rounded-xl transition-all border border-indigo-500/20"
                                    >
                                        <div className="flex items-center gap-2">
                                            {isReprocessing ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                                            {isReprocessing ? 'Analyzing...' : 'Re-Run Intelligence'}
                                        </div>
                                    </button>
                                    <button
                                        onClick={handleSaveNotes}
                                        disabled={isSavingNotes || docNotes === (selectedDoc?.userNotes || '')}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-[10px] font-black text-white uppercase tracking-widest rounded-xl transition-all"
                                    >
                                        {isSavingNotes ? 'Saving...' : 'Update Context'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => { setSelectedDoc(null); setModalLang('en'); }}
                                    className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-white uppercase tracking-widest transition-all"
                                >
                                    {modalLang === 'en' ? 'Close Intelligence' : 'Cerrar Inteligencia'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <Upload size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Feed UhurU AI Engine</h1>
                        <p className="text-uhuru-text-dim mt-1 text-sm lg:text-base">AI-Powered Strategic Document Repository for UK Ltd Compliance.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-10">
                    <div className="space-y-6">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                                relative border-2 border-dashed rounded-[2rem] p-6 lg:p-12 text-center cursor-pointer transition-all duration-500 group overflow-hidden
                                ${files.length > 0 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-uhuru-border hover:border-indigo-500/40 hover:bg-slate-900/40 hover:shadow-2xl'}
                            `}
                        >
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <input
                                type="file"
                                multiple
                                {...({ webkitdirectory: "", directory: "" } as any)}
                                ref={folderInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <div className="relative z-10 flex flex-col items-center gap-6">
                                <div className={`p-6 rounded-full transition-transform duration-500 group-hover:scale-110 ${files.length > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400 ring-4 ring-indigo-500/5'}`}>
                                    <Upload size={32} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white tracking-tight">Feed UhuRu AI Engine</h3>
                                    <p className="text-uhuru-text-dim text-sm max-w-xs mx-auto">
                                        Select individual intelligence docs or entire project folders.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                        className="px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-widest transition-all"
                                    >
                                        Pick Files
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }}
                                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all"
                                    >
                                        Upload Folder
                                    </button>
                                </div>

                                {files.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto p-2">
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

                        {files.length > 0 && (
                            <div className="bg-slate-900/40 border border-uhuru-border rounded-[2rem] p-6 lg:p-8 space-y-4 animate-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                        <Info size={16} />
                                    </div>
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Initial Context / Contexto Inicial</h4>
                                </div>
                                <textarea
                                    value={initialNotes}
                                    onChange={(e) => setInitialNotes(e.target.value)}
                                    placeholder="Escribe aquí el contexto en español para darle inteligencia al RAG (ej: 'Cuentas anuales de 2024', 'Comunicación oficial de HMRC sobre VAT')..."
                                    className="w-full bg-slate-950/60 border border-uhuru-border rounded-2xl p-4 text-sm text-white placeholder:text-uhuru-text-dim focus:outline-none focus:border-indigo-500/50 min-h-[100px] transition-all resize-none shadow-inner"
                                />
                                <p className="text-[10px] text-uhuru-text-dim italic">
                                    * Estas notas se vectorizarán junto con el documento para mejorar la precisión de la IA.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            {files.length > 0 && (
                                <button
                                    onClick={() => setFiles([])}
                                    className="px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest text-uhuru-text-dim hover:text-white transition-all text-center"
                                >
                                    Clear Selection
                                </button>
                            )}
                            <button
                                onClick={handleUpload}
                                disabled={files.length === 0 || isUploading}
                                className={`
                                    flex items-center justify-center gap-2 px-10 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl
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

                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-uhuru-text-dim">
                                <History size={16} />
                                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Intelligence Repository</h2>
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
                            </div>
                        </div>

                        <div className="space-y-3 min-h-[1200px]">
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
                                        const isSuperseded = doc.isSuperseded === true;

                                        return (
                                            <div
                                                key={doc.id}
                                                onClick={() => openDocDetail(doc)}
                                                className={`
                                                group bg-uhuru-card border rounded-3xl p-5 hover:bg-slate-900/40 transition-all relative overflow-hidden cursor-pointer
                                                ${selectedIds.includes(doc.id) ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/50' : !isRelevant ? 'border-rose-500/20 opacity-70' : isSuperseded ? 'border-amber-500/20 opacity-50' : 'border-uhuru-border hover:border-indigo-500/30'}
                                            `}>
                                                <div className="flex items-start gap-4">
                                                    <div className="pt-3">
                                                        <div
                                                            onClick={(e) => toggleSelection(e, doc.id)}
                                                            className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${selectedIds.includes(doc.id) ? 'bg-indigo-500 border-indigo-500' : 'border-uhuru-border hover:border-indigo-500'}`}
                                                        >
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
                                                                <div className="flex items-center gap-1">
                                                                    <a
                                                                        href={doc.path}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="p-1.5 text-uhuru-text-dim hover:text-white transition-colors rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100"
                                                                        title="View Source"
                                                                    >
                                                                        <Eye size={14} />
                                                                    </a>
                                                                    <a
                                                                        href={doc.path}
                                                                        download={doc.filename}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="p-1.5 text-uhuru-text-dim hover:text-indigo-400 transition-colors rounded-lg hover:bg-indigo-500/10 opacity-0 group-hover:opacity-100"
                                                                        title="Download Source"
                                                                    >
                                                                        <Download size={14} />
                                                                    </a>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                                                                        className="p-1.5 text-uhuru-text-dim hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {!isRelevant ? (
                                                                <span className="px-2 py-0.5 bg-rose-500/10 text-[9px] font-black text-rose-400 rounded uppercase tracking-tighter">Irrelevant</span>
                                                            ) : isSuperseded ? (
                                                                <span className="px-2 py-0.5 bg-amber-500/10 text-[9px] font-black text-amber-400 rounded uppercase tracking-tighter">Superseded</span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 bg-indigo-500/10 text-[9px] font-black text-indigo-400 rounded uppercase tracking-tighter flex items-center gap-1">
                                                                    <ShieldCheck size={10} /> Strategic
                                                                </span>
                                                            )}
                                                        </div>
                                                        {doc.strategicInsights && (
                                                            <p className="text-xs text-uhuru-text-dim leading-relaxed line-clamp-1 ">
                                                                "{doc.strategicInsights}"
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : null}

                            {/* Dummy Items to fill 20 slots */}
                            {Array.from({ length: Math.max(0, 20 - history.length) }).map((_, i) => (
                                <div key={`dummy-${i}`} className="p-5 flex items-center gap-4 h-[120px] bg-slate-900/10 border border-uhuru-border/30 rounded-3xl">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800/10" />
                                    <div className="flex-1">
                                        {history.length === 0 && i === 5 && (
                                            <div className="text-center text-uhuru-text-dim ">No documents found in your Strategic Basket.</div>
                                        )}
                                        &nbsp;
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Repository Pagination */}
                    <div className="mt-6 bg-slate-900/20 rounded-2xl border border-uhuru-border overflow-hidden">
                        <StandardPagination
                            currentPage={basketPage}
                            totalPages={basketTotalPages}
                            onPageChange={(p) => fetchHistory(p)}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-uhuru-card border border-uhuru-border rounded-[2rem] p-8 space-y-6 shadow-card sticky top-24">
                        <div className="flex items-center gap-3">
                            <Info size={18} className="text-indigo-400" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Safety & Integrity</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-2">
                                    <div className="w-1 h-1 bg-indigo-400 rounded-full" /> Deduplication
                                </div>
                                <p className="text-xs text-uhuru-text-dim leading-relaxed">Bit-identical and semantic duplicates are caught automatically.</p>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-2">
                                    <div className="w-1 h-1 bg-indigo-400 rounded-full" /> Relevance
                                </div>
                                <p className="text-xs text-uhuru-text-dim leading-relaxed">AI filters out non-business intelligence projects.</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-uhuru-border">
                            <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 space-y-2">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Engine Online</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
