export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import EditBankForm from "@/components/bank-settings/edit-bank-form";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditBankPageProps {
    params: {
        id: string;
    };
}

export default async function EditBankPage({ params }: EditBankPageProps) {
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
                <h1 className="text-3xl font-bold mb-2">Edit Bank</h1>
                <p className="text-slate-400">
                    Update details for {bank.bankName}
                </p>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <EditBankForm bank={bank} />
            </div>
        </div>
    );
}
