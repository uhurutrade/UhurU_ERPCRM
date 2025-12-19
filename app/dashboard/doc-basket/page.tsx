"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, Info, ArrowRight, MousePointer2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadToBasket } from '@/app/actions/basket';

export default function DocBasketPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            } else {
                toast.error(res.error || 'Failed to upload documents');
            }
        } catch (err) {
            toast.error('Server error during upload');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <Upload size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Upload Doc Basket</h1>
                        <p className="text-uhuru-text-dim mt-1">Nourish the AI with strategic intel, obligations, and valuations.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Upload Zone */}
                <div className="md:col-span-2 space-y-6">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative border-2 border-dashed rounded-[2rem] p-16 text-center cursor-pointer transition-all duration-500 group overflow-hidden
                            ${files.length > 0 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-uhuru-border hover:border-indigo-500/40 hover:bg-slate-900/40 hover:shadow-2xl'}
                        `}
                    >
                        {/* Background flourish */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <div className="relative z-10 flex flex-col items-center gap-6">
                            <div className={`p-6 rounded-full transition-transform duration-500 group-hover:scale-110 ${files.length > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400 ring-4 ring-indigo-500/5'}`}>
                                <Upload size={40} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Drop anything here</h3>
                                <p className="text-uhuru-text-dim text-sm max-w-xs mx-auto">
                                    Contracts, PDF reports, legal notices, or spreadsheets. The more the AI knows, the better it protects Uhuru Trade.
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
                        <button
                            onClick={() => setFiles([])}
                            disabled={files.length === 0 || isUploading}
                            className="px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest text-uhuru-text-dim hover:text-white transition-all disabled:opacity-0"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={files.length === 0 || isUploading}
                            className={`
                                flex items-center gap-2 px-10 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl
                                ${isUploading ? 'bg-slate-800 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:scale-[1.02] active:scale-95'}
                                disabled:opacity-30 disabled:hover:scale-100
                            `}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Feeding AI...
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    Commit to Doc Basket
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-uhuru-card border border-uhuru-border rounded-[2rem] p-8 space-y-6 shadow-card">
                        <div className="flex items-center gap-3">
                            <Info size={18} className="text-indigo-400" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">How it works</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-white uppercase tracking-tight">1. Context Injection</p>
                                <p className="text-xs text-uhuru-text-dim leading-relaxed">
                                    Every document is indexed and served as context for the Uhuru Intelligence engine.
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-white uppercase tracking-tight">2. Deadline Extraction</p>
                                <p className="text-xs text-uhuru-text-dim leading-relaxed">
                                    The system automatically extracts dates, legal obligations, and financial commitments.
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-white uppercase tracking-tight">3. Strategic Alerts</p>
                                <p className="text-xs text-uhuru-text-dim leading-relaxed">
                                    Important findings will appear on your <strong className="text-pink-400">Uhuru Wall</strong> as critical notices.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-uhuru-border">
                            <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 space-y-2">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Suggestion</p>
                                <p className="text-xs text-slate-300 leading-relaxed italic">
                                    "Uploading the latest company valuation and shareholder agreement will help me optimize your tax liability forecasts."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
