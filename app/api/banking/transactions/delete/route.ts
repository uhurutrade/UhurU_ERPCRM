import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        // Check authentication
        // No active session check, auth bypassed as per instruction.

        const body = await req.json();
        const { transactionIds, reason, deleteAllMatching, query } = body;

        let transactionsToDelete: any[] = [];

        if (deleteAllMatching) {
            // --- GLOBAL DELETION LOGIC ---
            // 1. Find all eligible transactions based on search query
            const whereClause: Prisma.BankTransactionWhereInput = {};
            if (query) {
                whereClause.OR = [
                    { description: { contains: query, mode: 'insensitive' } },
                    { category: { contains: query, mode: 'insensitive' } },
                    { reference: { contains: query, mode: 'insensitive' } },
                    { counterparty: { contains: query, mode: 'insensitive' } },
                    { merchant: { contains: query, mode: 'insensitive' } },
                    { bankAccount: { bank: { bankName: { contains: query, mode: 'insensitive' } } } },
                ];
            }

            // We must fetch them all to create the audit log snapshots
            transactionsToDelete = await prisma.bankTransaction.findMany({
                where: whereClause,
                include: {
                    bankAccount: { include: { bank: true } },
                    attachments: true,
                },
            });

        } else {
            // --- ID-BASED DELETION LOGIC (Standard) ---
            if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
                return new NextResponse("Invalid transaction IDs", { status: 400 });
            }

            transactionsToDelete = await prisma.bankTransaction.findMany({
                where: {
                    id: { in: transactionIds },
                },
                include: {
                    bankAccount: { include: { bank: true } },
                    attachments: true,
                },
            });
        }

        if (transactionsToDelete.length === 0) {
            return new NextResponse("No transactions found to delete", { status: 404 });
        }

        // Extract IDs for final deletion step
        const finalIds = transactionsToDelete.map(t => t.id);

        // 2. Archive transactions to DeletedTransaction (Audit Log)
        // We do this in a transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // a. Create audit records
            for (const t of transactionsToDelete) {
                await tx.deletedTransaction.create({
                    data: {
                        originalId: t.id,
                        amount: t.amount,
                        currency: t.currency,
                        description: t.description,
                        date: t.date,
                        bankAccountName: t.bankAccount.accountName,
                        bankName: t.bankAccount.bank.bankName,
                        deletedBy: "Admin",
                        reason: reason || "Manual Deletion",
                        fullSnapshot: JSON.stringify(t),
                    },
                });
            }

            // b. Unlink attachments (set transactionId to null) instead of deleting them
            // This preserves the files for the audit log
            await tx.attachment.updateMany({
                where: {
                    transactionId: {
                        in: finalIds
                    }
                },
                data: {
                    transactionId: null
                }
            });

            // c. Delete original transactions
            await tx.bankTransaction.deleteMany({
                where: {
                    id: {
                        in: finalIds,
                    },
                },
            });
        });

        // Trigger RAG Auto-Sync (Async - No bloqueante)
        try {
            const { syncRecentTransactions, syncDeletedTransactions } = await import("@/lib/ai/auto-sync-rag");
            syncRecentTransactions();
            syncDeletedTransactions();
        } catch (e) { /* Silent fail */ }

        return NextResponse.json({
            success: true,
            count: transactionsToDelete.length,
            message: `Successfully archived and deleted ${transactionsToDelete.length} transactions.`,
        });
    } catch (error: any) {
        console.error("[TRANSACTION_DELETE_AUDIT] Error:", error);

        let errorMessage = "We encountered an issue processing your secure deletion request. Please try again.";

        // Prisma & Custom Error Codes
        if (error.code === 'P2003') {
            errorMessage = "These transactions cannot be deleted because they are referenced by other system records (e.g., Invoices or Tax entries).";
        } else if (error.code === 'P2025') {
            errorMessage = "Some items could not be found. They might have been deleted already.";
        } else if (error instanceof SyntaxError) {
            errorMessage = "There was a technical problem with the request format.";
        } else if (error.message?.includes("Invalid transaction IDs")) {
            errorMessage = "Please select at least one transaction to delete.";
        }

        return NextResponse.json(
            { error: errorMessage, details: error.message },
            { status: 500 }
        );
    }
}
