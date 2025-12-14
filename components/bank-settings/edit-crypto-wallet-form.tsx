"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CryptoWallet } from "@prisma/client";
import { Trash } from "lucide-react";

import { useConfirm } from "@/components/providers/modal-provider";

interface EditCryptoWalletFormProps {
    wallet: CryptoWallet;
}

export default function EditCryptoWalletForm({ wallet }: EditCryptoWalletFormProps) {
    const router = useRouter();
    const { confirm } = useConfirm();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        walletName: wallet.walletName,
        walletType: wallet.walletType,
        blockchain: wallet.blockchain,
        network: wallet.network,
        asset: wallet.asset,
        assetType: wallet.assetType,
        contractAddress: wallet.contractAddress || "",
        walletAddress: wallet.walletAddress,
        provider: wallet.provider || "",
        isMultiSig: wallet.isMultiSig,
        requiredSignatures: wallet.requiredSignatures || 1,
        notes: wallet.notes || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/crypto-wallets/${wallet.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to update crypto wallet");
            }

            // Artificial delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            router.push(`/dashboard/bank-settings`);
            router.refresh();
        } catch (error) {
            console.error("Error updating crypto wallet:", error);
            await confirm({
                title: "Error",
                message: "Error updating crypto wallet. Please try again.",
                type: "danger",
                confirmText: "Close",
                cancelText: "",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: "Delete Wallet",
            message: "Are you sure you want to delete this wallet? This action cannot be undone.",
            type: "danger",
            confirmText: "Delete",
            cancelText: "Cancel",
        });

        if (confirmed) {
            setLoading(true);
            try {
                const response = await fetch(`/api/crypto-wallets/${wallet.id}`, {
                    method: "DELETE",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error("Failed to delete crypto wallet");
                }

                if (data.action === "archived") {
                    await confirm({
                        title: "Wallet Deactivated",
                        message: data.message || "This wallet has transactions and cannot be fully deleted. It has been marked as Inactive.",
                        type: "info",
                        confirmText: "Understood",
                        cancelText: "",
                    });
                }

                router.push(`/dashboard/bank-settings`);
                router.refresh();
            } catch (error) {
                console.error("Error deleting crypto wallet:", error);
                await confirm({
                    title: "Error",
                    message: "Error deleting crypto wallet. Please try again.",
                    type: "danger",
                    confirmText: "Close",
                    cancelText: "",
                });
                setLoading(false);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    // Contract addresses for common tokens
    const getContractAddress = (blockchain: string, asset: string) => {
        const contracts: Record<string, Record<string, string>> = {
            ETHEREUM: {
                USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            },
            POLYGON: {
                USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
                USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
            },
        };
        return contracts[blockchain]?.[asset] || "";
    };

    // Auto-fill contract address when blockchain/asset changes
    const handleBlockchainOrAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };

        if (name === "blockchain" || name === "asset") {
            const contractAddr = getContractAddress(
                name === "blockchain" ? value : formData.blockchain,
                name === "asset" ? value : formData.asset
            );
            if (contractAddr) {
                newFormData.contractAddress = contractAddr;
            }
        }

        setFormData(newFormData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-purple-400">Basic Information</h2>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-md transition-colors"
                >
                    <Trash className="w-4 h-4" />
                    Delete Wallet
                </button>
            </div>

            {/* Basic Information */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Wallet Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="walletName"
                            value={formData.walletName}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Corporate USDC Wallet, BTC Treasury"
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Wallet Type <span className="text-rose-400">*</span>
                        </label>
                        <select
                            name="walletType"
                            value={formData.walletType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        >
                            <option value="HOT_WALLET">Hot Wallet</option>
                            <option value="COLD_WALLET">Cold Wallet</option>
                            <option value="HARDWARE">Hardware Wallet</option>
                            <option value="EXCHANGE">Exchange Wallet</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Provider
                        </label>
                        <input
                            type="text"
                            name="provider"
                            value={formData.provider}
                            onChange={handleChange}
                            placeholder="e.g., MetaMask, Ledger, Coinbase"
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        />
                    </div>
                </div>
            </section>

            {/* Blockchain & Asset */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-purple-400">Blockchain & Asset</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Blockchain <span className="text-rose-400">*</span>
                        </label>
                        <select
                            name="blockchain"
                            value={formData.blockchain}
                            onChange={handleBlockchainOrAssetChange}
                            required
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        >
                            <option value="BITCOIN">Bitcoin</option>
                            <option value="ETHEREUM">Ethereum</option>
                            <option value="POLYGON">Polygon</option>
                            <option value="BINANCE_SMART_CHAIN">Binance Smart Chain</option>
                            <option value="ARBITRUM">Arbitrum</option>
                            <option value="OPTIMISM">Optimism</option>
                            <option value="BASE">Base</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Network <span className="text-rose-400">*</span>
                        </label>
                        <select
                            name="network"
                            value={formData.network}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        >
                            <option value="MAINNET">Mainnet</option>
                            <option value="TESTNET">Testnet</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Asset <span className="text-rose-400">*</span>
                        </label>
                        <select
                            name="asset"
                            value={formData.asset}
                            onChange={handleBlockchainOrAssetChange}
                            required
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        >
                            <option value="BTC">BTC (Bitcoin)</option>
                            <option value="ETH">ETH (Ethereum)</option>
                            <option value="USDC">USDC (USD Coin)</option>
                            <option value="USDT">USDT (Tether)</option>
                            <option value="DAI">DAI</option>
                            <option value="MATIC">MATIC (Polygon)</option>
                            <option value="BNB">BNB (Binance Coin)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Asset Type <span className="text-rose-400">*</span>
                        </label>
                        <select
                            name="assetType"
                            value={formData.assetType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        >
                            <option value="NATIVE">Native (BTC, ETH, etc.)</option>
                            <option value="ERC20">ERC-20 Token</option>
                            <option value="BEP20">BEP-20 Token</option>
                            <option value="SPL">SPL Token (Solana)</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Contract Address (for tokens)
                        </label>
                        <input
                            type="text"
                            name="contractAddress"
                            value={formData.contractAddress}
                            onChange={handleChange}
                            placeholder="0x..."
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white font-mono text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Auto-filled for common tokens. Verify on blockchain explorer.
                        </p>
                    </div>
                </div>
            </section>

            {/* Wallet Address */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-purple-400">Wallet Address</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Public Wallet Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                        type="text"
                        name="walletAddress"
                        value={formData.walletAddress}
                        onChange={handleChange}
                        required
                        placeholder="0x... or bc1... (depending on blockchain)"
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white font-mono text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        This is your public address for receiving funds. Never share your private key.
                    </p>
                </div>
            </section>

            {/* Security */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-purple-400">Security Settings</h2>
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="isMultiSig"
                                checked={formData.isMultiSig}
                                onChange={handleChange}
                                className="w-5 h-5 bg-slate-800 border border-slate-700 rounded focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-slate-300">Multi-Signature Wallet</span>
                        </label>
                    </div>

                    {formData.isMultiSig && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Required Signatures
                            </label>
                            <input
                                type="number"
                                name="requiredSignatures"
                                value={formData.requiredSignatures}
                                onChange={handleChange}
                                min="1"
                                max="10"
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            />
                        </div>
                    )}
                </div>
            </section>

            {/* Notes */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-purple-400">Additional Notes</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Notes
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Add any additional information about this wallet..."
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                </div>
            </section>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
