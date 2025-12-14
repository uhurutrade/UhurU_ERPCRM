import { prisma } from "@/lib/prisma";
import EditAccountForm from "@/components/bank-settings/edit-account-form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serializeData } from "@/lib/serialization";

interface EditAccountPageProps {
    params: {
        id: string;
    };
}

export default async function EditAccountPage({ params }: EditAccountPageProps) {
    const account = await prisma.bankAccount.findUnique({
        where: {
            id: params.id,
        },
        include: {
            bank: true,
        },
    });

    if (!account) {
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
                <h1 className="text-3xl font-bold mb-2">Edit Account</h1>
                <p className="text-slate-400">
                    Manage {account.accountName}
                </p>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <EditAccountForm account={serializeData(account)} bankName={account.bank.bankName} />
            </div>
        </div>
    );
}
