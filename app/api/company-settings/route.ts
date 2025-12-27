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

            // UK Filing Matrix Dates
            lastConfirmationStatementDate: data.lastConfirmationStatementDate ? new Date(data.lastConfirmationStatementDate) : undefined,
            lastAccountsCompaniesHouseDate: data.lastAccountsCompaniesHouseDate ? new Date(data.lastAccountsCompaniesHouseDate) : undefined,
            lastAccountsHMRCDate: data.lastAccountsHMRCDate ? new Date(data.lastAccountsHMRCDate) : undefined,
            lastFYEndDate: data.lastFYEndDate ? new Date(data.lastFYEndDate) : undefined,
            nextConfirmationStatementDue: data.nextConfirmationStatementDue ? new Date(data.nextConfirmationStatementDue) : undefined,
            nextAccountsCompaniesHouseDue: data.nextAccountsCompaniesHouseDue ? new Date(data.nextAccountsCompaniesHouseDue) : undefined,
            nextAccountsHMRCDue: data.nextAccountsHMRCDue ? new Date(data.nextAccountsHMRCDue) : undefined,
            nextFYEndDate: data.nextFYEndDate ? new Date(data.nextFYEndDate) : undefined,

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

        // Trigger RAG Auto-Sync (Async)
        try {
            const { syncCompanySettings } = await import("@/lib/ai/auto-sync-rag");
            syncCompanySettings().catch(err => console.error("RAG Auto-Sync Error:", err));
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

            // UK Filing Matrix Dates
            lastConfirmationStatementDate: updateData.lastConfirmationStatementDate ? new Date(updateData.lastConfirmationStatementDate) : undefined,
            lastAccountsCompaniesHouseDate: updateData.lastAccountsCompaniesHouseDate ? new Date(updateData.lastAccountsCompaniesHouseDate) : undefined,
            lastAccountsHMRCDate: updateData.lastAccountsHMRCDate ? new Date(updateData.lastAccountsHMRCDate) : undefined,
            lastFYEndDate: updateData.lastFYEndDate ? new Date(updateData.lastFYEndDate) : undefined,
            nextConfirmationStatementDue: updateData.nextConfirmationStatementDue ? new Date(updateData.nextConfirmationStatementDue) : undefined,
            nextAccountsCompaniesHouseDue: updateData.nextAccountsCompaniesHouseDue ? new Date(updateData.nextAccountsCompaniesHouseDue) : undefined,
            nextAccountsHMRCDue: updateData.nextAccountsHMRCDue ? new Date(updateData.nextAccountsHMRCDue) : undefined,
            nextFYEndDate: updateData.nextFYEndDate ? new Date(updateData.nextFYEndDate) : undefined,

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

        // Trigger RAG Auto-Sync (Async - No bloqueante)
        try {
            const { syncCompanySettings } = await import("@/lib/ai/auto-sync-rag");
            syncCompanySettings(); // Fire and forget
        } catch (e) { /* Silent fail - no afecta al usuario */ }

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
