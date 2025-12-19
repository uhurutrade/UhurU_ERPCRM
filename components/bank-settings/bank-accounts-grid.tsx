"use client";

import { useState } from "react";
import { BankAccount } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Ban, Settings } from "lucide-react";

interface BankAccountsGridProps {
    initialAccounts: BankAccount[];
    bankId: string;
}

export default function BankAccountsGrid({ initialAccounts, bankId }: BankAccountsGridProps) {
    const [accounts, setAccounts] = useState(initialAccounts);
    const [isReordering, setIsReordering] = useState(false);

    const handleMove = async (index: number, direction: 'left' | 'right') => {
        if (isReordering) return;

        const newIndex = direction === 'left' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= accounts.length) return;

        const newAccounts = [...accounts];
        const temp = newAccounts[index];
        newAccounts[index] = newAccounts[newIndex];
        newAccounts[newIndex] = temp;

        // Update orders locally
        const updatedAccounts = newAccounts.map((acc, idx) => ({
            ...acc,
            order: idx
        }));

        setAccounts(updatedAccounts);
        setIsReordering(true);

        try {
            await fetch('/api/banking/accounts/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accounts: updatedAccounts.map(a => ({ id: a.id, order: a.order }))
                })
            });
        } catch (error) {
            console.error("Failed to save order", error);
            // Optionally revert state here on error
        } finally {
            setIsReordering(false);
        }
    };

    if (accounts.length === 0) {
        return <p className="text-sm text-slate-500">No accounts added yet</p>;
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {accounts.map((account, index) => (
                    <div key={account.id} className="relative group">
                        <Link
                            href={`/dashboard/banking?accountId=${account.id}`}
                            className="block p-6 bg-slate-900/40 hover:bg-slate-900/60 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all h-full group/card shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-800 p-2 rounded-xl text-slate-400 group-hover/card:text-emerald-400 transition-colors">
                                        <span className="font-mono text-xs font-black uppercase">
                                            {account.currency}
                                        </span>
                                    </div>
                                    {!account.isActive && (
                                        <Ban className="w-3 h-3 text-rose-500/50" />
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {!account.isActive && (
                                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded">
                                            Offline
                                        </span>
                                    )}
                                    {account.isPrimary && (
                                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded">
                                            Master
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1 mb-4">
                                <p className="text-xs font-bold text-uhuru-text-muted group-hover/card:text-white transition-colors truncate">{account.accountName}</p>
                                <p className="text-[9px] font-black text-uhuru-text-dim uppercase tracking-widest">{account.accountType}</p>
                            </div>

                            {account.currentBalance !== null && (
                                <div className="border-t border-white/5 pt-4 mt-auto">
                                    <p className={`font-mono font-black text-lg tracking-tighter ${Number(account.currentBalance) >= 0 ? 'text-white' : 'text-rose-400'}`}>
                                        {Number(account.currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            )}

                            {account.iban && (
                                <p className="text-[9px] text-slate-600 mt-2 font-mono group-hover/card:text-slate-500 transition-colors">
                                    {account.iban.substring(0, 10)}...{account.iban.slice(-4)}
                                </p>
                            )}
                        </Link>

                        {/* Controls (Visible on hover) */}
                        <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                            <Link
                                href={`/dashboard/bank-settings/account/${account.id}`}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-white shadow-xl transition-all"
                                title="Config"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Settings size={12} />
                            </Link>
                            {index > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleMove(index, 'left');
                                    }}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white shadow-xl transition-all"
                                >
                                    <ArrowLeft size={12} />
                                </button>
                            )}
                            {index < accounts.length - 1 && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleMove(index, 'right');
                                    }}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white shadow-xl transition-all"
                                >
                                    <ArrowRight size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
