import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
    try {
        await prisma.deletedTransaction.deleteMany();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error clearing audit log:", error);
        return NextResponse.json(
            { error: "Failed to clear audit log" },
            { status: 500 }
        );
    }
}
