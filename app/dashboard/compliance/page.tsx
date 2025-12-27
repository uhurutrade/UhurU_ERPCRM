import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Landmark, FileCheck, Briefcase, MoreVertical, Calendar, Clock, Bot } from 'lucide-react';

export default async function CompliancePage() {
    // 1. Fetch Company Settings and Obligations from DB
    const settings = await prisma.companySettings.findFirst();
    const dbObligations = await prisma.taxObligation.findMany({
        where: { status: 'PENDING' },
        orderBy: { dueDate: 'asc' }
    });

    const now = new Date();
    const calculatedObligations: any[] = [];

    // 2. Logic to calculate display obligations
    if (settings) {
        // Accounts
        if (settings.accountsNextDueDate) {
            const date = new Date(settings.accountsNextDueDate);
            calculatedObligations.push({
                id: 'acc',
                type: 'ACCOUNTS',
                dueDate: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                daysLeft: Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
                status: 'PENDING'
            });
        }

        // Confirmation Statement
        if (settings.confirmationNextDueDate) {
            const date = new Date(settings.confirmationNextDueDate);
            calculatedObligations.push({
                id: 'conf',
                type: 'CONFIRMATION_STATEMENT',
                dueDate: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                daysLeft: Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
                status: 'PENDING'
            });
        }

        // Corporation Tax (9 months + 1 day after FYE)
        if (settings.financialYearEnd) {
            try {
                const [day, month] = settings.financialYearEnd.split('-').map(Number);
                let fyeDate = new Date(now.getFullYear(), month - 1, day);
                if (fyeDate < now) fyeDate.setFullYear(now.getFullYear() + 1);

                const corpTaxDate = new Date(fyeDate);
                corpTaxDate.setMonth(corpTaxDate.getMonth() + 9);
                corpTaxDate.setDate(corpTaxDate.getDate() + 1);

                calculatedObligations.push({
                    id: 'corp',
                    type: 'CORPORATION_TAX',
                    dueDate: corpTaxDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    daysLeft: Math.ceil((corpTaxDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
                    status: 'PENDING'
                });
            } catch (e) { }
        }
    }

    // Fallback to mock if nothing calculated
    const displayData = calculatedObligations.length > 0 ? calculatedObligations : [
        { id: 'm1', type: 'VAT_RETURN', dueDate: '15 Jan 2026', daysLeft: 28, status: 'PENDING' },
        { id: 'm2', type: 'ACCOUNTS', dueDate: '31 Mar 2026', daysLeft: 104, status: 'PENDING' },
        { id: 'm3', type: 'CONFIRMATION', dueDate: '12 May 2026', daysLeft: 145, status: 'PENDING' }
    ];

    return (
        <div className="min-h-screen p-4 sm:p-8 max-w-[1920px] mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Fiscal Compliance Engine</h1>
                    <p className="text-uhuru-text-muted mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Institutional Legal & Tax Surveillance (UK)</p>
                </div>
                <div className="flex gap-3">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 uppercase tracking-widest">
                        HMRC Link Active
                    </span>
                </div>
            </header>

            {/* AI Tax Assistant Promo */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-uhuru-card border border-uhuru-border p-5 sm:p-10 shadow-card">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 sm:gap-10">
                    <div className="text-center lg:text-left">
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-500/20">Autonomous Node</span>
                            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tighter">
                                UhurU Intelligence
                            </h2>
                        </div>
                        <p className="text-uhuru-text-muted text-sm sm:text-xl leading-relaxed max-w-2xl font-medium">
                            RAG-powered analysis engine processing historical filings and cross-referencing ledger data for 99.9% automated return accuracy.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/compliance/tax-assistant"
                        className="group flex items-center justify-center gap-3 px-6 sm:px-10 py-3 sm:py-5 rounded-2xl sm:rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] sm:text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 w-full sm:w-auto"
                    >
                        Initialize Assistant
                        <div className="p-1 sm:p-1.5 bg-white/10 rounded-lg sm:rounded-xl group-hover:rotate-12 transition-transform">
                            <Bot size={18} />
                        </div>
                    </Link>
                </div>
            </div>

            {/* OBLIGATION CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayData.map((ob) => (
                    <div key={ob.id} className="bg-uhuru-card border border-uhuru-border rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300 shadow-card">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-colors" />

                        <button className="absolute top-8 right-8 text-uhuru-text-dim hover:text-white transition-colors z-20">
                            <MoreVertical size={20} />
                        </button>

                        <div className="flex flex-col h-full space-y-8 relative z-10">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 shadow-2xl transition-transform group-hover:scale-110 
                                ${ob.type.includes('TAX') ? 'bg-emerald-500/10 text-emerald-400 shadow-emerald-500/10' :
                                    ob.type.includes('ACC') ? 'bg-blue-500/10 text-blue-400 shadow-blue-500/10' :
                                        'bg-amber-500/10 text-amber-400 shadow-amber-500/10'}`}
                            >
                                {ob.type.includes('TAX') ? <Landmark size={32} /> :
                                    ob.type.includes('ACC') ? <FileCheck size={32} /> :
                                        <Briefcase size={32} />}
                            </div>

                            <div>
                                <h3 className="text-uhuru-text-dim text-[9px] sm:text-[10px] font-black mb-2 sm:mb-3 uppercase tracking-[0.3em]">
                                    {ob.type.replace('_', ' ')}
                                </h3>
                                <p className="text-xl sm:text-4xl font-black text-white tracking-tighter truncate break-words">
                                    {ob.dueDate}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className={`
                                    px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2
                                    ${ob.daysLeft < 0
                                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                        : ob.daysLeft <= 60
                                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                            : 'bg-slate-900/60 text-slate-400 border border-white/5'}
                                `}>
                                    <Clock size={14} className={ob.daysLeft <= 60 ? 'animate-pulse' : ''} />
                                    {ob.daysLeft < 0 ? 'Overdue' : `${ob.daysLeft} Operational Days`}
                                </div>

                                {ob.status === 'PENDING' && (
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {calculatedObligations.length === 0 && (
                <div className="mt-8 p-6 bg-slate-900/40 border border-uhuru-border rounded-[2rem] flex items-center gap-5">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400 shadow-xl shadow-indigo-500/10">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-white font-black mb-1 uppercase text-[10px] tracking-[0.2em]">Sandbox Mode Active</p>
                        <p className="text-uhuru-text-muted text-sm">Showing simulated regulatory milestones. Integrate your HMRC Gateway credentials to unlock real-time perimeter surveillance.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
