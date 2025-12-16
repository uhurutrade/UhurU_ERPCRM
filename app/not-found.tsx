'use client';

import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            <div className="relative z-10 text-center max-w-md mx-auto">
                <div className="mb-8 flex justify-center">
                    <div className="p-6 bg-slate-900/50 rounded-full border border-slate-800 backdrop-blur-sm shadow-2xl shadow-emerald-900/20">
                        <FileQuestion size={64} className="text-emerald-400" />
                    </div>
                </div>

                <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">404</h1>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Page Not Found</h2>

                <p className="text-slate-400 mb-8 leading-relaxed">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/40 hover:-translate-y-0.5"
                    >
                        <Home size={18} />
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all border border-slate-700 hover:border-slate-600"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>
            </div>

            <div className="absolute bottom-8 text-slate-600 text-sm">
                Error Code: 404
            </div>
        </div>
    );
}
