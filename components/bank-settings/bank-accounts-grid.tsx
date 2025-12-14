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
        <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-300 mb-2">Accounts:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {accounts.map((account, index) => (
                    <div key={account.id} className="relative group">
                        <Link
                            href={`/dashboard/banking?accountId=${account.id}`}
                            className="block p-4 bg-gradient-card backdrop-blur-xl rounded-lg border border-slate-700 transition-colors h-full hover:border-emerald-500/50"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-lg font-bold text-emerald-400">
                                        {account.currency}
                                    </span>
                                    {!account.isActive && (
                                        <Ban className="w-4 h-4 text-rose-500" />
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    {!account.isActive && (
                                        <span className="px-2 py-0.5 text-xs bg-rose-500/20 text-rose-500 rounded border border-rose-500/30">
                                            Inactive
                                        </span>
                                    )}
                                    {account.isPrimary && (
                                        <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded">
                                            Primary
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-slate-300 mb-1">{account.accountName}</p>
                            <p className="text-xs text-slate-500">{account.accountType}</p>
                            {account.iban && (
                                <p className="text-xs text-slate-600 mt-2 font-mono">
                                    {account.iban.substring(0, 20)}...
                                </p>
                            )}
                            {account.currency === "USD" && (
                                <div className="mt-2 space-y-1">
                                    {account.routingNumber && (
                                        <p className="text-xs text-slate-600 font-mono">
                                            ACH: {account.routingNumber}
                                        </p>
                                    )}
                                    {account.wireRoutingNumber && (
                                        <p className="text-xs text-slate-600 font-mono">
                                            Wire: {account.wireRoutingNumber}
                                        </p>
                                    )}
                                </div>
                            )}
                            {account.currentBalance !== null && (
                                <p className={`text-sm font-semibold mt-2 ${Number(account.currentBalance) >= 0 ? 'text-white' : 'text-rose-400'}`}>
                                    {Number(account.currentBalance).toLocaleString()} {account.currency}
                                </p>
                            )}
                        </Link>

                        {/* Controls (Visible on hover) */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                                href={`/dashboard/bank-settings/account/${account.id}`}
                                className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 hover:text-white"
                                title="Edit Settings"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Settings size={14} />
                            </Link>
                            {index > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleMove(index, 'left');
                                    }}
                                    className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-white"
                                    title="Move Left/Up"
                                >
                                    <ArrowLeft size={14} />
                                </button>
                            )}
                            {index < accounts.length - 1 && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleMove(index, 'right');
                                    }}
                                    className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-white"
                                    title="Move Right/Down"
                                >
                                    <ArrowRight size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
