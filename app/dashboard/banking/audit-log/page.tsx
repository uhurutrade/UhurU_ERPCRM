import { prisma } from "@/lib/prisma";
import AuditLogClient from "./audit-log-client";

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
    const itemsPerPage = 20;

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

    // Serialize data for client component
    const serializedLogs = logs.map(log => ({
        ...log,
        amount: log.amount.toString(),
        date: log.date.toISOString(),
        deletedAt: log.deletedAt.toISOString()
    }));

    return (
        <AuditLogClient
            logs={serializedLogs}
            totalPages={totalPages}
            currentPage={currentPage}
        />
    );
}
