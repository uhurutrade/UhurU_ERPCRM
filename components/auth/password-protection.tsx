'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle } from 'lucide-react';

// Obfuscated for basic security in source code
// Decodes to '12345678'
const _hashed = 'MTIzNDU2Nzg=';
const getSecret = () => {
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_CRM_PASSWORD) {
        return process.env.NEXT_PUBLIC_CRM_PASSWORD;
    }
    try { return typeof window !== 'undefined' ? atob(_hashed) : ''; }
    catch (e) { return ''; }
};
const CORRECT_PASSWORD = getSecret();
const MAX_ATTEMPTS = 3;

export default function PasswordProtection({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [password, setPassword] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if already unlocked in this session
        const unlocked = sessionStorage.getItem('crm_unlocked');
        if (unlocked === 'true') {
            setIsUnlocked(true);
        }

        // Check if blocked
        const blockData = localStorage.getItem('crm_block');
        if (blockData) {
            const { until, attempts: savedAttempts } = JSON.parse(blockData);
            const now = Date.now();

            if (now < until) {
                setIsBlocked(true);
                setAttempts(savedAttempts);
                setRemainingTime(Math.ceil((until - now) / 1000));
            } else {
                localStorage.removeItem('crm_block');
            }
        }
    }, []);

    useEffect(() => {
        if (isBlocked && remainingTime > 0) {
            const timer = setInterval(() => {
                setRemainingTime(prev => {
                    if (prev <= 1) {
                        setIsBlocked(false);
                        localStorage.removeItem('crm_block');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isBlocked, remainingTime]);

    const calculateBlockTime = (attemptCount: number) => {
        if (attemptCount === MAX_ATTEMPTS) return 30 * 1000; // 30 seconds
        if (attemptCount === MAX_ATTEMPTS + 1) return 60 * 1000; // 1 minute
        return Math.pow(2, attemptCount - MAX_ATTEMPTS) * 60 * 1000; // Exponential: 2min, 4min, 8min...
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isBlocked) return;

        if (password === CORRECT_PASSWORD) {
            sessionStorage.setItem('crm_unlocked', 'true');
            setIsUnlocked(true);
            setError('');
            router.push('/dashboard');
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setPassword('');

            if (newAttempts >= MAX_ATTEMPTS) {
                const blockTime = calculateBlockTime(newAttempts);
                const until = Date.now() + blockTime;

                localStorage.setItem('crm_block', JSON.stringify({
                    until,
                    attempts: newAttempts
                }));

                setIsBlocked(true);
                setRemainingTime(Math.ceil(blockTime / 1000));
                setError('');
            } else {
                setError(`Incorrect password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    if (isUnlocked) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1121]/80 backdrop-blur-xl">
            <div className="relative w-full max-w-md transform transition-all duration-500 animate-in fade-in zoom-in">
                <div className="bg-uhuru-card border border-uhuru-border rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.6)] p-10 mx-4 overflow-hidden relative">
                    {/* Decorative element */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full" />

                    <div className="flex flex-col items-center text-center mb-10 relative z-10">
                        <div className="mb-8 group">
                            <div className="w-20 h-20 rounded-[2rem] bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                <Lock className="text-indigo-400 group-hover:text-indigo-300 transition-colors" size={32} />
                            </div>
                        </div>

                        <img
                            src="/images/uhuru-logo.png"
                            alt="UhurU Logo"
                            className="h-10 w-auto mb-6 opacity-90"
                        />

                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Security Protocol</h3>
                        <p className="text-uhuru-text-dim text-xs font-bold uppercase tracking-[0.2em]">
                            Verification Required
                        </p>
                    </div>

                    {isBlocked ? (
                        <div className="text-center py-8 relative z-10">
                            <div className="mb-6 inline-flex p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-500">
                                <AlertCircle size={32} />
                            </div>
                            <p className="text-white font-bold mb-2">Access Temporarily Suspended</p>
                            <p className="text-slate-500 text-sm mb-8">
                                Security override in progress...
                            </p>
                            <div className="text-4xl font-black text-indigo-400 tracking-tighter">
                                {formatTime(remainingTime)}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <div className="relative group">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="········"
                                        className="w-full px-6 py-4 bg-slate-900/60 border border-white/10 rounded-2xl text-white text-center text-xl tracking-[0.5em] focus:outline-none focus:border-indigo-500/50 transition-all font-mono placeholder:text-slate-700"
                                        autoFocus
                                        disabled={isBlocked}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center justify-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-in shake duration-300">
                                    <AlertCircle className="text-rose-500" size={14} />
                                    <p className="text-rose-400 text-[10px] font-bold uppercase tracking-widest">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isBlocked || !password}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:cursor-not-allowed group"
                            >
                                <span className="group-hover:scale-105 transition-transform block">Decrypt & Access</span>
                            </button>
                        </form>
                    )}
                </div>

                <p className="mt-8 text-center text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
                    UhurU Trade Ltd • Operational Intelligence
                </p>
            </div>
        </div>
    );
}
