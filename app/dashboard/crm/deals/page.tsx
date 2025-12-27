export const dynamic = "force-dynamic";
import { getDeals, getOrganizations, createDeal } from "../actions";

const STAGES = ["PROSPECTING", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];

export default async function DealsPage() {
    const deals = await getDeals();
    const orgs = await getOrganizations();

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Sales Pipeline</h1>

                {/* Quick Add Deal */}
                <form action={createDeal} className="flex gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <input name="title" placeholder="Opportunity Title" className="bg-slate-800 rounded px-2 py-1 text-sm" required />
                    <input name="amount" type="number" placeholder="£ Amount" className="bg-slate-800 rounded px-2 py-1 text-sm w-24" />
                    <select name="organizationId" className="bg-slate-800 rounded px-2 py-1 text-sm" required>
                        <option value="">Customer...</option>
                        {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                    <select name="stage" className="bg-slate-800 rounded px-2 py-1 text-sm">
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="px-3 py-1 bg-emerald-600 text-white rounded text-sm font-bold">Add</button>
                </form>
            </div>

            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-4 min-w-max h-full">
                    {STAGES.map(stage => (
                        <div key={stage} className="w-72 flex flex-col bg-slate-900/50 rounded-xl border border-slate-800 p-4">
                            <h3 className="font-bold mb-4 text-slate-400 text-xs tracking-wider">{stage}</h3>
                            <div className="space-y-3">
                                {deals.filter(d => d.stage === stage).map(deal => (
                                    <div key={deal.id} className="p-3 bg-slate-800 rounded border border-slate-700 shadow-sm hover:border-slate-500 transition-colors cursor-pointer group">
                                        <div className="font-medium text-sm">{deal.title}</div>
                                        <div className="text-xs text-slate-400 mt-1">{deal.organization.name}</div>
                                        <div className="text-sm font-mono mt-2 text-emerald-400">
                                            £{Number(deal.amount).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
