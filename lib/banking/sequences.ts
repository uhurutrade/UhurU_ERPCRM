import { prisma } from '../prisma';

/**
 * Calculates a stable chronological sequence number for transactions.
 * Higher numbers = More recent transactions.
 * Oldest transaction ever = #1.
 */
export async function getTransactionSequences(transactions: any[]) {
    if (transactions.length === 0) return {};

    const results = await Promise.all(transactions.map(async (tx) => {
        const countBefore = await prisma.bankTransaction.count({
            where: {
                OR: [
                    { date: { lt: tx.date } },
                    {
                        AND: [
                            { date: tx.date },
                            { createdAt: { lte: tx.createdAt } }
                        ]
                    }
                ]
            }
        });
        return { id: tx.id, seq: countBefore };
    }));

    const map: Record<string, number> = {};
    results.forEach(r => map[r.id] = r.seq);
    return map;
}

export async function getSingleTransactionSequence(txId: string) {
    const tx = await prisma.bankTransaction.findUnique({ where: { id: txId } });
    if (!tx) return null;

    const count = await prisma.bankTransaction.count({
        where: {
            OR: [
                { date: { lt: tx.date } },
                {
                    AND: [
                        { date: tx.date },
                        { createdAt: { lte: tx.createdAt } }
                    ]
                }
            ]
        }
    });
    return count;
}
