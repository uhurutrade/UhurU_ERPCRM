"use client"

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

    // Sync queue when initialQueue changes
    useState(() => {
        if (initialQueue.length > 0) {
            setQueue(initialQueue);
            setExtractedData(initialQueue[0]);
            setStep("review");
        }
    });

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
        <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
            <DialogContent className="sm:max-w-[700px] bg-uhuru-card border-uhuru-border text-white shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between gap-2 text-xl font-bold">
                        <div className="flex items-center gap-2">
                            <Sparkles className="text-indigo-400" size={24} />
                            {queue.length > 0 ? `Revisión de Gmail (${queueIndex + 1}/${queue.length})` : 'Importación Inteligente'}
                        </div>
                        {extractedData?.language && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded uppercase tracking-tighter">
                                {extractedData.language === 'es' ? 'Español' : 'English'}
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-2">
                    {step === "paste" && (
                        <div className="space-y-4">
                            <p className="text-sm text-uhuru-text-dim">
                                Pega un chat de LinkedIn, una descripción de perfil o un email. Nuestra IA extraerá automáticamente los detalles del contacto y la empresa.
                            </p>
                            <Textarea
                                placeholder="Pega el texto aquí..."
                                className="min-h-[200px] bg-slate-900/50 border-uhuru-border text-white focus:ring-indigo-500"
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                            />
                        </div>
                    )}

                    {step === "analyze" && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="animate-spin text-indigo-400" size={48} />
                            <p className="text-lg font-medium animate-pulse">Analizando contexto bilingüe...</p>
                        </div>
                    )}

                    {step === "review" && extractedData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 overflow-y-auto max-h-[450px] pr-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[11px] uppercase text-uhuru-text-dim">Nombre</Label>
                                        <Input
                                            value={extractedData.contactName || ""}
                                            onChange={(e) => setExtractedData({ ...extractedData, contactName: e.target.value })}
                                            className="bg-slate-900/50 border-uhuru-border h-9"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[11px] uppercase text-uhuru-text-dim">Email</Label>
                                        <Input
                                            value={extractedData.email || ""}
                                            onChange={(e) => setExtractedData({ ...extractedData, email: e.target.value })}
                                            className="bg-slate-900/50 border-uhuru-border h-9"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[11px] uppercase text-uhuru-text-dim">Cargo</Label>
                                        <Input
                                            value={extractedData.role || ""}
                                            onChange={(e) => setExtractedData({ ...extractedData, role: e.target.value })}
                                            className="bg-slate-900/50 border-uhuru-border h-9"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[11px] uppercase text-uhuru-text-dim">Teléfono</Label>
                                        <Input
                                            value={extractedData.phone || ""}
                                            onChange={(e) => setExtractedData({ ...extractedData, phone: e.target.value })}
                                            className="bg-slate-900/50 border-uhuru-border h-9"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] uppercase text-uhuru-text-dim">Empresa / Organización</Label>
                                    <Input
                                        value={extractedData.organizationName || ""}
                                        onChange={(e) => setExtractedData({ ...extractedData, organizationName: e.target.value })}
                                        className="bg-slate-900/50 border-uhuru-border h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] uppercase text-uhuru-text-dim">Sector</Label>
                                    <Input
                                        value={extractedData.organizationSector || ""}
                                        onChange={(e) => setExtractedData({ ...extractedData, organizationSector: e.target.value })}
                                        className="bg-slate-900/50 border-uhuru-border h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] uppercase text-uhuru-text-dim">Resumen lógico (IA)</Label>
                                    <Textarea
                                        value={extractedData.summary || ""}
                                        onChange={(e) => setExtractedData({ ...extractedData, summary: e.target.value })}
                                        className="bg-slate-900/50 border-uhuru-border min-h-[120px] text-sm leading-relaxed"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-900/80 rounded-xl p-4 border border-uhuru-border/50">
                                <Label className="text-[11px] uppercase text-uhuru-text-muted mb-2 block">Texto Original / Contexto</Label>
                                <div className="text-[12px] text-uhuru-text-dim max-h-[400px] overflow-y-auto whitespace-pre-wrap font-mono leading-tight bg-black/20 p-3 rounded-lg border border-uhuru-border/20">
                                    {extractedData.rawText || rawText}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "success" && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                            <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400">
                                <CheckCircle2 size={64} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">¡Proceso Finalizado!</h3>
                                <p className="text-uhuru-text-dim mt-2">
                                    Has importado {importedCount} leads correctamente al CRM.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:justify-between border-t border-uhuru-border pt-4 mt-2">
                    {step === "review" && queue.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleDiscard} className="border-red-500/30 hover:bg-red-500/10 text-red-400">
                                Descartar este
                            </Button>
                        </div>
                    )}

                    <div className="flex gap-2 ml-auto">
                        {step === "paste" && (
                            <>
                                <Button variant="ghost" onClick={reset}>Cancelar</Button>
                                <Button onClick={handleAnalyze} className="bg-indigo-600 hover:bg-indigo-700">
                                    Analizar con IA
                                </Button>
                            </>
                        )}
                        {step === "review" && (
                            <>
                                <Button variant="ghost" onClick={() => queue.length > 0 ? reset() : setStep("paste")}>
                                    {queue.length > 0 ? "Cancelar Todo" : "Volver"}
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                                    {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle2 size={16} className="mr-2" />}
                                    Aprobar y Guardar
                                </Button>
                            </>
                        )}
                        {step === "success" && (
                            <Button onClick={reset} className="bg-indigo-600 hover:bg-indigo-700 w-full">
                                Finalizar
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
