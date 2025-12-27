export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import {
    Wallet,
    Users,
    ClipboardList,
    Activity,
    TrendingUp,
    MoreVertical,
    Building2,
    CreditCard,
    DollarSign,
    Euro,
    PoundSterling,
    JapaneseYen,
    Banknote
} from "lucide-react";
import Link from 'next/link';
import { serializeData } from "@/lib/serialization";
import { AIStatusBadge } from "@/components/ai/status-badge";

export default async function DashboardPage() {
    // 1. Fetch recent transactions
    const rawTransactions = await prisma.bankTransaction.findMany({
        orderBy: { date: 'desc' },
        take: 5
    });

    const leads = await prisma.lead.count({ where: { status: 'NEW' } });
    const tasks = await prisma.task.count({ where: { completed: false } });

    const allAccountsRaw = await prisma.bankAccount.findMany({
        include: {
            bank: true
        }
    });

    // Recalculate balances and build serializable objects
    const accountsData = [];
    let totalBalance = 0;

    for (const account of allAccountsRaw) {
        const balanceCtx = await prisma.bankTransaction.aggregate({
            where: { bankAccountId: account.id },
            _sum: { amount: true }
        });
        const sum = balanceCtx._sum.amount ? Number(balanceCtx._sum.amount) : 0;
        totalBalance += sum;

        accountsData.push({
            ...account,
            currentBalance: sum
        });
    }

    // Sort and take top 12
    const sortedAccounts = accountsData
        .sort((a, b) => Number(b.currentBalance) - Number(a.currentBalance))
        .slice(0, 12);

    // CRITICAL: Serialize EVERYTHING for RSC production stability
    const transactions = serializeData(rawTransactions);
    const accounts = serializeData(sortedAccounts);

    return (
        <div className="p-0 sm:p-8 max-w-[1920px] mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 shrink-0">
                <div className="text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Executive Dashboard</h1>
                    <p className="text-uhuru-text-muted mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Strategic Management & Resource Planning</p>
                </div>
                <div className="flex justify-center sm:justify-end">
                    <AIStatusBadge />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Global Balance Card */}
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <Wallet size={24} />
                        </div>
                        <button className="text-uhuru-text-dim hover:text-white transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                    <label className="text-uhuru-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block">Global Liquidity</label>
                    <p className="text-3xl font-bold text-white tracking-tight">
                        £{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <div className="mt-4 flex items-center text-[10px] text-emerald-400 font-bold bg-emerald-500/10 w-fit px-2 py-1 rounded-full uppercase tracking-tighter">
                        <TrendingUp size={12} className="mr-1" />
                        <span>Tracking active treasury</span>
                    </div>
                </div>

                {/* Leads Card */}
                <Link href="/dashboard/crm?view=leads" className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-blue-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                            <Users size={24} />
                        </div>
                        <button className="text-uhuru-text-dim hover:text-white transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                    <label className="text-uhuru-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block">Active Inbound</label>
                    <p className="text-3xl font-bold text-white tracking-tight">{leads}</p>
                    <div className="mt-4 flex items-center text-[10px] text-blue-400 font-bold bg-blue-500/10 w-fit px-2 py-1 rounded-full uppercase tracking-tighter">
                        <span>Lead Capture Active</span>
                    </div>
                </Link>

                {/* Tasks Card */}
                <Link href="/dashboard/crm?view=tasks" className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-amber-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                            <ClipboardList size={24} />
                        </div>
                        <button className="text-uhuru-text-dim hover:text-white transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                    <label className="text-uhuru-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block">Operational Tasks</label>
                    <p className="text-3xl font-bold text-white tracking-tight">{tasks}</p>
                    <div className="mt-4 flex items-center text-[10px] text-amber-400 font-bold bg-amber-500/10 w-fit px-2 py-1 rounded-full uppercase tracking-tighter">
                        <span>Intervention required</span>
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 luxury-grid">
                {/* Recent Activity */}
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-white flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                                <Activity size={20} />
                            </div>
                            Live Transactions Feed
                        </h3>
                        <Link href="/dashboard/banking" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">Full Ledger</Link>
                    </div>
                    <div className="space-y-2">
                        {transactions.map((tx: any) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-white/5 hover:bg-slate-900/40 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-slate-700 transition-all font-bold">
                                        £
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform truncate max-w-[200px]">{tx.description}</p>
                                        <p className="text-[10px] text-uhuru-text-dim uppercase font-bold tracking-tighter mt-0.5">{tx.date ? new Date(tx.date).toLocaleDateString() : '---'}</p>
                                    </div>
                                </div>
                                <span className={`font-mono font-bold text-xs sm:text-sm shrink-0 ${Number(tx.amount) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {Number(tx.amount) >= 0 ? '+' : ''}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {tx.currency}
                                </span>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <div className="py-12 text-center text-uhuru-text-dim text-xs italic">No digital audit trail detected.</div>
                        )}
                    </div>
                </div>

                {/* Account Cards Grid */}
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-white flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                                <Building2 size={20} />
                            </div>
                            Institutional Accounts
                        </h3>
                        <Link href="/dashboard/bank-settings" className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Configure</Link>
                    </div>

                    {accounts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 py-8 text-center bg-slate-900/40 rounded-2xl border border-dashed border-uhuru-border">
                            <CreditCard className="text-slate-700 mb-3" size={32} />
                            <p className="text-uhuru-text-dim text-xs">No active treasury nodes registered.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {accounts.map((acc: any) => (
                                <Link href={`/dashboard/banking?accountId=${acc.id}`} key={acc.id} className="block group">
                                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 group-hover:border-emerald-500/30 group-hover:bg-slate-900/60 transition-all h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2.5 bg-slate-800 rounded-xl text-slate-400 group-hover:text-white transition-colors border border-white/5">
                                                {(() => {
                                                    switch (acc.currency) {
                                                        case 'USD': return <DollarSign size={18} />;
                                                        case 'EUR': return <Euro size={18} />;
                                                        case 'GBP': return <PoundSterling size={18} />;
                                                        case 'JPY': return <JapaneseYen size={18} />;
                                                        default: return <Banknote size={18} />;
                                                    }
                                                })()}
                                            </div>
                                            <span className="text-[9px] font-black text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-white/5 group-hover:text-white transition-colors">
                                                {acc.currency}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-[0.1em] truncate mb-1">{acc.bank?.bankName || 'Unknown Institution'}</p>
                                        <p className={`font-black tracking-tighter text-2xl group-hover:scale-[1.02] transition-transform origin-left ${Number(acc.currentBalance) >= 0 ? 'text-white' : 'text-rose-400'}`}>
                                            {acc.currency === 'GBP' ? '£' : acc.currency === 'EUR' ? '€' : acc.currency === 'USD' ? '$' : ''}
                                            {Number(acc.currentBalance || 0).toLocaleString()}
                                        </p>
                                        <p className="text-[10px] text-uhuru-text-dim font-bold mt-2 truncate bg-white/5 w-fit px-2 py-0.5 rounded uppercase tracking-widest">{acc.accountName}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
