
import React from 'react';

export function FinancialCategoriesGuide() {
    return (
        <section className="bg-slate-900/60 p-6 rounded-2xl border border-indigo-500/20 shadow-2xl mt-8">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                <span className="p-2 bg-indigo-500/20 rounded-xl text-xl">📊</span>
                Fiscal Taxonomy & Category Logic
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                        <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                            <span>💳</span> Loans (Director DLA)
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Essential for managing the Director's Loan Account and avoiding Section 455 CTA 2010 issues.
                        </p>
                        <ul className="mt-2 text-[11px] text-slate-300 list-disc list-inside space-y-1">
                            <li><span className="text-white font-medium">Loan In:</span> Money injected by Director (Raul Ortega).</li>
                            <li><span className="text-white font-medium">Loan Out:</span> Repayments or withdrawals by Director.</li>
                        </ul>
                    </div>

                    <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                        <h3 className="text-rose-400 font-bold mb-2 flex items-center gap-2">
                            <span>💸</span> Fees & Charges
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Automated tracking of operational commissions.
                        </p>
                        <ul className="mt-2 text-[11px] text-slate-300 list-disc list-inside space-y-1">
                            <li><span className="text-white font-medium">Bank Fees:</span> Revolut Business, Swift, IBAN charges.</li>
                            <li><span className="text-white font-medium">Amazon Fees:</span> Storage, FBA commissions, refunds.</li>
                        </ul>
                    </div>

                    <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                        <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                            <span>📈</span> Sales & Income
                        </h3>
                        <ul className="mt-1 text-[11px] text-slate-300 list-disc list-inside space-y-1">
                            <li><span className="text-white font-medium">Amazon Sales:</span> Retail Revenue.</li>
                            <li><span className="text-white font-medium">Consulting Income:</span> Professional IT/Strategic services.</li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                        <h3 className="text-orange-400 font-bold mb-2 flex items-center gap-2">
                            <span>₿</span> Bitcoin & Crypto Assets
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Critical for Capital Gains Tax (CGT) and HMRC disclosure.
                        </p>
                        <ul className="mt-2 text-[11px] text-slate-300 list-disc list-inside space-y-1">
                            <li><span className="text-white font-medium">BTC Purchases/Sales:</span> Track acquisition cost.</li>
                            <li><span className="text-white font-medium">Gains/Losses:</span> Computed profit for fiscal returns.</li>
                        </ul>
                    </div>

                    <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                        <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
                            <span>💱</span> FX & Internal Movements
                        </h3>
                        <ul className="mt-1 text-[11px] text-slate-300 list-disc list-inside space-y-1">
                            <li><span className="text-white font-medium">Intercompany:</span> Transfers between Uhuru accounts.</li>
                            <li><span className="text-white font-medium">Currency Gain/Loss:</span> For corporation tax adjustments.</li>
                        </ul>
                    </div>

                    <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                        <h3 className="text-slate-400 font-bold mb-2 flex items-center gap-2">
                            <span>⚙️</span> Operating Expenses
                        </h3>
                        <ul className="mt-1 text-[11px] text-slate-300 list-disc list-inside space-y-1">
                            <li><span className="text-white font-medium">Postage:</span> UK Postbox, Mail.</li>
                            <li><span className="text-white font-medium">Hosting/Cloud:</span> Contabo, Google Cloud.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20 border-dashed">
                <p className="text-[11px] text-indigo-300/80 uppercase tracking-widest font-bold mb-2">Strategy Note</p>
                <p className="text-xs text-slate-400 italic">
                    "This classification ensures that the Senior CFO AI can perform real-time tax simulations for UK Corporation Tax and Spanish DLA residency compliance."
                </p>
            </div>
        </section>
    );
}
