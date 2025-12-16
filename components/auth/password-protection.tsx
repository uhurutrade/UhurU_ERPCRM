'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle } from 'lucide-react';

const CORRECT_PASSWORD = '12345678';
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md transform transition-all duration-300">
                <div className="bg-gradient-card backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 mx-4">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="mb-4 p-3 bg-slate-800/50 rounded-full border border-slate-700/50">
                            <Lock className="text-uhuru-blue" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Access Protected</h3>
                        <p className="text-slate-300 text-sm">
                            Enter password to access the CRM
                        </p>
                    </div>

                    {isBlocked ? (
                        <div className="text-center py-6">
                            <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
                            <p className="text-white font-semibold mb-2">Too many failed attempts</p>
                            <p className="text-slate-400 text-sm mb-4">
                                Please wait before trying again
                            </p>
                            <div className="text-3xl font-bold text-uhuru-blue">
                                {formatTime(remainingTime)}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-uhuru-blue transition-all"
                                    autoFocus
                                    disabled={isBlocked}
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                                    <AlertCircle className="text-rose-500" size={16} />
                                    <p className="text-rose-300 text-sm">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isBlocked || !password}
                                className="w-full py-3 bg-uhuru-blue hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-semibold transition-all disabled:cursor-not-allowed"
                            >
                                Unlock
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
