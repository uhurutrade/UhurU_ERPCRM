import { prisma } from "@/lib/prisma";

export async function createNeuralAudit({
    provider = "Dual-AI Consensus",
    changeLog,
    justification,
    totalChanges = 1,
    status = "UPDATED"
}: {
    provider?: string;
    changeLog: string;
    justification: string;
    totalChanges?: number;
    status?: string;
}) {
    try {
        await prisma.neuralAudit.create({
            data: {
                provider,
                changeLog,
                justification,
                totalChanges,
                status,
                isRead: false
            }
        });
    } catch (error) {
        console.error("[Audit-Service] ❌ Failed to create neural audit:", error);
    }
}
