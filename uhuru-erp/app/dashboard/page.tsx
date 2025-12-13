import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
    const transactions = await prisma.bankTransaction.findMany();
    const totalBalance = transactions.reduce((sum, tx) => {
        // Very naive conversion sum, assumes 1:1 for MVP. In reality needs currency conversion.
        return sum + Number(tx.amount);
    }, 0);

    const leads = await prisma.lead.count({ where: { status: 'NEW' } });
    const tasks = await prisma.task.count({ where: { completed: false } });

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                    <h2 className="text-lg font-semibold mb-2 text-slate-300">Balance Global Estimado</h2>
                    <p className={`text - 3xl font - mono ${ totalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400' } `}>
                        {totalBalance.toLocaleString()} (Mix)
                    </p>
                    <p className="text-xs text-slate-500 mt-2">* Suma bruta de todas las divisas</p>
                </div>
                <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                    <h2 className="text-lg font-semibold mb-2 text-slate-300">Leads Nuevos</h2>
                    <p className="text-3xl font-mono text-blue-400">{leads}</p>
                </div>
                <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                    <h2 className="text-lg font-semibold mb-2 text-slate-300">Tareas Pendientes</h2>
                    <p className="text-3xl font-mono text-yellow-400">{tasks}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                    <h3 className="font-semibold mb-4 text-slate-300">Actividad Reciente</h3>
                    <div className="space-y-3">
                        {transactions.slice(0, 5).map(tx => (
                            <div key={tx.id} className="flex justify-between text-sm border-b border-slate-800 pb-2 last:border-0">
                                <span>{tx.description}</span>
                                <span className="font-mono">{Number(tx.amount).toFixed(2)} {tx.currency}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
