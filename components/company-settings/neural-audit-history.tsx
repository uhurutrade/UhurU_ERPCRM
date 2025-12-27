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
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalAudits, setTotalAudits] = useState(0);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [allSelectedInDB, setAllSelectedInDB] = useState(false);
    const { confirm: systemConfirm } = useConfirm();

    const fetchAudits = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/neural-audits?page=${page}&limit=20`);
            const data = await response.json();

            if (data.audits) {
                setAudits(data.audits);
                setTotalPages(data.totalPages);
                setTotalAudits(data.total);
            } else {
                setAudits(data);
                setTotalPages(1);
                setTotalAudits(data.length);
            }

            window.dispatchEvent(new CustomEvent('unread-audits-updated'));
        } catch (error) {
            console.error("Error fetching audits:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAudits();
    }, [page]);

    useEffect(() => {
        const handleSync = () => fetchAudits();
        window.addEventListener('settings-saved', handleSync);
        return () => window.removeEventListener('settings-saved', handleSync);
    }, []);

    const handleDelete = async (id: string) => {
        const ok = await systemConfirm({
            title: "Delete Audit",
            message: "Are you sure you want to permanently delete this report?",
            type: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!ok) return;

        try {
            const response = await fetch(`/api/neural-audits/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success("Audit deleted.");
                fetchAudits();
            }
        } catch (error) {
            toast.error("Error deleting audit.");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;

        const ok = await systemConfirm({
            title: "Bulk Deletion",
            message: `Delete ${selectedIds.size} reports permanently?`,
            type: "danger",
            confirmText: "Clear All",
            cancelText: "Cancel"
        });

        if (!ok) return;

        try {
            const response = await fetch("/api/neural-audits/bulk-delete", {
                method: 'POST',
                body: JSON.stringify({
                    ids: allSelectedInDB ? 'ALL' : Array.from(selectedIds)
                })
            });

            if (response.ok) {
                toast.success(allSelectedInDB ? "All reports deleted." : `${selectedIds.size} reports deleted.`);
                setSelectedIds(new Set());
                setAllSelectedInDB(false);
                setPage(1);
                fetchAudits();
            }
        } catch (error) {
            toast.error("Error during bulk deletion.");
        }
    };

    const handleMarkAsRead = async (ids?: string[]) => {
        const targetIds = ids || Array.from(selectedIds);
        if (targetIds.length === 0 && !allSelectedInDB) return;

        try {
            const response = await fetch("/api/neural-audits/mark-read", {
                method: 'POST',
                body: JSON.stringify({
                    ids: allSelectedInDB ? [] : targetIds,
                    all: allSelectedInDB
                })
            });

            if (response.ok) {
                setSelectedIds(new Set());
                setAllSelectedInDB(false);
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
        if (selectedIds.size === audits.length || allSelectedInDB) {
            setSelectedIds(new Set());
            setAllSelectedInDB(false);
        } else {
            setSelectedIds(new Set(audits.map(a => a.id)));
        }
    };

    const selectEntireDatabase = () => {
        setAllSelectedInDB(true);
        setSelectedIds(new Set(audits.map(a => a.id)));
    };

    const parseJustification = (justification: string | null) => {
        if (!justification) return { en: "No strategic logic provided.", es: "" };
        try {
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

        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 50, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("NEURAL AUDIT REPORT", 20, 25);

        doc.setFontSize(9);
        doc.text("SECURITY ID: NA-" + audit.id.slice(-6).toUpperCase(), 20, 35);

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, 60, 180, 40, 3, 3, "F");

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(10);
        doc.text(`Timestamp: ${format(new Date(audit.timestamp), "PPPPpp")}`, 25, 75);
        doc.text(`Provider: ${audit.provider}`, 25, 85);

        const { en, es } = parseJustification(audit.justification);

        doc.setTextColor(16, 185, 129);
        doc.setFontSize(14);
        doc.text("ANALYSIS", 20, 120);

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        const splitEN = doc.splitTextToSize(en, 175);
        doc.text(splitEN, 20, 130);

        doc.save(filename);
    };

    const generateFullSummaryPDF = () => {
        const doc = new jsPDF() as any;
        const tableData = audits.map(a => [
            format(new Date(a.timestamp), "yyyy-MM-dd HH:mm"),
            a.changeLog || "No Changes",
            a.status
        ]);

        autoTable(doc, {
            head: [["Date", "Action", "Status"]],
            body: tableData,
            headStyles: { fillColor: [15, 23, 42] },
        });

        doc.save(`Audit_Summary_${format(new Date(), "yyyyMMdd")}.pdf`);
    };

    if (loading) return (
        <div className="animate-pulse flex items-center justify-center p-20">
            <BrainCircuit className="text-emerald-500 animate-spin" size={40} />
        </div>
    );

    if (audits.length === 0) return null;

    return (
        <section className="mt-12 space-y-4 max-w-3xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                        <BrainCircuit size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Neural Audit</h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Control de Cambios</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {selectedIds.size > 0 && (
                        <>
                            <button onClick={() => handleMarkAsRead()} className="p-2 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-500/20 text-[10px] font-bold transition-all">
                                <MailOpen size={14} className="inline mr-1" /> READ ({selectedIds.size})
                            </button>
                            <button onClick={handleBulkDelete} className="p-2 bg-rose-950/40 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-500/20 text-[10px] font-bold transition-all">
                                <Trash size={14} className="inline mr-1" /> DELETE
                            </button>
                        </>
                    )}
                    <button onClick={toggleSelectAll} className="p-2 bg-slate-800 text-white rounded-lg text-[10px] font-bold">
                        {selectedIds.size === audits.length ? 'DESELECT' : 'SELECT ALL'}
                    </button>
                    <button onClick={generateFullSummaryPDF} className="p-2 bg-slate-800 text-white rounded-lg text-[10px] font-bold">
                        <FileDown size={14} />
                    </button>
                </div>
            </div>

            {audits.length > 0 && selectedIds.size === audits.length && !allSelectedInDB && totalAudits > audits.length && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg text-center">
                    <button onClick={selectEntireDatabase} className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest hover:underline">
                        Select all {totalAudits} reports in history
                    </button>
                </div>
            )}

            {allSelectedInDB && (
                <div className="bg-emerald-500 p-2 rounded-lg text-center shadow-lg">
                    <p className="text-white text-[10px] font-bold">All {totalAudits} reports selected.</p>
                </div>
            )}

            <div className="space-y-2">
                {audits.map((audit) => {
                    const { en, es } = parseJustification(audit.justification);
                    return (
                        <div
                            key={audit.id}
                            onClick={() => !audit.isRead && handleMarkAsRead([audit.id])}
                            className={`group bg-uhuru-card border ${selectedIds.has(audit.id) ? 'border-emerald-500 bg-emerald-500/5' : 'border-uhuru-border hover:border-emerald-500/30'} p-3 rounded-xl flex items-start gap-3 relative transition-all cursor-pointer`}
                        >
                            {!audit.isRead && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                            )}

                            <div className="flex items-center h-full pt-1">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleSelect(audit.id); }}
                                    className={`p-1 rounded transition-colors ${selectedIds.has(audit.id) ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-600'}`}
                                >
                                    {selectedIds.has(audit.id) ? <CheckSquare size={12} /> : <Square size={12} />}
                                </button>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase">{format(new Date(audit.timestamp), "dd MMM HH:mm")}</span>
                                        <h4 className={`text-xs truncate ${!audit.isRead ? 'font-bold text-white' : 'text-slate-400'}`}>
                                            {audit.changeLog}
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); generatePDF(audit); }} className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-white"><Download size={14} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(audit.id); }} className="p-1.5 hover:bg-rose-900/40 rounded text-slate-500 hover:text-rose-400"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className={`text-[11px] leading-snug ${!audit.isRead ? 'text-slate-200' : 'text-slate-500'}`}>
                                        {en}
                                    </p>
                                    {es && (
                                        <p className="text-[10px] text-slate-600 italic leading-snug border-t border-white/5 pt-1">
                                            {es}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-6">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-slate-800 disabled:opacity-30 text-white rounded text-[10px] font-bold">PREV</button>
                    <span className="text-[10px] text-slate-500 px-4">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 bg-slate-800 disabled:opacity-30 text-white rounded text-[10px] font-bold">NEXT</button>
                </div>
            )}
        </section>
    );
}
