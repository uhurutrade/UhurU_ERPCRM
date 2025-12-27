"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Download, Trash2, ShieldCheck, AlertCircle, FileDown, Trash } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useConfirm } from "@/components/providers/modal-provider";

interface Audit {
    id: string;
    timestamp: string;
    provider: string;
    changeLog: string | null;
    justification: string | null;
    totalChanges: number;
    status: string;
}

export function NeuralAuditHistory() {
    const [audits, setAudits] = useState<Audit[]>([]);
    const [loading, setLoading] = useState(true);
    const { confirm: systemConfirm } = useConfirm();

    const fetchAudits = async () => {
        try {
            const response = await fetch("/api/neural-audits");
            const data = await response.json();
            setAudits(data);
        } catch (error) {
            console.error("Error fetching audits:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAudits();

        const handleSync = () => fetchAudits();
        window.addEventListener('settings-saved', handleSync);
        return () => window.removeEventListener('settings-saved', handleSync);
    }, []);

    const handleDelete = async (id: string) => {
        const ok = await systemConfirm({
            title: "Eliminar Auditoría",
            message: "¿Estás seguro de que deseas eliminar este reporte de forma definitiva? Esta acción no se puede deshacer.",
            type: "danger",
            confirmText: "Eliminar para siempre",
            cancelText: "Cancelar"
        });

        if (!ok) return;

        try {
            const response = await fetch(`/api/neural-audits/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success("Auditoría eliminada físicamente.");
                fetchAudits();
            } else {
                toast.error("Error al eliminar la auditoría.");
            }
        } catch (error) {
            console.error("Error deleting audit:", error);
            toast.error("Error de conexión al eliminar.");
        }
    };

    const handleClearAll = async () => {
        const ok = await systemConfirm({
            title: "PURGAR HISTORIAL COMPLETO",
            message: "¡ALERTA DE SEGURIDAD! Estás a punto de borrar ABSOLUTAMENTE TODO el historial de inteligencia. Esta acción limpiará la base de datos de forma física e irreversible.",
            type: "danger",
            confirmText: "PURGAR TODO EL SISTEMA",
            cancelText: "Abortar"
        });

        if (!ok) return;

        try {
            const response = await fetch("/api/neural-audits/clear-all", {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success("Historial purgado con éxito.");
                fetchAudits();
            } else {
                toast.error("Error al purgar el historial.");
            }
        } catch (error) {
            console.error("Error clearing audits:", error);
            toast.error("Error crítico de red.");
        }
    };

    const generatePDF = (audit: Audit) => {
        const doc = new jsPDF() as any;
        const timestampStr = format(new Date(audit.timestamp), "yyyyMMdd_HHmm");
        const filename = `NeuralAudit_${timestampStr}.pdf`;

        // Style Settings
        const primaryColor = [16, 185, 129]; // Emerald-500

        // Header
        doc.setFillColor(15, 23, 42); // Slate-950
        doc.rect(0, 0, 210, 50, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(26);
        doc.setFont("helvetica", "bold");
        doc.text("NEURAL AUDIT REPORT", 20, 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("UHURU ERP SYSTEM • AUTONOMOUS INTELLIGENCE UNIT • SECURITY ID: NA-" + audit.id.slice(-6).toUpperCase(), 20, 35);

        // Badge
        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(0.5);
        doc.roundedRect(160, 15, 35, 12, 2, 2, "S");
        doc.setTextColor(16, 185, 129);
        doc.setFontSize(8);
        doc.text("CERTIFIED", 170, 23);

        // Audit Meta Box
        doc.setFillColor(248, 250, 252); // Slate-50
        doc.roundedRect(15, 60, 180, 45, 3, 3, "F");

        doc.setTextColor(51, 65, 85); // Slate-700
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Audit Timestamp:", 25, 72);
        doc.text("IA Providers:", 25, 82);
        doc.text("Sync Result:", 25, 92);

        doc.setFont("helvetica", "normal");
        doc.text(format(new Date(audit.timestamp), "PPPPpp", { locale: es }), 70, 72);
        doc.text(audit.provider, 70, 82);
        doc.text(`${audit.totalChanges} changes detected - STATUS: ${audit.status}`, 70, 92);

        // Changes Section
        doc.setTextColor(16, 185, 129); // Emerald
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("MODIFICATIONS LOG", 20, 120);

        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.line(20, 123, 190, 123);

        const changeLabels = (audit.changeLog || "").split(", ");
        const tableData = changeLabels.map(label => [label, "AI Adjusted", "Regulatory Compliance"]);

        autoTable(doc, {
            startY: 130,
            head: [["Affected Field", "Action", "Context"]],
            body: tableData,
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            styles: { fontSize: 9, cellPadding: 4 }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 20;

        // Justification Section (Bilingual Deep Logic)
        doc.setTextColor(16, 185, 129);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("STRATEGIC JUSTIFICATION & LOGIC", 20, finalY);
        doc.setFontSize(10);
        doc.text("JUSTIFICACIÓN ESTRATÉGICA Y LÓGICA DE NEGOCIO", 20, finalY + 7);

        doc.setDrawColor(16, 185, 129);
        doc.line(20, finalY + 10, 190, finalY + 10);

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const splitText = doc.splitTextToSize(audit.justification || "No justification provided.", 175);

        let textY = finalY + 18;
        splitText.forEach((line: string) => {
            if (textY > 260) {
                doc.addPage();
                textY = 20;
            }
            doc.text(line, 20, textY);
            textY += 5;
        });

        // Watermark
        doc.setTextColor(241, 245, 249);
        doc.setFontSize(40);
        doc.setFont("helvetica", "bold");
        doc.text("UHURU ERP", 105, 240, { align: 'center', angle: 45, opacity: 0.1 });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184); // Slate-400
            doc.text(`Certified by UhurU Neural Engine Core v1.0 • Secure Ledger Hash: 0x${audit.id.slice(0, 12)}... • Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
        }

        doc.save(filename);
    };

    const generateFullSummaryPDF = () => {
        const doc = new jsPDF() as any;
        const filename = `Intelligence_Summary_${format(new Date(), "yyyyMMdd")}.pdf`;

        // Title Page
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 297, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(36);
        doc.setFont("helvetica", "bold");
        doc.text("INTELLIGENCE HUB", 105, 100, { align: "center" });

        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text("Strategic Audit Summary Ledger", 105, 115, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(16, 185, 129);
        doc.text("GENERATE ON: " + format(new Date(), "PPPP", { locale: es }), 105, 140, { align: "center" });

        doc.addPage();

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Complete Audit Trail", 20, 20);
        doc.line(20, 23, 190, 23);

        const tableData = audits.map(a => [
            format(new Date(a.timestamp), "yyyy-MM-dd HH:mm"),
            a.provider,
            a.changeLog || "No Changes",
            a.status
        ]);

        autoTable(doc, {
            startY: 30,
            head: [["Date", "Providers", "Changes", "Status"]],
            body: tableData,
            headStyles: { fillColor: [15, 23, 42] },
            styles: { fontSize: 8 }
        });

        doc.save(filename);
        toast.success("Resumen completo generado con éxito.");
    };

    if (loading) return (
        <div className="animate-pulse flex items-center gap-4 p-8 bg-slate-900/40 rounded-2xl border border-white/5">
            <BrainCircuit className="text-slate-700 animate-spin" />
            <div className="space-y-2">
                <div className="h-4 w-48 bg-slate-800 rounded"></div>
                <div className="h-3 w-32 bg-slate-800 rounded"></div>
            </div>
        </div>
    );

    if (audits.length === 0) return null;

    return (
        <section className="mt-12 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <BrainCircuit size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Historial de Auditorías</h2>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mt-0.5">Control de Cambios Autónomos</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={generateFullSummaryPDF}
                        disabled={audits.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl border border-white/5 text-[10px] uppercase font-black tracking-widest transition-all"
                    >
                        <FileDown size={14} />
                        Exportar Todo
                    </button>
                    <button
                        onClick={handleClearAll}
                        disabled={audits.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-950/40 hover:bg-rose-600 disabled:opacity-50 text-rose-400 hover:text-white rounded-xl border border-rose-500/20 text-[10px] uppercase font-black tracking-widest transition-all"
                    >
                        <Trash size={14} />
                        Purgar Historial
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {audits.map((audit) => (
                    <div
                        key={audit.id}
                        className="group bg-uhuru-card hover:bg-slate-900 transition-all border border-uhuru-border hover:border-emerald-500/40 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-emerald-400 font-bold group-hover:bg-slate-700 transition-colors">
                                <span className="text-[10px] text-slate-500">{format(new Date(audit.timestamp), "MMM")}</span>
                                <span className="text-lg leading-none">{format(new Date(audit.timestamp), "dd")}</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white group-hover:translate-x-1 transition-transform">
                                    {audit.totalChanges} Variables Ajustadas
                                </h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                    {audit.provider} • {format(new Date(audit.timestamp), "HH:mm:ss", { locale: es })}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 px-0 sm:px-6 relative z-10">
                            <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 opacity-80 group-hover:opacity-100 transition-all">
                                <p className="text-[11px] text-slate-300 italic line-clamp-2">
                                    {audit.justification}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 relative z-10">
                            <div className="flex flex-wrap gap-2 sm:mr-4">
                                {(audit.changeLog || "").split(", ").map((c, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-slate-800 border border-white/5 rounded-md text-[9px] font-bold text-slate-400 whitespace-nowrap">
                                        {c}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => generatePDF(audit)}
                                    className="flex items-center gap-2 bg-slate-950 hover:bg-emerald-600 border border-white/10 hover:border-emerald-500 p-3 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg active:scale-90"
                                    title="Download Audit PDF"
                                >
                                    <Download size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest sm:hidden">Report</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(audit.id)}
                                    className="flex items-center gap-2 bg-slate-950 hover:bg-rose-600 border border-white/10 hover:border-rose-500 p-3 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg active:scale-90"
                                    title="Delete Audit"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
