import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { accounts } = await req.json();

        // Use transaction to ensure all updates happen or none
        await prisma.$transaction(
            accounts.map((account: { id: string; order: number }) =>
                prisma.bankAccount.update({
                    where: { id: account.id },
                    data: { order: account.order },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error reordering accounts:", error);
        return NextResponse.json(
            { error: "Failed to reorder accounts" },
            { status: 500 }
        );
    }
}
