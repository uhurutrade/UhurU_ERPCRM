
import { prisma } from "@/lib/prisma";
import EditCryptoWalletForm from "@/components/bank-settings/edit-crypto-wallet-form";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditCryptoWalletPageProps {
    params: {
        id: string;
    };
}

export default async function EditCryptoWalletPage({ params }: EditCryptoWalletPageProps) {
    const wallet = await prisma.cryptoWallet.findUnique({
        where: {
            id: params.id,
        },
    });

    if (!wallet) {
        notFound();
    }

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
                <h1 className="text-3xl font-bold mb-2">Edit Crypto Wallet</h1>
                <p className="text-slate-400">
                    Update details for {wallet.walletName}
                </p>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <EditCryptoWalletForm wallet={wallet} />
            </div>
        </div>
    );
}
