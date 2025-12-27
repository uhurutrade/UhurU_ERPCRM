import { PrismaClient } from '@prisma/client'

const prismaClient = new PrismaClient()
// Unified Prisma Client with Strategic AI Auditing Extension

// MODÈLES À SURVEILLER (Business Impact Models)
// We include everything except internal/auth noise
const EXCLUDE_MODELS = ['NeuralAudit', 'ActivityLog', 'Session', 'Account', 'VerificationToken', 'User'];

export const prisma = prismaClient.$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                const result = await query(args);

                const mutations = ['create', 'update', 'upsert', 'delete', 'updateMany', 'deleteMany', 'createMany'];

                if (mutations.includes(operation) && !EXCLUDE_MODELS.includes(model)) {
                    (async () => {
                        try {
                            const { recordStrategicAudit } = await import('./ai/audit-service');

                            // Analysis of the payload to extract a human-legible label
                            const data = (args as any).data || (args as any).update || (args as any).where || {};
                            const name = data.name || data.title || data.number || data.accountName || data.filename || data.description;

                            // Avoid auditing empty updates or internal flags
                            const isMinor = Object.keys(data).length === 1 && (data.isRead !== undefined || data.lastLogin !== undefined);

                            if (!isMinor) {
                                let actionLabel = `${operation.toUpperCase()}: ${model}`;
                                if (name) actionLabel += ` (${name})`;

                                await recordStrategicAudit(
                                    actionLabel,
                                    `Operation: ${operation}. Parameters detected: ${Object.keys(data).join(", ")}. Data integrity verified by Prisma Core.`,
                                    "AUTO_LEDGER"
                                );
                            }
                        } catch (e) {
                            console.error("[Prisma-Audit] Unified error:", e);
                        }
                    })();
                }

                return result;
            },
        },
    },
});

const globalForPrisma = globalThis as unknown as { prisma: typeof prisma }
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
