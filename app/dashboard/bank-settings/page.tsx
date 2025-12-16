import { prisma } from "@/lib/prisma";
import Link from "next/link";
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
            // Override the stored balance
            account.currentBalance = balanceCtx._sum.amount || new (await import("@prisma/client/runtime/library")).Decimal(0);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Bank Settings</h1>
                    <p className="text-slate-400">
                        Manage your traditional bank accounts and crypto wallets
                    </p>
                </div>
            </div>

            {/* Traditional Banks Section */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-emerald-400">Banking Institutions</h2>
                    <Link
                        href="/dashboard/bank-settings/add-bank"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                        + Add Bank
                    </Link>
                </div>

                {banks.length === 0 ? (
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
                        <p className="text-slate-400 mb-4">No banks registered yet</p>
                        <Link
                            href="/dashboard/bank-settings/add-bank"
                            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                        >
                            Add Your First Bank
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {banks.map((bank) => {
                            // Calculate total balance for this bank in GBP
                            const totalBalanceGBP = bank.accounts.reduce((sum, account) => {
                                return sum + convertToGBP(Number(account.currentBalance || 0), account.currency);
                            }, 0);

                            return (
                                <div key={bank.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-semibold text-white mb-1">{bank.bankName}</h3>
                                                {/* Total Balance Badge */}
                                                <div className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
                                                    <span className="text-xs text-slate-400 mr-1">Total:</span>
                                                    <span className="text-sm font-bold text-emerald-400">
                                                        £{totalBalanceGBP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-sm text-slate-400">{bank.bankType}</p>
                                            {bank.swiftBic && (
                                                <p className="text-sm text-slate-500 mt-1">SWIFT/BIC: {bank.swiftBic}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/dashboard/bank-settings/bank/${bank.id}`}
                                                className="px-3 py-1 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                href={`/dashboard/bank-settings/bank/${bank.id}/add-account`}
                                                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                            >
                                                + Account
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Bank Accounts Grid Component */}
                                    <BankAccountsGrid
                                        initialAccounts={serializeData(bank.accounts)}
                                        bankId={bank.id}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Crypto Wallets Section */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-yellow-200">Crypto Wallets</h2>
                    <Link
                        href="/dashboard/bank-settings/add-crypto-wallet"
                        className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-slate-900 rounded-lg transition-colors font-semibold"
                    >
                        + Add Wallet
                    </Link>
                </div>

                {cryptoWallets.length === 0 ? (
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
                        <p className="text-slate-400 mb-4">No crypto wallets registered yet</p>
                        <Link
                            href="/dashboard/bank-settings/add-crypto-wallet"
                            className="inline-block px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-slate-900 rounded-lg transition-colors font-semibold"
                        >
                            Add Your First Wallet
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cryptoWallets.map((wallet) => (
                            <Link
                                key={wallet.id}
                                href={`/dashboard/bank-settings/crypto-wallet/${wallet.id}`}
                                className="bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-800 p-6 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-1">{wallet.walletName}</h3>
                                        <p className="text-sm text-slate-400">{wallet.walletType}</p>
                                    </div>
                                    <span className="px-2 py-1 text-xs bg-yellow-200 text-slate-900 rounded font-mono font-semibold">
                                        {wallet.asset}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-slate-500">Network:</span>
                                        <span className="text-slate-300">{wallet.blockchain}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-slate-500">Type:</span>
                                        <span className="text-slate-300">{wallet.assetType}</span>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-800 rounded-lg mb-3">
                                    <p className="text-xs text-slate-500 mb-1">Wallet Address:</p>
                                    <p className="text-xs font-mono text-slate-300 break-all">
                                        {wallet.walletAddress}
                                    </p>
                                </div>

                                {wallet.currentBalance !== null && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-white">
                                            {Number(wallet.currentBalance).toFixed(8)} {wallet.asset}
                                        </span>
                                        {wallet.balanceUSD !== null && (
                                            <span className="text-sm text-slate-400">
                                                ${Number(wallet.balanceUSD).toLocaleString()}
                                            </span>
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
