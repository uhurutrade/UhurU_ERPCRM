"use client";

import { useState } from "react";
import { RefreshCw, Sparkles, BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SyncNodeButton() {
    const [isSyncing, setIsSyncing] = useState(false);
    const router = useRouter();

    const handleFullSync = async () => {
        setIsSyncing(true);
        const toastId = toast.loading("Executing Neural Audit...", {
            description: "Synchronizing all company nodes and recalculating compliance..."
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
                    : "No adjustments needed - System at peak precision.";

                toast.success("Intelligence Synchronized", {
                    id: toastId,
                    description: `Neural nodes verified via ${data.provider?.toUpperCase()}. ${changeLog}`
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
                description: "The neural node could not be fully synchronized."
            });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <button
            onClick={handleFullSync}
            disabled={isSyncing}
            className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 text-white rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 overflow-hidden"
        >
            {/* Background glow effect on hover */}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />

            {isSyncing ? (
                <RefreshCw size={20} className="animate-spin" />
            ) : (
                <BrainCircuit size={20} className="group-hover:rotate-12 transition-transform" />
            )}

            <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Strategic Audit</span>
                <span className="text-sm font-bold tracking-tight">Sync Intelligence Node</span>
            </div>

            {!isSyncing && (
                <Sparkles size={14} className="text-white/50 animate-pulse hidden sm:block" />
            )}
        </button>
    );
}
