"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface AIStatus {
    provider: string;
    model: string;
    status: "online" | "offline";
    message: string;
}

export function AIStatusBadge({ forcedProvider }: { forcedProvider?: string }) {
    const [status, setStatus] = useState<AIStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const checkStatus = async () => {
        setLoading(true);
        try {
            const url = forcedProvider ? `/api/ai-status?provider=${forcedProvider}` : "/api/ai-status";
            const res = await fetch(url, { cache: 'no-store' });
            const data = await res.json();
            setStatus(data);
        } catch (error) {
            setStatus({
                provider: "unknown",
                model: "N/A",
                status: "offline",
                message: "Network Error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, [forcedProvider]);

    if (loading) {
        return (
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-xl border border-white/5 animate-pulse">
                <Loader2 className="animate-spin text-slate-500" size={14} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verifying Neural Core...</span>
            </div>
        );
    }

    if (!status) return null;

    const isOnline = status.status === "online";

    return (
        <button
            onClick={checkStatus}
            disabled={loading}
            className={`group relative flex flex-col items-center justify-center px-4 py-2 rounded-xl border transition-all duration-500 hover:scale-105 active:scale-95 ${isOnline
                ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] text-emerald-400"
                : "bg-rose-500/5 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)] text-rose-400"
                }`}
        >
            <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
                    {isOnline && (
                        <div className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                    )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                    System {isOnline ? "Online" : "Offline"}
                </span>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                    {status.provider} •
                </span>
                <span className="text-[8px] font-mono text-indigo-400 font-medium">
                    {status.model}
                </span>
            </div>

            {/* Tooltip on hover if offline */}
            {!isOnline && status.message && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-900 border border-slate-800 rounded-lg text-[9px] text-slate-400 z-50 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl">
                    {status.message}
                </div>
            )}
        </button>
    );
}
