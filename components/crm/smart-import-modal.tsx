"use client"

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { importLeadFromText, commitSmartLeadImport } from "@/app/dashboard/crm/actions";
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
    const [queueIndex, setQueueIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [importedCount, setImportedCount] = useState(0);

    // Sync queue when initialQueue changes or modal opens
    useEffect(() => {
        if (isOpen && initialQueue && initialQueue.length > 0) {
            setQueue(initialQueue);
            setQueueIndex(0);
            setExtractedData(initialQueue[0]);
            setStep("review");
        } else if (isOpen && (!initialQueue || initialQueue.length === 0)) {
            // Reset to paste mode if no queue
            setStep("paste");
            setQueue([]);
        }
    }, [initialQueue, isOpen]);

    const handleAnalyze = async () => {
        if (!rawText.trim()) return;
        setStep("analyze");
        const result = await importLeadFromText(rawText);
        if (result.success) {
            setExtractedData(result.data);
            setStep("review");
        } else {
            toast.error("Error en el análisis de IA: " + result.error);
            setStep("paste");
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await commitSmartLeadImport(extractedData);
        setIsSaving(false);
        if (result.success) {
            setImportedCount(prev => prev + 1);
            if (queue.length > 0 && queueIndex < queue.length - 1) {
                // Move to next in queue
                const nextIndex = queueIndex + 1;
                setQueueIndex(nextIndex);
                setExtractedData(queue[nextIndex]);
                toast.success("Lead importado. Siguiente...");
            } else {
                setStep("success");
                toast.success("¡Importación finalizada!");
            }
        } else {
            toast.error("Error al guardar el lead: " + result.error);
        }
    };

    const handleDiscard = () => {
        if (queue.length > 0 && queueIndex < queue.length - 1) {
            const nextIndex = queueIndex + 1;
            setQueueIndex(nextIndex);
            setExtractedData(queue[nextIndex]);
        } else {
            if (queue.length > 0) {
                setStep("success");
            } else {
                reset();
            }
        }
    };

    const reset = () => {
        setStep("paste");
        setRawText("");
        setExtractedData(null);
        setQueue([]);
        setQueueIndex(0);
        setImportedCount(0);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={reset}
            title={queue.length > 0 ? `Revisión de Gmail (${queueIndex + 1}/${queue.length})` : 'Importación Inteligente de Leads'}
            size="lg"
        >
            <div className="space-y-6">
                {step === "paste" && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-400">
                            Pega un chat de LinkedIn, una descripción de perfil o un email. Nuestra IA extraerá automáticamente los detalles del contacto y la empresa.
                        </p>
                        <textarea
                            placeholder="Pega el texto aquí..."
                            className="w-full min-h-[200px] bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none"
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={reset} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={handleAnalyze}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Sparkles size={16} /> Analizar con IA
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
                        <p className="text-lg font-medium text-white animate-pulse">Analizando contexto bilingüe...</p>
                        <p className="text-sm text-slate-500">Esto puede tardar unos segundos</p>
                    </div>
                )}

                {step === "review" && extractedData && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Nombre</label>
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
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Cargo / Rol</label>
                                        <input
                                            value={extractedData.role || ""}
                                            onChange={(e) => setExtractedData({ ...extractedData, role: e.target.value })}
                                            className="w-full h-11 bg-slate-900/50 border border-white/10 rounded-xl px-4 text-white focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Empresa</label>
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
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Resumen Lógico (IA)</label>
                                    <textarea
                                        value={extractedData.summary || ""}
                                        onChange={(e) => setExtractedData({ ...extractedData, summary: e.target.value })}
                                        className="w-full h-[180px] bg-slate-900/50 border border-white/10 rounded-xl p-4 text-sm text-slate-300 focus:border-indigo-500 outline-none transition-all resize-none leading-relaxed"
                                    />
                                </div>
                                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertCircle size={14} className="text-indigo-400" />
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Confianza IA</span>
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
                                {queue.length > 0 && (
                                    <button
                                        onClick={handleDiscard}
                                        className="px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                        Descartar
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => queue.length > 0 ? reset() : setStep("paste")}
                                    className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                                >
                                    {queue.length > 0 ? "Cancelar Todo" : "Volver"}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    Aprobar y Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === "success" && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                            <div className="relative p-6 bg-emerald-500/10 rounded-full text-emerald-400">
                                <CheckCircle2 size={64} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">¡Proceso Finalizado!</h3>
                            <p className="text-slate-400 max-w-[300px] mx-auto">
                                Has importado {importedCount} leads correctamente al CRM.
                            </p>
                        </div>
                        <button
                            onClick={reset}
                            className="w-full max-w-[200px] h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                        >
                            Cerrar
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
