"use client"

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { importLeadFromText, commitSmartLeadImport, discardLead } from "@/app/dashboard/crm/actions";
import { toast } from "sonner";

interface SmartImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialQueue?: any[];
}

export function SmartImportModal({ isOpen, onClose, initialQueue = [] }: SmartImportModalProps) {
    const [step, setStep] = useState<"paste" | "analyze" | "review" | "success">("paste");
    const [rawText, setRawText] = useState("");
    const [extractedData, setExtractedData] = useState<any>(null);
    const [queue, setQueue] = useState<any[]>(initialQueue);
    const [matches, setMatches] = useState<any[]>([]);
    const [queueIndex, setQueueIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [importedCount, setImportedCount] = useState(0);

    // Sync queue and matches when initialQueue changes or modal opens
    useEffect(() => {
        if (isOpen && initialQueue && initialQueue.length > 0) {
            setQueue(initialQueue);
            setMatches(new Array(initialQueue.length).fill(null));
            setQueueIndex(0);
            setExtractedData(initialQueue[0]);
            setStep("review");
        } else if (isOpen && (!initialQueue || initialQueue.length === 0)) {
            setStep("paste");
            setQueue([]);
            setMatches([]);
        }
    }, [initialQueue, isOpen]);

    const handleAnalyze = async () => {
        if (!rawText.trim()) return;
        setStep("analyze");
        const result = await importLeadFromText(rawText);
        if (result.success) {
            setExtractedData(result.data);
            setQueue([result.data]);
            setMatches([result.match]);
            setStep("review");
        } else {
            toast.error("AI Analysis Error: " + result.error);
            setStep("paste");
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const currentMatch = matches[queueIndex];
        const dataToCommit = {
            ...extractedData,
            contactId: currentMatch?.contact?.id,
            organizationId: currentMatch?.organization?.id,
        };

        const result = await commitSmartLeadImport(dataToCommit);
        setIsSaving(false);
        if (result.success) {
            setImportedCount(prev => prev + 1);
            if (queue.length > 0 && queueIndex < queue.length - 1) {
                const nextIndex = queueIndex + 1;
                setQueueIndex(nextIndex);
                setExtractedData(queue[nextIndex]);
                toast.success("Lead saved successfully.");
            } else {
                setStep("success");
            }
        } else {
            toast.error("Save Error: " + result.error);
        }
    };

    const handleDiscard = async () => {
        // If it's a Gmail lead, persist the discard so it doesn't show up again
        if (extractedData?.gmailThreadId) {
            await discardLead(extractedData.gmailThreadId, extractedData.contactName);
            toast.info("Lead discarded and omitted for future syncs.");
        }

        if (queue.length > 0 && queueIndex < queue.length - 1) {
            const nextIndex = queueIndex + 1;
            setQueueIndex(nextIndex);
            setExtractedData(queue[nextIndex]);
        } else {
            if (importedCount > 0) setStep("success");
            else reset();
        }
    };

    const reset = () => {
        setStep("paste");
        setRawText("");
        setExtractedData(null);
        setQueue([]);
        setMatches([]);
        setQueueIndex(0);
        setImportedCount(0);
        onClose();
    };

    const currentMatch = matches[queueIndex];

    return (
        <Modal
            isOpen={isOpen}
            onClose={reset}
            title={queue.length > 0 ? `Gmail Review (${queueIndex + 1}/${queue.length})` : 'Intelligent Lead Import'}
            size="lg"
        >
            <div className="space-y-6">
                {step === "paste" && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-400">
                            Paste a LinkedIn chat, profile description, or email. Our AI will automatically extract contact and company details.
                        </p>
                        <textarea
                            placeholder="Paste text here..."
                            className="w-full min-h-[200px] bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none"
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={reset} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleAnalyze}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Sparkles size={16} /> Analyze with AI
                            </button>
                        </div>
                    </div>
                )}

                {step === "analyze" && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                            <Loader2 className="animate-spin text-indigo-400 relative z-10" size={48} />
                        </div>
                        <p className="text-lg font-medium text-white animate-pulse">Analyzing bilingual context...</p>
                        <p className="text-sm text-slate-500">This may take a few seconds</p>
                    </div>
                )}

                {step === "review" && extractedData && (
                    <div className="space-y-6">
                        {/* Status Badges */}
                        <div className="flex gap-2 mb-2">
                            {queue[queueIndex]?.importType === "UPDATE" && (
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/30">
                                    Update Detected
                                </span>
                            )}
                            {currentMatch?.contact && (
                                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-amber-500/30">
                                    Contact in CRM
                                </span>
                            )}
                        </div>

                        {/* duplicate warning / update warning */}
                        {(currentMatch?.contact || currentMatch?.organization || queue[queueIndex]?.importType === "UPDATE") && (
                            <div className={`p-4 ${queue[queueIndex]?.importType === "UPDATE" ? 'bg-blue-500/10 border-blue-500/30' : 'bg-amber-500/10 border-amber-500/30'} border rounded-2xl flex gap-4 animate-in fade-in slide-in-from-top duration-300`}>
                                <div className={`p-2 ${queue[queueIndex]?.importType === "UPDATE" ? 'bg-blue-500/20' : 'bg-amber-500/20'} rounded-xl h-fit`}>
                                    <AlertCircle className={queue[queueIndex]?.importType === "UPDATE" ? 'text-blue-400' : 'text-amber-500'} size={20} />
                                </div>
                                <div className="text-sm">
                                    <p className={`font-bold mb-1 ${queue[queueIndex]?.importType === "UPDATE" ? 'text-blue-200' : 'text-amber-200'}`}>
                                        {queue[queueIndex]?.importType === "UPDATE" ? "Conversation Update Detected" : "Existing Record Detected"}
                                    </p>
                                    <p className={`leading-relaxed ${queue[queueIndex]?.importType === "UPDATE" ? 'text-blue-400/80' : 'text-amber-400/80'}`}>
                                        {queue[queueIndex]?.importType === "UPDATE"
                                            ? "This Gmail thread was already registered, but there are new messages. Saving will update the summary and lead info."
                                            : `Email: ${extractedData.email || 'N/A'}. Saving will update the existing data.`
                                        }
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Name</label>
                                        <input
                                            value={extractedData.contactName || ""}
                                            onChange={(e) => setExtractedData({ ...extractedData, contactName: e.target.value })}
                                            className="w-full h-11 bg-slate-900/50 border border-white/10 rounded-xl px-4 text-white focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Email</label>
                                        <input
                                            value={extractedData.email || ""}
                                            onChange={(e) => setExtractedData({ ...extractedData, email: e.target.value })}
                                            className="w-full h-11 bg-slate-900/50 border border-white/10 rounded-xl px-4 text-white focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Position / Role</label>
                                        <input
                                            value={extractedData.role || ""}
                                            onChange={(e) => setExtractedData({ ...extractedData, role: e.target.value })}
                                            className="w-full h-11 bg-slate-900/50 border border-white/10 rounded-xl px-4 text-white focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Company</label>
                                        <input
                                            value={extractedData.organizationName || ""}
                                            onChange={(e) => setExtractedData({ ...extractedData, organizationName: e.target.value })}
                                            className="w-full h-11 bg-slate-900/50 border border-white/10 rounded-xl px-4 text-white focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Logical Summary (AI)</label>
                                    <textarea
                                        value={extractedData.summary || ""}
                                        onChange={(e) => setExtractedData({ ...extractedData, summary: e.target.value })}
                                        className="w-full h-[180px] bg-slate-900/50 border border-white/10 rounded-xl p-4 text-sm text-slate-300 focus:border-indigo-500 outline-none transition-all resize-none leading-relaxed"
                                    />
                                </div>
                                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertCircle size={14} className="text-indigo-400" />
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">AI Confidence</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 transition-all duration-1000"
                                            style={{ width: `${(extractedData.confidence || 0.5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDiscard}
                                    className="px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    Discard
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => queue.length > 0 ? reset() : setStep("paste")}
                                    className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                                >
                                    {queue.length > 0 ? "Cancel All" : "Back"}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`px-6 py-2.5 ${currentMatch?.contact || queue[queueIndex]?.importType === "UPDATE" ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'} disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2`}
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    {queue.length > 1 && queueIndex < queue.length - 1
                                        ? "Save and Next"
                                        : (currentMatch?.contact || queue[queueIndex]?.importType === "UPDATE" ? "Update and Finish" : "Approve and Finish")
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === "success" && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center animate-in zoom-in duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                            <div className="relative p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400">
                                <CheckCircle2 size={64} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-white tracking-tight">Process Finished!</h3>
                            <p className="text-slate-400 text-lg">
                                You have managed <span className="text-white font-bold">{importedCount}</span> leads successfully.
                            </p>
                        </div>
                        <button
                            onClick={reset}
                            className="w-full max-w-[200px] h-12 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-black text-sm shadow-xl hover:shadow-white/10 transition-all active:scale-95"
                        >
                            Back to CRM
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
