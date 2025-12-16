'use client';

import { useEffect } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Inter } from 'next/font/google';
import './globals.css'; // Ensure styling is available

const inter = Inter({ subsets: ['latin'] });

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-white">
                    {/* Background Effects */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
                    </div>

                    <div className="relative z-10 text-center max-w-lg mx-auto">
                        <div className="mb-6 flex justify-center">
                            <div className="p-6 bg-slate-900/80 rounded-full border border-slate-700">
                                <AlertOctagon size={64} className="text-indigo-400" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold mb-4">Critical Error</h1>
                        <p className="text-slate-400 mb-8">
                            A critical error occurred in the application root layout.
                        </p>

                        <button
                            onClick={() => reset()}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all"
                        >
                            <RefreshCw size={20} />
                            Reload Application
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
