
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuditLogTable } from "@/components/banking/audit-log-table";

export const metadata = {
    title: "Deleted Transactions Audit | Uhuru ERP",
};

export default async function AuditLogPage() {
    // 1. Fetch deleted transactions (newest deleted first)
    const logs = await prisma.deletedTransaction.findMany({
        orderBy: {
            deletedAt: 'desc'
        },
        take: 100 // Limit to last 100 for performance, maybe paginate later
    });

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <Link
                        href="/dashboard/banking"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to Banking
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">Transaction Avoided</h1>
                    <p className="text-slate-400">
                        Audit log of all deleted financial transactions. These records are permanent and read-only.
                    </p>
                </div>

                {/* Audit Table */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-2xl">
                    <AuditLogTable logs={logs} />
                </div>
            </div>
        </div>
    );
}
