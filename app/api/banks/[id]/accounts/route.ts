import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const data = await req.json();

        // If this is set as primary, unset other primary accounts for this currency
        if (data.isPrimary) {
            await prisma.bankAccount.updateMany({
                where: {
                    currency: data.currency,
                    isPrimary: true,
                },
                data: { isPrimary: false },
            });
        }

        const account = await prisma.bankAccount.create({
            data: {
                bankId: params.id,
                accountName: data.accountName,
                accountType: data.accountType,
                currency: data.currency,
                iban: data.iban || null,
                accountNumber: data.accountNumber || null,
                routingNumber: data.routingNumber || null,
                wireRoutingNumber: data.wireRoutingNumber || null,
                sortCode: data.sortCode || null,
                accountNumberUK: data.accountNumberUK || null,
                swiftBic: data.swiftBic || null,
                currentBalance: data.currentBalance ? parseFloat(data.currentBalance) : 0,
                isPrimary: data.isPrimary || false,
                isActive: true, // Default to true
            },
        });

        return NextResponse.json(account);
    } catch (error) {
        console.error("Error creating bank account:", error);
        return NextResponse.json(
            { error: "Failed to create bank account" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const accounts = await prisma.bankAccount.findMany({
            where: { bankId: params.id },
            orderBy: { currency: 'asc' },
        });

        return NextResponse.json(accounts);
    } catch (error) {
        console.error("Error fetching accounts:", error);
        return NextResponse.json(
            { error: "Failed to fetch accounts" },
            { status: 500 }
        );
    }
}
