"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Download, Trash2, ShieldCheck, AlertCircle, FileDown, Trash, CheckSquare, Square, MailOpen, Mail } from "lucide-react";
import { format } from "date-fns";
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
    isRead: boolean;
}

export function NeuralAuditHistory() {
    const [audits, setAudits] = useState<Audit[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const { confirm: systemConfirm } = useConfirm();

    const fetchAudits = async () => {
        try {
            const response = await fetch("/api/neural-audits");
            const data = await response.json();
            setAudits(data);

            // Notify sidebar to update unread count
            window.dispatchEvent(new CustomEvent('unread-audits-updated'));
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
            title: "Delete Audit",
            message: "Are you sure you want to permanently delete this report? This action cannot be undone.",
            type: "danger",
            confirmText: "Delete Forever",
            cancelText: "Cancel"
        });

        if (!ok) return;

        try {
            const response = await fetch(`/api/neural-audits/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success("Audit physically deleted.");
                fetchAudits();
            } else {
                toast.error("Error deleting audit.");
            }
        } catch (error) {
            console.error("Error deleting audit:", error);
            toast.error("Connection error during deletion.");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;

        const ok = await systemConfirm({
            title: "Bulk Deletion",
            message: `Are you sure you want to permanently delete ${selectedIds.size} reports?`,
            type: "danger",
            confirmText: "Clear All",
            cancelText: "Cancel"
        });

        if (!ok) return;

        try {
            const response = await fetch("/api/neural-audits/bulk-delete", {
                method: 'POST',
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });

            if (response.ok) {
                toast.success(`${selectedIds.size} reports deleted.`);
                setSelectedIds(new Set());
                fetchAudits();
            }
        } catch (error) {
            toast.error("Error during bulk deletion.");
        }
    };

    const handleMarkAsRead = async (ids?: string[]) => {
        const targetIds = ids || Array.from(selectedIds);
        if (targetIds.length === 0) return;

        try {
            const response = await fetch("/api/neural-audits/mark-read", {
                method: 'POST',
                body: JSON.stringify({ ids: targetIds })
            });

            if (response.ok) {
                setSelectedIds(new Set());
                fetchAudits();
            }
        } catch (error) {
            toast.error("Error marking as read.");
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === audits.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(audits.map(a => a.id)));
        }
    };

    const parseJustification = (justification: string | null) => {
        if (!justification) return { en: "No strategic logic provided by Neural Consensus.", es: "No strategic logic provided by Neural Consensus." };
        try {
            // Check if it's JSON
            if (justification.startsWith('{')) {
                const parsed = JSON.parse(justification);
                return {
                    en: parsed.en || parsed.analysis_en || justification,
                    es: parsed.es || parsed.analysis_es || ""
                };
            }
            return { en: justification, es: "" };
        } catch {
            return { en: justification, es: "" };
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
        doc.text(format(new Date(audit.timestamp), "PPPPpp"), 70, 72);
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
        const { en, es: esText } = parseJustification(audit.justification);

        // --- English Analysis (Primary) ---
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129);
        doc.setFontSize(13);
        doc.text("STRATEGIC IMPACT ANALYSIS (ENGLISH)", 20, finalY);

        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(0.8);
        doc.line(20, finalY + 2.5, 190, finalY + 2.5);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(9.5);
        const splitEN = doc.splitTextToSize(en, 175);

        let currentY = finalY + 12;
        splitEN.forEach((line: string) => {
            if (currentY > 275) { doc.addPage(); currentY = 20; doc.setFont("helvetica", "normal"); }
            doc.text(line, 20, currentY);
            currentY += 5.5; // Increased line height for legibility
        });

        // --- Spanish Translation (Secondary) ---
        if (esText) {
            currentY += 8;
            if (currentY > 270) { doc.addPage(); currentY = 20; }

            doc.setFont("helvetica", "bold");
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(10);
            doc.text("STRATEGIC SUMMARY (EN)", 20, currentY);

            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.4);
            doc.line(20, currentY + 2, 85, currentY + 2);

            currentY += 10;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(71, 85, 105);
            doc.setFontSize(8); // Explicitly smaller as requested
            const splitES = doc.splitTextToSize(esText, 175);

            splitES.forEach((line: string) => {
                if (currentY > 275) { doc.addPage(); currentY = 20; doc.setFont("helvetica", "normal"); }
                doc.text(line, 20, currentY);
                currentY += 4.5;
            });
        }

        // Watermark on first page only if there is space
        if (currentY < 230) {
            doc.setTextColor(241, 245, 249);
            doc.setFontSize(40);
            doc.setFont("helvetica", "bold");
            doc.text("UHURU ERP", 105, 240, { align: 'center', angle: 45, opacity: 0.1 });
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184); // Slate-400
            doc.setFont("helvetica", "normal");
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
        doc.text("GENERATED ON: " + format(new Date(), "PPPP"), 105, 140, { align: "center" });

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
        toast.success("Full summary generated successfully.");
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
                        <h2 className="text-2xl font-bold text-white tracking-tight">Audit History</h2>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mt-0.5">Autonomous Change Ledger</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {selectedIds.size > 0 && (
                        <>
                            <button
                                onClick={() => handleMarkAsRead()}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl border border-emerald-500/20 text-[10px] uppercase font-black tracking-widest transition-all"
                            >
                                <MailOpen size={14} />
                                Mark as Read ({selectedIds.size})
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-950/40 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl border border-rose-500/20 text-[10px] uppercase font-black tracking-widest transition-all"
                            >
                                <Trash size={14} />
                                Delete ({selectedIds.size})
                            </button>
                        </>
                    )}
                    <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/5 text-[10px] uppercase font-black tracking-widest transition-all"
                    >
                        {selectedIds.size === audits.length ? <CheckSquare size={14} /> : <Square size={14} />}
                        {selectedIds.size === audits.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                        onClick={generateFullSummaryPDF}
                        disabled={audits.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl border border-white/5 text-[10px] uppercase font-black tracking-widest transition-all"
                    >
                        <FileDown size={14} />
                        Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {audits.map((audit) => (
                    <div
                        key={audit.id}
                        onClick={() => !audit.isRead && handleMarkAsRead([audit.id])}
                        className={`group bg-uhuru-card hover:bg-slate-900 transition-all border ${selectedIds.has(audit.id) ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-uhuru-border hover:border-emerald-500/40'} p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden cursor-pointer`}
                    >
                        {/* Status Dot / Unread Indicator */}
                        {!audit.isRead && (
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" title="Unread" />
                        )}

                        <div className="flex items-center gap-4 relative z-10">
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleSelect(audit.id); }}
                                className={`p-1.5 rounded-lg transition-colors ${selectedIds.has(audit.id) ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                            >
                                {selectedIds.has(audit.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                            </button>

                            <div className={`w-12 h-12 rounded-xl bg-slate-800 border ${!audit.isRead ? 'border-emerald-500/50' : 'border-slate-700'} flex flex-col items-center justify-center ${!audit.isRead ? 'text-emerald-400' : 'text-slate-400'} font-bold group-hover:bg-slate-700 transition-colors`}>
                                <span className="text-[10px] text-slate-500">{format(new Date(audit.timestamp), "MMM")}</span>
                                <span className={`text-lg leading-none ${!audit.isRead ? 'font-black scale-110' : ''}`}>{format(new Date(audit.timestamp), "dd")}</span>
                            </div>
                            <div>
                                <h4 className={`text-sm transition-transform ${!audit.isRead ? 'font-black text-white' : 'font-medium text-slate-300'}`}>
                                    {audit.totalChanges} Adjusted Variables
                                </h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                    {audit.provider} • {format(new Date(audit.timestamp), "HH:mm:ss")}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 px-0 sm:px-6 relative z-10">
                            <div className={`bg-slate-950/40 p-3 rounded-xl border border-white/5 ${!audit.isRead ? 'border-emerald-500/30 bg-emerald-500/5' : 'opacity-80'} group-hover:opacity-100 transition-all`}>
                                <p className={`text-[11px] italic line-clamp-2 ${!audit.isRead ? 'text-white font-bold' : 'text-slate-300'}`}>
                                    {parseJustification(audit.justification).en}
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
