export const dynamic = "force-dynamic";
import AddBankForm from "@/components/bank-settings/add-bank-form";
import Link from "next/link";

export default function AddBankPage() {
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
                <h1 className="text-3xl font-bold mb-2">Add New Bank</h1>
                <p className="text-slate-400">
                    Register a new bank to manage multiple currency accounts
                </p>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <AddBankForm />
            </div>
        </div>
    );
}
