"use client";

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

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- Effects ---
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- Handlers ---
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
                setActiveDocs(prev => [...prev, {
                    id: data.document.id,
                    filename: data.document.filename,
                    uploadedAt: new Date().toISOString(),
                    isProcessed: true
                }]);

                // Notify via chat
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `✅ I have securely indexed **${file.name}**. I can now answer questions based on this document.`
                }]);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to upload document");
        } finally {
            setIsUploading(false);
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
            <div className="flex justify-between items-start">
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
            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">

                {/* LEFT: Chat Interface (60%) */}
                <div className="flex-[3] flex flex-col bg-uhuru-card border border-uhuru-border rounded-2xl overflow-hidden shadow-2xl">
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

                    <div className="p-4 bg-slate-900/50 border-t border-uhuru-border">
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

                {/* RIGHT: Document Vault (40%) */}
                <div className="flex-[2] flex flex-col gap-4 min-w-[300px]">
                    {/* Upload Card */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-6 flex flex-col items-center justify-center text-center relative group overflow-hidden">
                        <div className="absolute inset-0 bg-grid-slate-700/20 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] pointer-events-none" />

                        <div className="relative z-10 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-xl">
                                {isUploading ? (
                                    <Loader2 className="animate-spin text-emerald-400" size={28} />
                                ) : (
                                    <Upload className="text-slate-400 group-hover:text-emerald-400" size={28} />
                                )}
                            </div>
                            <div>
                                <h3 className="text-white font-medium">Secure Upload</h3>
                                <p className="text-slate-400 text-xs mt-1 max-w-[200px] mx-auto">
                                    Tax Documents, Company Submissions, Official Letters
                                </p>
                            </div>

                            <label className="cursor-pointer inline-flex px-6 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-sm font-medium">
                                Select Document
                                <input type="file" className="hidden" onChange={handleFileUpload} />
                            </label>
                        </div>
                    </div>

                    {/* Database View */}
                    <div className="flex-1 bg-uhuru-card border border-uhuru-border rounded-2xl p-4 overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-uhuru-border">
                            <Database size={16} className="text-indigo-400" />
                            <h3 className="text-sm font-semibold text-white">Knowledge Base (VPS)</h3>
                            <span className="ml-auto text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                                {activeDocs.length} Docs
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                            {activeDocs.length === 0 ? (
                                <div className="text-center py-10 text-slate-500">
                                    <p className="text-xs">No documents indexed yet.</p>
                                </div>
                            ) : (
                                activeDocs.map((doc) => (
                                    <div key={doc.id} className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 transition-colors">
                                        <div className="shrink-0 p-2 bg-slate-800 rounded-lg text-indigo-400">
                                            <FileText size={18} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-slate-200 truncate font-medium">{doc.filename}</p>
                                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Indexed • {new Date(doc.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                        <h4 className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">How RAG Works</h4>
                        <p className="text-indigo-200/80 text-xs leading-relaxed">
                            When you ask a question, the system searches these specific documents in your VPS database to find the relevant clauses and figures, then generates a compliant answer.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
