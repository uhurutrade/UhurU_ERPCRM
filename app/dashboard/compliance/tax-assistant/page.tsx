"use client";

import { useConfirm } from "@/components/providers/modal-provider";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Bot, ArrowRight, ShieldCheck, Sparkles, Send, X, AlertCircle, Loader2, Database, Trash2 } from "lucide-react";
import Link from "next/link";

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

type Document = {
    id: string;
    filename: string;
    uploadedAt: string;
    isProcessed: boolean;
};

export default function TaxAssistantPage() {
    // --- State ---
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I am your Compliance AI. I have access to the secure vault of documents you upload here. \n\nUpload your past tax returns or HMRC letters, and I will analyze them to prepare your next obligations." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // DB synced state
    const [activeDocs, setActiveDocs] = useState<Document[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { confirm } = useConfirm();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filtered docs
    const filteredDocs = activeDocs.filter(doc =>
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- Effects ---
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch docs on load
    useEffect(() => {
        fetch('/api/compliance/documents', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setActiveDocs(data);
            })
            .catch(console.error);
    }, []);

    // --- Handlers ---
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        const confirmed = await confirm({
            title: "Delete Document",
            message: "Are you sure you want to permanently delete this document? This action cannot be undone.",
            type: "danger",
            confirmText: "Delete",
            cancelText: "Keep Document"
        });

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/compliance/documents?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setActiveDocs(prev => prev.filter(d => d.id !== id));
            }
        } catch (error) {
            alert("Failed to delete");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/compliance/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                // Add to visible list
                setActiveDocs(prev => [{
                    id: data.document.id,
                    filename: data.document.filename,
                    uploadedAt: data.document.uploadedAt || new Date().toISOString(),
                    isProcessed: true
                }, ...prev]);

                // Notify via chat
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `✅ I have securely indexed **${file.name}**. I can now answer questions based on this document.`
                }]);
            } else {
                alert(`Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to upload document: Network error");
        } finally {
            setIsUploading(false);
            // Reset input so same file can be selected again
            e.target.value = '';
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/compliance/ai-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    contextFiles: activeDocs.map(d => d.filename) // Send filenames as context reference
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error && data.error.includes("API Key")) {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: "⚠️ **Configuration Required**: Please add `OPENAI_API_KEY` to your `.env` file."
                    }]);
                } else {
                    setMessages(prev => [...prev, { role: 'assistant', content: "Error: " + data.error }]);
                }
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            }

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] max-w-7xl mx-auto p-4 md:p-6 animate-in fade-in duration-500 flex flex-col gap-6">

            {/* Header */}
            <div className="flex justify-between items-start shrink-0">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                        <Bot className="text-emerald-400" size={32} />
                        AI Tax Assistant (RAG)
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Upload historical declarations & HMRC letters. Data is stored in your private VPS.
                    </p>
                </div>
                <Link href="/dashboard/compliance" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <X size={24} />
                </Link>
            </div>

            {/* Split Layout */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">

                {/* LEFT: Chat Interface (Stretched) */}
                <div className="flex-[4] flex flex-col bg-uhuru-card border border-uhuru-border rounded-2xl overflow-hidden shadow-2xl min-h-0">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                                        <Bot size={16} className="text-white" />
                                    </div>
                                )}
                                <div className={`
                                    max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg
                                    ${msg.role === 'user'
                                        ? 'bg-emerald-600 text-white rounded-tr-none'
                                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                    }
                                `}>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                    <Loader2 className="animate-spin text-emerald-400" size={16} />
                                </div>
                                <span className="text-slate-500 text-xs self-center">Processing with RAG...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-slate-900/50 border-t border-uhuru-border shrink-0">
                        <form onSubmit={handleSendMessage} className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your tax position..."
                                className="w-full bg-slate-800 border-none rounded-xl py-4 pl-4 pr-14 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50"
                                disabled={isLoading}
                            />
                            <button type="submit" className="absolute right-2 top-2 p-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-colors">
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT: Document Vault (Compact) */}
                <div className="flex-[1.5] flex flex-col gap-3 min-w-[300px] h-full min-h-0">
                    {/* Upload Card - Now very compact */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-3 flex flex-row items-center gap-4 relative group shrink-0">
                        <div className="absolute inset-0 bg-grid-slate-700/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] pointer-events-none" />

                        <div className="relative z-10 w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shrink-0">
                            {isUploading ? (
                                <Loader2 className="animate-spin text-emerald-400" size={18} />
                            ) : (
                                <Upload className="text-slate-400 group-hover:text-emerald-400" size={18} />
                            )}
                        </div>

                        <div className="relative z-10 flex-1 min-w-0">
                            <h3 className="text-white text-xs font-semibold">Secure Upload</h3>
                            <p className="text-slate-500 text-[9px] truncate">
                                Tax Docs & CMR Letters
                            </p>
                        </div>

                        <label className="relative z-10 cursor-pointer px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-bold shrink-0">
                            {isUploading ? "Uploading..." : "Select"}
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>

                    {/* Database View (Extended to Bottom) */}
                    <div className="flex-1 bg-uhuru-card border border-uhuru-border rounded-xl p-3 overflow-hidden flex flex-col min-h-0 relative">
                        {/* Header with Search */}
                        <div className="flex flex-col gap-2 mb-3 shrink-0">
                            <div className="flex items-center gap-2 pb-2 border-b border-uhuru-border">
                                <Database size={14} className="text-indigo-400" />
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Knowledge Base</h3>
                                <span className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                                    {filteredDocs.length}
                                </span>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1.5 scrollbar-thin bg-black/10 rounded-lg p-1.5 min-h-0">
                            {filteredDocs.length === 0 ? (
                                <div className="text-center py-6 text-slate-500">
                                    <p className="text-[10px]">Empty vault.</p>
                                </div>
                            ) : (
                                filteredDocs.map((doc) => (
                                    <div key={doc.id} className="group flex items-center gap-2 p-2 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-emerald-500/30 hover:bg-slate-800 transition-all shrink-0">
                                        <div className="shrink-0 p-1.5 bg-slate-700/30 rounded text-emerald-400">
                                            <FileText size={14} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-slate-200 truncate font-medium group-hover:text-white">{doc.filename}</p>
                                            <div className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                <span className="w-1 h-1 rounded-full bg-emerald-500/80 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                                                {new Date(doc.uploadedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(doc.id, e)}
                                            className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/5 rounded transition-all opacity-0 group-hover:opacity-100"
                                            title="Delete"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
