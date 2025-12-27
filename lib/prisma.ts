import { PrismaClient } from '@prisma/client'

const prismaClient = new PrismaClient()
// Unified Prisma Client with Strategic AI Auditing Extension

// MODÈLES À IGNORER COMPLETAMENTE (RUIDO TÉCNICO PURO)
const EXCLUDE_MODELS = [
    'NeuralAudit',
    'ActivityLog',
    'Session',
    'Account',
    'VerificationToken',
    'User',
    'DocumentChunk',
    'Activity'
];

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

                            const dataArg = (args as any).data || (args as any).update || (args as any).where || {};

                            // 🛑 FILTER NOISE: Ignore individual transactions created during a bulk statement upload
                            if (model === 'BankTransaction' && operation === 'create' && (dataArg.bankStatementId || dataArg.externalId)) {
                                return;
                            }

                            // 🛑 FILTER NOISE: Ignore bulk operations that aren't manual (summarize them later if needed)
                            if (['createMany', 'updateMany', 'deleteMany'].includes(operation)) {
                                const count = (args as any).data?.length || "multiple";
                                await recordStrategicAudit(
                                    `BULK ${operation.toUpperCase()}: ${model}`,
                                    `Multiple records (${count}) affected by system process or bulk action.`,
                                    "BULK_OPERATION"
                                );
                                return;
                            }

                            // Redact sensitive or noisy data from the audit log
                            const redact = (obj: any) => {
                                const clean: any = {};
                                const ignoreKeys = ['id', 'createdAt', 'updatedAt', 'userId', 'token', 'password', 'hash', 'fileHash'];
                                for (const key in obj) {
                                    if (!ignoreKeys.includes(key)) {
                                        clean[key] = obj[key];
                                    }
                                }
                                return clean;
                            };

                            const cleanData = redact(dataArg);
                            const name = cleanData.name || cleanData.title || cleanData.number || cleanData.accountName || cleanData.filename || cleanData.description;

                            // Avoid auditing trivial updates
                            const isMinor = Object.keys(cleanData).length === 1 && (cleanData.isRead !== undefined || cleanData.lastLogin !== undefined);

                            if (!isMinor) {
                                let actionLabel = `${operation.toUpperCase()}: ${model}`;
                                if (name) actionLabel += ` (${name})`;

                                await recordStrategicAudit(
                                    actionLabel,
                                    JSON.stringify({
                                        operation,
                                        model,
                                        changedFields: Object.keys(cleanData),
                                        values: cleanData
                                    }),
                                    "USER_ACTION"
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
