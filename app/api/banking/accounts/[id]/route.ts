import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const account = await prisma.bankAccount.findUnique({
            where: { id: params.id },
        });

        if (!account) {
            return NextResponse.json(
                { error: "Account not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(account);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch account" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const data = await req.json();

        // If this is set as primary, unset other primary accounts for this currency
        if (data.isPrimary) {
            // First get the account to know the currency
            const account = await prisma.bankAccount.findUnique({
                where: { id: params.id },
            });

            if (account) {
                await prisma.bankAccount.updateMany({
                    where: {
                        currency: account.currency,
                        isPrimary: true,
                        NOT: { id: params.id },
                    },
                    data: { isPrimary: false },
                });
            }
        }

        const updatedAccount = await prisma.bankAccount.update({
            where: { id: params.id },
            data: {
                accountName: data.accountName,
                accountType: data.accountType,
                iban: data.iban || null,
                accountNumber: data.accountNumber || null,
                routingNumber: data.routingNumber || null,
                wireRoutingNumber: data.wireRoutingNumber || null,
                sortCode: data.sortCode || null,
                accountNumberUK: data.accountNumberUK || null,
                swiftBic: data.swiftBic || null,
                currentBalance: data.currentBalance ? parseFloat(data.currentBalance) : undefined,
                isPrimary: data.isPrimary,
                isActive: data.isActive,
            },
        });

        return NextResponse.json(updatedAccount);
    } catch (error) {
        console.error("Error updating account:", error);
        return NextResponse.json(
            { error: "Failed to update account" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // 1. Check if there are transactions
        const transactionCount = await prisma.bankTransaction.count({
            where: { bankAccountId: params.id },
        });

        if (transactionCount > 0) {
            // 2. If transactions exist, DO NOT DELETE. Archive instead.
            await prisma.bankAccount.update({
                where: { id: params.id },
                data: { isActive: false },
            });

            return NextResponse.json({
                success: true,
                action: "archived",
                message: "Account has associated transactions. It has been marked as INACTIVE instead of deleted, to preserve financial history."
            });
        }

        // 3. If no transactions, safe to delete
        await prisma.bankAccount.delete({
            where: { id: params.id },
        });

        return NextResponse.json({
            success: true,
            action: "deleted",
            message: "Account deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting account:", error);
        return NextResponse.json(
            { error: "Failed to delete account" },
            { status: 500 }
        );
    }
}
