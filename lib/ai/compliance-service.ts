
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
        
        STRICT RULES:
        1. Confirmation Statement: Due every 12 months. Calculation: Anniversary of incorporation + 1 year from the last filed statement period, or next anniversary after Today. Deadline (Filing) is anniversary + 14 days.
        2. Annual Accounts (CompaniesHouse): Usually 9 months after Financial Year End (FYE).
        3. HMRC Accounts: Usually 12 months after FYE for filing, and 9 months + 1 day for payment.
        
        INTELLIGENCE LOGIC:
        - TODAY IS: ${new Date().toISOString().split('T')[0]}
        - IMPORTANT: If the 'Last Filed' date provided in the context is RECENT (within the last 6-12 months) and logically covers the current cycle, you MUST roll forward the 'Next Due' to the FOLLOWING year.
        - ABSOLUTE REQUIREMENT: The 'Next Due' dates returned MUST BE IN THE FUTURE (after ${new Date().toISOString().split('T')[0]}). 
        - Never return a 'Next Due' date that is BEFORE or EQUAL to the 'Last Filed' date.
        - If a 'Last Filed' date exists, the 'Next Due' should be approximately 1 year after that filing's period reference.

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

        // Capture old values for comparison
        const oldDeadlines = {
            nextConfirmationStatementDue: settings.nextConfirmationStatementDue?.toISOString().split('T')[0],
            nextAccountsCompaniesHouseDue: settings.nextAccountsCompaniesHouseDue?.toISOString().split('T')[0],
            nextAccountsHMRCDue: settings.nextAccountsHMRCDue?.toISOString().split('T')[0],
            nextFYEndDate: settings.nextFYEndDate?.toISOString().split('T')[0]
        };

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

        // Identify changes
        const changes: string[] = [];
        if (oldDeadlines.nextConfirmationStatementDue !== deadlines.nextConfirmationStatementDue) changes.push("Confirmation Statement");
        if (oldDeadlines.nextAccountsCompaniesHouseDue !== deadlines.nextAccountsCompaniesHouseDue) changes.push("Companies House Accounts");
        if (oldDeadlines.nextAccountsHMRCDue !== deadlines.nextAccountsHMRCDue) changes.push("HMRC Corporation Tax");
        if (oldDeadlines.nextFYEndDate !== deadlines.nextFYEndDate) changes.push("Financial Year End");

        console.log(`[Compliance-Service] ✅ Deadlines updated successfully via AI (${ai.provider}). Changes: ${changes.length}`);
        return {
            deadlines,
            provider: ai.provider,
            changes: changes.length > 0 ? changes : null
        };

    } catch (error: any) {
        console.error("[Compliance-Service] ❌ Failed to auto-recalculate deadlines:", error.message);
        throw error;
    }
}
