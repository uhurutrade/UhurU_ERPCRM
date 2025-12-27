
import { prisma } from "@/lib/prisma";
import { getAIClient } from "@/lib/ai/ai-service";
import { getFinancialContext } from "@/lib/ai/financial-context";

/**
 * Recalculates all UK compliance deadlines using AI without user intervention.
 * This is triggered automatically during system load or background syncs.
 */
export async function recalculateComplianceDeadlines() {
    console.log("[Compliance-Service] 🤖 Starting automatic deadline recalculation...");

    try {
        const settings = await prisma.companySettings.findFirst();
        if (!settings) return;

        // Get live financial context (incorporation, last filed dates, etc.)
        const financialContext = await getFinancialContext();

        const prompt = `
        As an expert UK Tax & Compliance Assistant, recalculate the NEXT due dates for this company.
        
        RULES:
        1. Confirmation Statement: Anniversary of incorporation + 12 months. Deadline is anniversary + 14 days.
        2. Annual Accounts (CompaniesHouse): Usually 9 months after Financial Year End.
        3. HMRC Accounts: Usually 12 months after Financial Year End (filing) and 9 months + 1 day (payment).
        4. If a 'Last Filed' date is provided in the context and it belongs to the CURRENT cycle, roll forward to the NEXT year.
        5. Current Date for reference: ${new Date().toISOString().split('T')[0]}

        CONTEXT:
        ${financialContext}

        JSON RETURN FORMAT ONLY:
        {
            "nextConfirmationStatementDue": "YYYY-MM-DD",
            "nextAccountsCompaniesHouseDue": "YYYY-MM-DD",
            "nextAccountsHMRCDue": "YYYY-MM-DD",
            "nextFYEndDate": "YYYY-MM-DD"
        }
        `;

        const ai = await getAIClient();
        const response = await ai.chat(prompt, "You are a UK Compliance Expert specialized in Ltd companies.");

        // Extract JSON from AI response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI did not return valid JSON");

        const deadlines = JSON.parse(jsonMatch[0]);

        // Update Database
        await prisma.companySettings.update({
            where: { id: settings.id },
            data: {
                nextConfirmationStatementDue: new Date(deadlines.nextConfirmationStatementDue),
                nextAccountsCompaniesHouseDue: new Date(deadlines.nextAccountsCompaniesHouseDue),
                nextAccountsHMRCDue: new Date(deadlines.nextAccountsHMRCDue),
                nextFYEndDate: new Date(deadlines.nextFYEndDate),
                // Sync legacy fields for compatibility
                accountsNextDueDate: new Date(deadlines.nextAccountsCompaniesHouseDue),
                confirmationNextDueDate: new Date(deadlines.nextConfirmationStatementDue),
                updatedAt: new Date()
            }
        });

        console.log(`[Compliance-Service] ✅ Deadlines updated successfully via AI (${ai.provider}).`);
        return { deadlines, provider: ai.provider };

    } catch (error: any) {
        console.error("[Compliance-Service] ❌ Failed to auto-recalculate deadlines:", error.message);
        throw error;
    }
}
