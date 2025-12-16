'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            <div className="relative z-10 text-center max-w-lg mx-auto">
                <div className="mb-8 flex justify-center">
                    <div className="p-6 bg-slate-900/50 rounded-full border border-rose-500/20 backdrop-blur-sm shadow-2xl shadow-rose-900/10">
                        <AlertTriangle size={64} className="text-rose-500" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>

                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 mb-8 text-left max-h-40 overflow-y-auto w-full">
                    <p className="text-rose-400 font-mono text-sm break-all">
                        {error.message || "An unexpected error occurred."}
                    </p>
                    {error.digest && (
                        <p className="text-slate-500 font-mono text-xs mt-2">
                            Digest: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-950 hover:bg-slate-200 rounded-xl font-semibold transition-all shadow-lg hover:-translate-y-0.5"
                    >
                        <RefreshCw size={18} />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all border border-slate-700 hover:border-slate-600"
                    >
                        <Home size={18} />
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
