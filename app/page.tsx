'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Lock, AlertCircle } from "lucide-react";

const CORRECT_PASSWORD = '12345678';
const MAX_ATTEMPTS = 3;

export default function Home() {
    const router = useRouter();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const [error, setError] = useState('');

    // Load attempts and block state from localStorage on mount
    useEffect(() => {
        const savedAttempts = localStorage.getItem('crm_attempts');
        const blockData = localStorage.getItem('crm_block');

        if (savedAttempts) {
            setAttempts(parseInt(savedAttempts));
        }

        if (blockData) {
            const { until } = JSON.parse(blockData);
            const now = Date.now();

            if (now < until) {
                setIsBlocked(true);
                setRemainingTime(Math.ceil((until - now) / 1000));
            } else {
                // Block expired, clear it
                localStorage.removeItem('crm_block');
                localStorage.removeItem('crm_attempts');
                setAttempts(0);
            }
        }
    }, []);

    // Countdown timer
    useEffect(() => {
        if (isBlocked && remainingTime > 0) {
            const interval = setInterval(() => {
                setRemainingTime(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setIsBlocked(false);
                        localStorage.removeItem('crm_block');
                        localStorage.removeItem('crm_attempts');
                        setAttempts(0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isBlocked, remainingTime]);

    const calculateBlockTime = (attemptCount: number) => {
        if (attemptCount === MAX_ATTEMPTS) return 30; // 30 seconds
        if (attemptCount === MAX_ATTEMPTS + 1) return 60; // 1 minute
        return Math.pow(2, attemptCount - MAX_ATTEMPTS) * 60; // Exponential: 2min, 4min, 8min...
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isBlocked) return;

        if (password === CORRECT_PASSWORD) {
            setShowPasswordModal(false);
            setError('');
            setPassword('');
            // Clear attempts on successful login
            localStorage.removeItem('crm_attempts');
            localStorage.removeItem('crm_block');
            setAttempts(0);
            router.push('/dashboard');
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setPassword('');

            // Save attempts to localStorage
            localStorage.setItem('crm_attempts', newAttempts.toString());

            if (newAttempts >= MAX_ATTEMPTS) {
                const blockTime = calculateBlockTime(newAttempts);
                const until = Date.now() + (blockTime * 1000);

                // Save block data to localStorage
                localStorage.setItem('crm_block', JSON.stringify({ until }));

                setIsBlocked(true);
                setRemainingTime(blockTime);
                setError('');

                // Start countdown
                const interval = setInterval(() => {
                    setRemainingTime(prev => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            setIsBlocked(false);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
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

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 relative overflow-hidden bg-uhuru-base">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-uhuru-accent-blue/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-uhuru-accent-purple/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Header */}
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-16">
                <div className="fixed left-0 top-0 flex w-full justify-center border-b border-uhuru-border bg-uhuru-base/80 backdrop-blur-xl pb-6 pt-8 lg:static lg:w-auto lg:rounded-2xl lg:border lg:bg-uhuru-card lg:p-6">
                    <p className="text-white font-semibold text-lg">
                        Uhuru Trade Ltd
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative flex place-items-center flex-col gap-12 z-10">
                <div className="text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-uhuru-accent-blue/10 border border-uhuru-accent-blue/30 text-uhuru-accent-blue mb-6 backdrop-blur-sm">
                        <Sparkles size={16} />
                        <span className="text-sm font-medium">Enterprise Resource Planning & CRM</span>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-uhuru-accent-blue via-uhuru-accent-purple to-emerald-400">
                            Management Outlook
                        </span>
                        <br />
                        <span className="text-white">ERP & CRM</span>
                    </h1>

                    <p className="text-uhuru-text-muted text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                        Secure Enterprise Resource Planning & Customer Relationship Management.
                        Streamline your business operations with our powerful platform.
                    </p>

                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-uhuru-accent-blue hover:bg-blue-600 text-white rounded-xl font-semibold text-lg transition-all shadow-glow hover:shadow-lg transform hover:scale-105"
                    >
                        Enter ERP & CRM
                        <ArrowRight size={20} />
                    </button>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl w-full">
                    {[
                        { title: "Banking", desc: "Manage transactions and accounts" },
                        { title: "CRM", desc: "Track leads and customer relationships" },
                        { title: "Compliance", desc: "Stay on top of deadlines" }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-uhuru-card backdrop-blur-sm border border-uhuru-border hover:border-uhuru-accent-blue/50 transition-all group">
                            <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-uhuru-accent-blue transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-uhuru-text-dim text-sm">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-center text-uhuru-text-dim text-sm">
                <p>© 2025 Uhuru Trade Ltd. All rights reserved.</p>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300" onClick={() => setShowPasswordModal(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <div
                        className="relative w-full max-w-md transform transition-all duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-card backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 mx-4">
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPassword('');
                                    setError('');
                                }}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>

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
                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter password"
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-uhuru-blue transition-all"
                                            autoFocus
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
                                        disabled={!password}
                                        className="w-full py-3 bg-uhuru-blue hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-semibold transition-all disabled:cursor-not-allowed"
                                    >
                                        Unlock
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

