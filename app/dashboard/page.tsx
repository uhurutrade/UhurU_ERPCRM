import { prisma } from "@/lib/prisma";
import {
    Wallet,
    Users,
    ClipboardList,
    Activity,
    TrendingUp,
    MoreVertical
} from "lucide-react";

export default async function DashboardPage() {
    const transactions = await prisma.bankTransaction.findMany({
        orderBy: { date: 'desc' },
        take: 5
    });

    const totalBalance = transactions.reduce((sum, tx) => {
        // Naive sum for MVP
        return sum + Number(tx.amount);
    }, 0);

    const leads = await prisma.lead.count({ where: { status: 'NEW' } });
    const tasks = await prisma.task.count({ where: { completed: false } });

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-uhuru-text-muted mt-1">Overview of your business performance</p>
                </div>
                <div className="flex gap-3">
                    {/* Placeholder for header actions if needed */}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Global Balance Card */}
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-emerald-500/30 hover:shadow-glow transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <Wallet size={24} />
                        </div>
                        <button className="text-uhuru-text-dim hover:text-white transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                    <h3 className="text-uhuru-text-muted text-sm font-medium">Global Balance</h3>
                    <p className="text-3xl font-bold text-white mt-1 tracking-tight">
                        £{totalBalance.toLocaleString()}
                    </p>
                    <div className="mt-4 flex items-center text-xs text-emerald-400 bg-emerald-500/10 w-fit px-2 py-1 rounded-full">
                        <TrendingUp size={12} className="mr-1" />
                        <span>+12.5% this month</span>
                    </div>
                </div>

                {/* Leads Card */}
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                            <Users size={24} />
                        </div>
                        <button className="text-uhuru-text-dim hover:text-white transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                    <h3 className="text-uhuru-text-muted text-sm font-medium">New Leads</h3>
                    <p className="text-3xl font-bold text-white mt-1 tracking-tight">{leads}</p>
                    <div className="mt-4 flex items-center text-xs text-blue-400 bg-blue-500/10 w-fit px-2 py-1 rounded-full">
                        <span>{leads > 0 ? 'Potential Opportunities' : 'No new leads'}</span>
                    </div>
                </div>

                {/* Tasks Card */}
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm group hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                            <ClipboardList size={24} />
                        </div>
                        <button className="text-uhuru-text-dim hover:text-white transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                    <h3 className="text-uhuru-text-muted text-sm font-medium">Pending Tasks</h3>
                    <p className="text-3xl font-bold text-white mt-1 tracking-tight">{tasks}</p>
                    <div className="mt-4 flex items-center text-xs text-amber-400 bg-amber-500/10 w-fit px-2 py-1 rounded-full">
                        <span>{tasks} items requiring attention</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                            <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                                <Activity size={18} />
                            </div>
                            Recent Transactions
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-uhuru-hover/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                                        £
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{tx.description}</p>
                                        <p className="text-xs text-uhuru-text-dim">{new Date(tx.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`font-mono font-medium ${Number(tx.amount) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {Number(tx.amount) >= 0 ? '+' : ''}{Number(tx.amount).toFixed(2)} {tx.currency}
                                </span>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <p className="text-sm text-uhuru-text-muted text-center py-4">No recent transactions</p>
                        )}
                    </div>
                </div>

                {/* Placeholder for Chart or other widget */}
                <div className="bg-uhuru-card p-6 rounded-2xl border border-uhuru-border shadow-card backdrop-blur-sm flex flex-col items-center justify-center text-center opacity-70">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 mb-4 flex items-center justify-center">
                        <TrendingUp className="text-slate-600" />
                    </div>
                    <p className="text-uhuru-text-muted">Cash Flow Chart</p>
                    <p className="text-xs text-uhuru-text-dim mt-1">Coming soon...</p>
                </div>
            </div>
        </div>
    );
}
