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
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Fiscal Compliance (UK)</h1>
                <p className="text-slate-400 mt-1">Track your HMRC and Companies House obligations securely.</p>
            </div>

            {/* AI Tax Assistant Promo */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500/10 blur-[80px] rounded-full" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Alpha</span>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                UhurU AI Assistant
                            </h2>
                        </div>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                            Our RAG-powered engine analyzes your historical tax filings and ERP data to automate your upcoming returns with 99% accuracy.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/compliance/tax-assistant"
                        className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-xl shadow-emerald-500/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                        Open Assistant
                        <div className="p-1 bg-white/20 rounded-lg group-hover:translate-x-1 transition-transform">
                            <Bot size={18} />
                        </div>
                    </Link>
                </div>
            </div>

            {/* OBLIGATION CARDS - DARK THEME AS REQUESTED */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayData.map((ob) => (
                    <div key={ob.id} className="bg-uhuru-card border border-uhuru-border rounded-2xl p-6 relative overflow-hidden group hover:bg-uhuru-hover transition-all duration-300 shadow-card">
                        <button className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors">
                            <MoreVertical size={20} />
                        </button>

                        <div className="flex flex-col h-full space-y-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-700/50 
                                ${ob.type.includes('TAX') ? 'bg-emerald-500/10 text-emerald-400' :
                                    ob.type.includes('ACC') ? 'bg-indigo-500/10 text-indigo-400' :
                                        'bg-amber-500/10 text-amber-400'}`}
                            >
                                {ob.type.includes('TAX') ? <Landmark size={28} /> :
                                    ob.type.includes('ACC') ? <FileCheck size={28} /> :
                                        <Briefcase size={28} />}
                            </div>

                            <div>
                                <h3 className="text-slate-400 text-sm font-semibold mb-2 uppercase tracking-widest opacity-80">
                                    {ob.type.replace('_', ' ')}
                                </h3>
                                <p className="text-3xl font-bold text-white tracking-tight">
                                    {ob.dueDate}
                                </p>
                            </div>

                            <div className="flex pt-2">
                                <span className={`
                                    px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2
                                    ${ob.daysLeft < 30
                                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                        : ob.type.includes('TAX')
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'}
                                `}>
                                    <Clock size={14} className={ob.daysLeft < 30 ? 'animate-pulse' : ''} />
                                    {ob.daysLeft} days left
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {calculatedObligations.length === 0 && (
                <div className="mt-8 p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-4">
                    <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-indigo-300 font-bold mb-1 uppercase text-xs tracking-widest">Configuration required</p>
                        <p className="text-indigo-300/60 text-sm">Showing demo deadlines. Go to settings to sync your real Companies House and HMRC dates.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
