import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const banks = await prisma.bank.findMany({
            include: {
                accounts: true,
            },
            orderBy: { bankName: 'asc' },
        });
        return NextResponse.json(banks);
    } catch (error) {
        console.error("Error fetching banks:", error);
        return NextResponse.json(
            { error: "Failed to fetch banks" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        const bank = await prisma.bank.create({
            data: {
                bankName: data.bankName,
                bankType: data.bankType,
                swiftBic: data.swiftBic || null,
                bankCode: data.bankCode || null,
                website: data.website || null,
                supportEmail: data.supportEmail || null,
                supportPhone: data.supportPhone || null,
                bankAddress: data.bankAddress || null,
                bankCity: data.bankCity || null,
                bankPostcode: data.bankPostcode || null,
                bankCountry: data.bankCountry || null,
                notes: data.notes || null,
            },
        });

        // Trigger RAG Sync (Background)
        const { syncBankingOverview } = await import('@/lib/ai/auto-sync-rag');
        syncBankingOverview();

        return NextResponse.json(bank);
    } catch (error) {
        console.error("Error creating bank:", error);
        return NextResponse.json(
            { error: "Failed to create bank" },
            { status: 500 }
        );
    }
}
