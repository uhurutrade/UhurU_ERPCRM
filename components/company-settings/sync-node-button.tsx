"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Sparkles, BrainCircuit, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SyncNodeButton() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleDirty = () => setIsDirty(true);
        const handleSaved = () => setIsDirty(false);

        window.addEventListener('settings-dirty', handleDirty);
        window.addEventListener('settings-saved', handleSaved);

        return () => {
            window.removeEventListener('settings-dirty', handleDirty);
            window.removeEventListener('settings-saved', handleSaved);
        };
    }, []);

    const handleFullSync = async () => {
        setIsSyncing(true);
        const toastId = toast.loading("Executing Neural Audit...", {
            description: "Synchronizing all company nodes and recalculating deadlines..."
        });

        try {
            const response = await fetch("/api/compliance/refresh-dates", {
                method: "POST",
                body: JSON.stringify({ fullSync: true })
            });

            const data = await response.json();

            if (data.success) {
                const changeLog = data.changes && data.changes.length > 0
                    ? `Updated: ${data.changes.join(", ")}.`
                    : "Deadlines verified - No adjustments needed.";

                if (data.success) {
                    toast.success("Intelligence Synchronized", {
                        id: toastId,
                        description: `Dual-AI Consensus: ${data.provider} confirmed.`,
                        duration: 8000
                    });
                    // Wait a bit and refresh
                    setTimeout(() => router.refresh(), 2000);
                } else {
                    throw new Error(data.error || "Neural link failure");
                }
            } catch (error: any) {
                console.error("Sync Error:", error);
                toast.error("Audit Failed", {
                    id: toastId,
                    description: "The neural node could not be fully synchronized.",
                    duration: 8000
                });
            } finally {
                setIsSyncing(false);
            }
        };

        return (
            <button
                onClick={handleFullSync}
                disabled={isSyncing || isDirty}
                className={`group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${isDirty
                    ? 'from-slate-700 to-slate-800 cursor-not-allowed'
                    : 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                    } disabled:opacity-50 text-white rounded-2xl shadow-xl transition-all active:scale-95 overflow-hidden`}
            >
                {/* Background glow effect on hover */}
                {!isDirty && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />}

                {isSyncing ? (
                    <RefreshCw size={20} className="animate-spin" />
                ) : isDirty ? (
                    <AlertTriangle size={20} className="text-amber-400" />
                ) : (
                    <BrainCircuit size={20} className="group-hover:rotate-12 transition-transform" />
                )}

                <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                        {isDirty ? "Action Required" : "Strategic Audit"}
                    </span>
                    <span className="text-sm font-bold tracking-tight">
                        {isDirty ? "Save Settings to Sync" : "Sync Intelligence Node"}
                    </span>
                </div>

                {!isSyncing && !isDirty && (
                    <Sparkles size={14} className="text-white/50 animate-pulse hidden sm:block" />
                )}
            </button>
        );
    }
