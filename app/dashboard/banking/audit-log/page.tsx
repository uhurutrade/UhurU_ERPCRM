
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuditLogTable } from "@/components/banking/audit-log-table";

export const metadata = {
    title: "Deleted Transactions Audit | Uhuru ERP",
};

export default async function AuditLogPage({
    searchParams
}: {
    searchParams: { page?: string, query?: string }
}) {
    const currentPage = Number(searchParams.page) || 1;
    const query = searchParams.query || "";
    const itemsPerPage = 25;

    // --- Build Where Clause ---
    const whereClause: any = query ? {
        OR: [
            { description: { contains: query, mode: 'insensitive' } },
            { deletedBy: { contains: query, mode: 'insensitive' } },
            { bankName: { contains: query, mode: 'insensitive' } },
            { reason: { contains: query, mode: 'insensitive' } }
        ]
    } : {};

    // --- Execute Query ---
    const [totalItems, logs] = await Promise.all([
        prisma.deletedTransaction.count({ where: whereClause }),
        prisma.deletedTransaction.findMany({
            where: whereClause,
            orderBy: { deletedAt: 'desc' },
            take: itemsPerPage,
            skip: (currentPage - 1) * itemsPerPage
        })
    ]);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

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
                    <AuditLogTable
                        logs={logs}
                        totalPages={totalPages}
                        currentPage={currentPage}
                    />
                </div>
            </div>
        </div>
    );
}
