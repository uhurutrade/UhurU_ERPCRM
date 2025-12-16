import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                    <Loader2 size={48} className="text-emerald-400 animate-spin relative z-10" />
                </div>
                <p className="mt-4 text-slate-400 text-sm font-medium animate-pulse">Loading...</p>
            </div>
        </div>
    );
}
