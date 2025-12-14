
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Check authentication
        if (!session?.user) {
            if (process.env.NODE_ENV === 'production') {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            } else {
                console.warn("⚠️ DEV MODE: Allowing delete without active session for debugging.");
            }
        }

        const body = await req.json();
        const { transactionIds, reason } = body;

        if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
            return new NextResponse("Invalid transaction IDs", { status: 400 });
        }

        // 1. Fetch original transactions to be deleted
        const transactionsToDelete = await prisma.bankTransaction.findMany({
            where: {
                id: {
                    in: transactionIds,
                },
            },
            include: {
                bankAccount: {
                    include: {
                        bank: true,
                    },
                },
            },
        });

        if (transactionsToDelete.length === 0) {
            return new NextResponse("No transactions found", { status: 404 });
        }

        // 2. Archive transactions to DeletedTransaction (Audit Log)
        // We do this in a transaction to ensure atomicity
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
                        deletedBy: session?.user?.email || "Unknown User",
                        reason: reason || "Manual Deletion",
                        fullSnapshot: JSON.stringify(t),
                    },
                });
            }

            // b. Delete attachments associated with these transactions
            await tx.attachment.deleteMany({
                where: {
                    transactionId: {
                        in: transactionIds
                    }
                }
            });

            // c. Delete original transactions
            await tx.bankTransaction.deleteMany({
                where: {
                    id: {
                        in: transactionIds,
                    },
                },
            });
        });

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
