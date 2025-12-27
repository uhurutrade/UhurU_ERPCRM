export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, Plus, Wallet } from "lucide-react";
import { convertToGBP } from "@/lib/currency";
import BankAccountsGrid from "@/components/bank-settings/bank-accounts-grid";
import { serializeData } from "@/lib/serialization";

export default async function BankSettingsPage() {
    // Fetch all banks with their accounts
    const banks = await prisma.bank.findMany({
        include: {
            accounts: {
                orderBy: { order: 'asc' }
            }
        },
        orderBy: { bankName: 'asc' }
    });

    // Fetch all crypto wallets
    const cryptoWallets = await prisma.cryptoWallet.findMany({
        orderBy: { walletName: 'asc' }
    });

    // Recalculate balances for all accounts to ensure consistency with Live Ledger (excluding Audit Log)
    // This ensures the "image" (card) shows the computed sum of movements
    for (const bank of banks) {
        for (const account of bank.accounts) {
            const balanceCtx = await prisma.bankTransaction.aggregate({
                where: { bankAccountId: account.id },
                _sum: { amount: true }
            });
            // Override the stored balance safely as a Number
            const sum = balanceCtx._sum.amount ? Number(balanceCtx._sum.amount) : 0;
            (account as any).currentBalance = sum;
        }
    }

    return (
        <div className="p-8 max-w-[1920px] mx-auto space-y-12 animate-in fade-in duration-500">
            <header className="flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Financial Infrastructure</h1>
                    <p className="text-uhuru-text-muted mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Institutional Banking & Digital Asset Management</p>
                </div>
                <div className="flex gap-3">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest">
                        Node Stable
                    </span>
                </div>
            </header>

            {/* Traditional Banks Section */}
            <section className="space-y-6">
                <div className="flex justify-between items-center border-b border-uhuru-border pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <Building2 size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Institutional Banking</h2>
                    </div>
                    <Link
                        href="/dashboard/bank-settings/add-bank"
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        Register Institution
                    </Link>
                </div>

                {banks.length === 0 ? (
                    <div className="bg-uhuru-card border border-dashed border-uhuru-border rounded-[2rem] p-12 text-center group hover:border-emerald-500/30 transition-all">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-600 group-hover:text-emerald-500 transition-colors">
                            <Building2 size={32} />
                        </div>
                        <p className="text-uhuru-text-dim text-sm  mb-8">No banking institutions registered in the current perimeter.</p>
                        <Link
                            href="/dashboard/bank-settings/add-bank"
                            className="inline-flex px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest"
                        >
                            Establish First Connection
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {banks.map((bank) => {
                            const totalBalanceGBP = bank.accounts.reduce((sum, account) => {
                                return sum + convertToGBP(Number(account.currentBalance || 0), account.currency);
                            }, 0);

                            return (
                                <div key={bank.id} className="bg-uhuru-card rounded-[2rem] border border-uhuru-border p-8 shadow-card relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-colors" />

                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                        <div className="space-y-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 overflow-hidden">
                                                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tighter truncate max-w-full">{bank.bankName}</h3>
                                                <div className="bg-slate-900/60 border border-white/10 rounded-xl px-3 py-1 sm:px-4 sm:py-1.5 flex items-center gap-3 w-fit shrink-0">
                                                    <span className="text-[10px] font-black text-uhuru-text-dim uppercase tracking-widest shrink-0">Total Liquidity</span>
                                                    <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                                                        £{totalBalanceGBP.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <p className="text-[10px] font-black text-uhuru-text-dim uppercase tracking-widest flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    {bank.bankType}
                                                </p>
                                                {bank.swiftBic && (
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">SWIFT: {bank.swiftBic}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Link
                                                href={`/dashboard/bank-settings/bank/${bank.id}`}
                                                className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-white/5 transition-all"
                                            >
                                                Modify
                                            </Link>
                                            <Link
                                                href={`/dashboard/bank-settings/bank/${bank.id}/add-account`}
                                                className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
                                            >
                                                <Plus size={14} /> Account
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="relative z-10 border-t border-white/5 pt-8">
                                        <BankAccountsGrid
                                            initialAccounts={serializeData(bank.accounts)}
                                            bankId={bank.id}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Crypto Wallets Section */}
            <section className="space-y-6">
                <div className="flex justify-between items-center border-b border-uhuru-border pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                            <Wallet size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Digital Asset Custody</h2>
                    </div>
                    <Link
                        href="/dashboard/bank-settings/add-crypto-wallet"
                        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-amber-600/20 transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        Deploy Wallet
                    </Link>
                </div>

                {cryptoWallets.length === 0 ? (
                    <div className="bg-uhuru-card border border-dashed border-uhuru-border rounded-[2rem] p-12 text-center group hover:border-amber-500/30 transition-all">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-600 group-hover:text-amber-500 transition-colors">
                            <Wallet size={32} />
                        </div>
                        <p className="text-uhuru-text-dim text-sm  mb-8">No digital asset containers detected in the current vault.</p>
                        <Link
                            href="/dashboard/bank-settings/add-crypto-wallet"
                            className="inline-flex px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest"
                        >
                            Initialize Vault
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cryptoWallets.map((wallet) => (
                            <Link
                                key={wallet.id}
                                href={`/dashboard/bank-settings/crypto-wallet/${wallet.id}`}
                                className="bg-uhuru-card hover:bg-slate-900/60 rounded-[2rem] border border-uhuru-border p-8 transition-all shadow-card group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full -mr-10 -mt-10 group-hover:bg-amber-500/10 transition-colors" />

                                <div className="relative z-10 flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-black text-white mb-1 tracking-tight">{wallet.walletName}</h3>
                                        <p className="text-[10px] font-black text-uhuru-text-dim uppercase tracking-[0.2em]">{wallet.walletType}</p>
                                    </div>
                                    <span className="px-3 py-1 text-[10px] bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/20 font-black tracking-widest">
                                        {wallet.asset}
                                    </span>
                                </div>

                                <div className="relative z-10 grid grid-cols-2 gap-4 mb-6">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Protocol</span>
                                        <p className="text-xs font-bold text-slate-300">{wallet.blockchain}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Asset Class</span>
                                        <p className="text-xs font-bold text-slate-300">{wallet.assetType}</p>
                                    </div>
                                </div>

                                <div className="relative z-10 p-4 bg-slate-950/60 rounded-xl mb-6 border border-white/5 group-hover:border-white/10 transition-colors">
                                    <p className="text-[9px] font-black text-slate-600 mb-2 uppercase tracking-widest">Contract Address</p>
                                    <p className="text-[10px] font-mono text-slate-400 break-all leading-relaxed">
                                        {wallet.walletAddress}
                                    </p>
                                </div>

                                {wallet.currentBalance !== null && (
                                    <div className="relative z-10 flex justify-between items-end border-t border-white/5 pt-6">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black text-uhuru-text-dim uppercase tracking-widest">Net Balance</span>
                                            <p className="text-lg font-black text-white font-mono tracking-tighter">
                                                {Number(wallet.currentBalance).toFixed(8)}
                                            </p>
                                        </div>
                                        {wallet.balanceUSD !== null && (
                                            <p className="text-sm font-black text-emerald-400 font-mono tracking-tighter">
                                                ${Number(wallet.balanceUSD).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
