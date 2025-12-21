'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Lock, AlertCircle, Sparkles, Shield, Zap, Globe } from "lucide-react";

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

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isBlocked) return;

        // Use Server Action to set cookie
        const { loginWithPassword } = await import('@/app/actions/auth-password');
        const result = await loginWithPassword(password);

        if (result.success) {
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
        <main className="flex min-h-screen flex-col items-center justify-center p-8 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            {/* Main Content */}
            <div className="relative z-10 max-w-6xl w-full">
                {/* Logo Section */}
                <div className="flex justify-center mb-10 animate-in fade-in slide-in-from-top duration-700">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-3xl rounded-full"></div>
                        <Image
                            src="/images/uhuru-logo.png"
                            alt="Uhuru Logo"
                            width={400}
                            height={150}
                            className="relative drop-shadow-2xl"
                            priority
                        />
                    </div>
                </div>

                {/* Hero Section */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '200ms' }}>

                    {/* Button Moved Here (Replacing previous Badge) */}
                    <div className="mb-8 flex justify-center">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="group inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-emerald-900/50 hover:shadow-xl hover:shadow-emerald-900/60 transform hover:scale-105 active:scale-100"
                        >
                            <Lock size={18} />
                            Access Platform
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-200 to-blue-200">
                            Strategic Management Outlook
                        </span>
                    </h1>

                    <p className="text-slate-400 text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
                        Unified command center for ERP, CRM & Legal Operations.
                        Orchestrate your enterprise resources with precision and clarity.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '400ms' }}>
                    {[
                        {
                            icon: Shield,
                            title: "Secure & Compliant",
                            desc: "Bank-grade security with UK compliance built-in",
                            color: "from-emerald-500 to-teal-500"
                        },
                        {
                            icon: Zap,
                            title: "Real-Time Insights",
                            desc: "Live financial data and business analytics",
                            color: "from-blue-500 to-cyan-500"
                        },
                        {
                            icon: Globe,
                            title: "Multi-Currency",
                            desc: "Manage transactions across global markets",
                            color: "from-purple-500 to-pink-500"
                        }
                    ].map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={i}
                                className="group relative p-6 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:transform hover:scale-105"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}></div>
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                                    <Icon className="text-white" size={24} />
                                </div>
                                <h3 className="text-white font-semibold text-lg mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-center text-slate-500 text-sm z-10">
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
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 mx-4">
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
                                <div className="mb-4 p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                    <Lock className="text-emerald-400" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">Secure Access</h3>
                                <p className="text-slate-400 text-sm">
                                    Enter your password to continue
                                </p>
                            </div>

                            {isBlocked ? (
                                <div className="text-center py-6">
                                    <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
                                    <p className="text-white font-semibold mb-2">Too many failed attempts</p>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Please wait before trying again
                                    </p>
                                    <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
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
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            autoFocus
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                                            <AlertCircle className="text-rose-400" size={16} />
                                            <p className="text-rose-300 text-sm">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!password}
                                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-lg font-semibold transition-all disabled:cursor-not-allowed shadow-lg shadow-emerald-900/30 hover:shadow-xl hover:shadow-emerald-900/40"
                                    >
                                        Unlock Platform
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
