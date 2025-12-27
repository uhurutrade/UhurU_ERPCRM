export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import AddAccountForm from "@/components/bank-settings/add-account-form";
import Link from "next/link";
import { notFound } from "next/navigation";

interface AddAccountPageProps {
    params: {
        id: string;
    };
}

export default async function AddAccountPage({ params }: AddAccountPageProps) {
    const bank = await prisma.bank.findUnique({
        where: {
            id: params.id,
        },
    });

    if (!bank) {
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
                <h1 className="text-3xl font-bold mb-2">Add Bank Account</h1>
                <p className="text-slate-400">
                    Add a new currency account to {bank.bankName}
                </p>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <AddAccountForm bankId={bank.id} />
            </div>
        </div>
    );
}
