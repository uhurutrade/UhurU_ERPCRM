export const dynamic = "force-dynamic";
import { BrainCircuit } from "lucide-react";
import { NeuralAuditHistory } from "@/components/company-settings/neural-audit-history";

export default function NeuralReportsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 shrink-0 border-b border-uhuru-border pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 shadow-glow">
                            <BrainCircuit size={32} />
                        </div>
                        Intelligence Hub
                    </h1>
                    <p className="text-uhuru-text-muted mt-2 uppercase text-[10px] font-bold tracking-[0.2em]">Autonomous Audit Feed & Strategic Reports</p>
                </div>
                <div className="flex gap-3">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        Neural Core v1.0 Active
                    </span>
                </div>
            </header>

            <div className="max-w-7xl">
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-200 mb-2">Neural Audit Ledger</h2>
                    <p className="text-sm text-slate-400">
                        This ledger records every strategic adjustment made by the dual-AI consensus engine.
                        Download detailed PDF reports for individual audits to verify justifications and regulatory compliance.
                    </p>
                </div>

                <NeuralAuditHistory />
            </div>
        </div>
    );
}
