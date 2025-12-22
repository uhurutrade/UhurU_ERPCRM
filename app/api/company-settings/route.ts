import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Convert date strings to Date objects
        const processedData = {
            ...data,
            incorporationDate: data.incorporationDate ? new Date(data.incorporationDate) : undefined,
            accountsNextDueDate: data.accountsNextDueDate ? new Date(data.accountsNextDueDate) : undefined,
            confirmationNextDueDate: data.confirmationNextDueDate ? new Date(data.confirmationNextDueDate) : undefined,
            vatRegistrationDate: data.vatRegistrationDate ? new Date(data.vatRegistrationDate) : undefined,
            shareCapital: data.shareCapital ? parseFloat(data.shareCapital) : undefined,
            numberOfShares: data.numberOfShares ? parseInt(data.numberOfShares) : undefined,
        };

        // Remove undefined values
        Object.keys(processedData).forEach(key => {
            if (processedData[key] === undefined || processedData[key] === "") {
                delete processedData[key];
            }
        });

        const companySettings = await prisma.companySettings.create({
            data: processedData,
        });

        // Trigger RAG Vectorization (Async)
        try {
            const { ingestText } = await import("@/lib/ai/rag-engine");
            const content = `COMPANY SETTINGS (NEW):\n${JSON.stringify(companySettings, null, 2)}`;
            ingestText('sys_company_settings', 'Company Settings & Legal', content)
                .catch(err => console.error("RAG Create Error:", err));
        } catch (e) { console.error("RAG Import Error:", e); }

        return NextResponse.json(companySettings);
    } catch (error) {
        console.error("Error creating company settings:", error);
        return NextResponse.json(
            { error: "Failed to create company settings" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const data = await req.json();
        const { id, ...updateData } = data;

        if (!id) {
            return NextResponse.json(
                { error: "Company settings ID is required" },
                { status: 400 }
            );
        }

        // Convert date strings to Date objects
        const processedData = {
            ...updateData,
            incorporationDate: updateData.incorporationDate ? new Date(updateData.incorporationDate) : undefined,
            accountsNextDueDate: updateData.accountsNextDueDate ? new Date(updateData.accountsNextDueDate) : undefined,
            confirmationNextDueDate: updateData.confirmationNextDueDate ? new Date(updateData.confirmationNextDueDate) : undefined,
            vatRegistrationDate: updateData.vatRegistrationDate ? new Date(updateData.vatRegistrationDate) : undefined,
            shareCapital: updateData.shareCapital ? parseFloat(updateData.shareCapital) : undefined,
            numberOfShares: updateData.numberOfShares ? parseInt(updateData.numberOfShares) : undefined,
        };

        // Remove undefined values
        Object.keys(processedData).forEach(key => {
            if (processedData[key] === undefined || processedData[key] === "") {
                delete processedData[key];
            }
        });

        const companySettings = await prisma.companySettings.update({
            where: { id },
            data: processedData,
        });

        // Trigger RAG Vectorization (Async)
        try {
            const { ingestText } = await import("@/lib/ai/rag-engine");
            const content = `COMPANY SETTINGS UPDATE:\n${JSON.stringify(companySettings, null, 2)}`;
            // We don't await this to keep UI snappy
            ingestText('sys_company_settings', 'Company Settings & Legal', content)
                .catch(err => console.error("RAG Update Error:", err));
        } catch (e) { console.error("RAG Import Error:", e); }

        return NextResponse.json(companySettings);
    } catch (error) {
        console.error("Error updating company settings:", error);
        return NextResponse.json(
            { error: "Failed to update company settings" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const companySettings = await prisma.companySettings.findFirst();
        return NextResponse.json(companySettings);
    } catch (error) {
        console.error("Error fetching company settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch company settings" },
            { status: 500 }
        );
    }
}
