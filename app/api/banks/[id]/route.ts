import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const bank = await prisma.bank.findUnique({
            where: { id: params.id },
            include: { accounts: true },
        });

        if (!bank) {
            return NextResponse.json(
                { error: "Bank not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(bank);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch bank" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const data = await req.json();

        const bank = await prisma.bank.update({
            where: { id: params.id },
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

        return NextResponse.json(bank);
    } catch (error) {
        console.error("Error updating bank:", error);
        return NextResponse.json(
            { error: "Failed to update bank" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await prisma.bank.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting bank:", error);
        return NextResponse.json(
            { error: "Failed to delete bank" },
            { status: 500 }
        );
    }
}
