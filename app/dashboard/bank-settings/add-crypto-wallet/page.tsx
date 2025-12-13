import AddCryptoWalletForm from "@/components/bank-settings/add-crypto-wallet-form";
import Link from "next/link";

export default function AddCryptoWalletPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/bank-settings"
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    ← Back to Bank Settings
                </Link>
            </div>

            <div>
                <h1 className="text-3xl font-bold mb-2">Add Crypto Wallet</h1>
                <p className="text-slate-400">
                    Register a corporate crypto wallet for receiving and managing digital assets
                </p>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <AddCryptoWalletForm />
            </div>
        </div>
    );
}
