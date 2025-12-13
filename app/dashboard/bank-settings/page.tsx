import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function BankSettingsPage() {
    // Fetch all banks with their accounts
    const banks = await prisma.bank.findMany({
        include: {
            accounts: {
                orderBy: { currency: 'asc' }
            }
        },
        orderBy: { bankName: 'asc' }
    });

    // Fetch all crypto wallets
    const cryptoWallets = await prisma.cryptoWallet.findMany({
        orderBy: { walletName: 'asc' }
    });

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
                    <h2 className="text-2xl font-semibold text-emerald-400">Traditional Banks</h2>
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
                        {banks.map((bank) => (
                            <div key={bank.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-1">{bank.bankName}</h3>
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

                                {/* Bank Accounts */}
                                {bank.accounts.length > 0 ? (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-slate-300 mb-2">Accounts:</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {bank.accounts.map((account) => (
                                                <Link
                                                    key={account.id}
                                                    href={`/dashboard/bank-settings/account/${account.id}`}
                                                    className="p-4 bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 transition-colors"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-mono text-lg font-bold text-emerald-400">
                                                            {account.currency}
                                                        </span>
                                                        {account.isPrimary && (
                                                            <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded">
                                                                Primary
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-300 mb-1">{account.accountName}</p>
                                                    <p className="text-xs text-slate-500">{account.accountType}</p>
                                                    {account.iban && (
                                                        <p className="text-xs text-slate-600 mt-2 font-mono">
                                                            {account.iban.substring(0, 20)}...
                                                        </p>
                                                    )}
                                                    {account.currentBalance !== null && (
                                                        <p className="text-sm font-semibold text-white mt-2">
                                                            {Number(account.currentBalance).toLocaleString()} {account.currency}
                                                        </p>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No accounts added yet</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Crypto Wallets Section */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-purple-400">Crypto Wallets</h2>
                    <Link
                        href="/dashboard/bank-settings/add-crypto-wallet"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                        + Add Wallet
                    </Link>
                </div>

                {cryptoWallets.length === 0 ? (
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
                        <p className="text-slate-400 mb-4">No crypto wallets registered yet</p>
                        <Link
                            href="/dashboard/bank-settings/add-crypto-wallet"
                            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
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
                                    <span className="px-2 py-1 text-xs bg-purple-500 text-white rounded font-mono">
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
