"use client";

import { useEffect, useState } from "react";
import { Loader2, Activity, ShieldAlert, CheckCircle2 } from "lucide-react";

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

    const isOnline = status?.status === "online";

    return (
        <div className="flex flex-col items-end gap-1">
            <div
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-500
                    ${isOnline
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                    }
                `}
                onClick={checkStatus}
                title={status?.message}
            >
                {isOnline ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    SYSTEM {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
                <span className="flex h-2 w-2 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                </span>
            </div>

            {status && (
                <div className="flex items-center gap-2 px-2">
                    <Activity size={10} className={isOnline ? "text-emerald-500" : "text-rose-500"} />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                        {status.provider} • {status.model}
                    </span>
                </div>
            )}
        </div>
    );
}
