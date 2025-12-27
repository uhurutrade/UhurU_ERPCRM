
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
            "nextFYEndDate": "YYYY-MM-DD",
            "justification": "EXHAUSTIVE BILINGUAL LOGIC. Format: [ES] [Explicación detallada de cada ajuste, citando fechas de documentos encontrados en el RAG y normativas UK aplicadas. Explica el PORQUÉ del recalculo paso a paso.] [EN] [Exhaustive point-by-point logic in English explaining document triggers and regulatory reasons for these specific dates]. Be extremely detailed (up to 1200 chars)."
        }
        `;

        const { getConsensusAI } = await import("@/lib/ai/ai-service");
        const ai = await getConsensusAI();
        const responses = await ai.chat(prompt, "You are a UK Compliance Expert. Use strict UK legal terminology.");

        const parser = (resp: string) => {
            try {
                const match = resp.match(/\{[\s\S]*\}/);
                return match ? JSON.parse(match[0]) : null;
            } catch { return null; }
        };

        const dataOA = parser(responses.openai);
        const dataGE = parser(responses.gemini);

        if (!dataOA && !dataGE) throw new Error("Both AI providers failed to return valid data");

        // CONSENSUS LOGIC: Pick the MOST RESTRICTIVE (earliest) date for each field
        const pickEarliest = (field: string) => {
            const dateOA = dataOA?.[field] ? new Date(dataOA[field]) : null;
            const dateGE = dataGE?.[field] ? new Date(dataGE[field]) : null;

            if (dateOA && dateGE) {
                if (dateOA <= dateGE) return { date: dataOA[field], provider: 'openai' };
                return { date: dataGE[field], provider: 'gemini' };
            }
            if (dateOA) return { date: dataOA[field], provider: 'openai' };
            if (dateGE) return { date: dataGE[field], provider: 'gemini' };
            return { date: null, provider: 'failed' };
        };

        const consensus = {
            nextConfirmationStatementDue: pickEarliest('nextConfirmationStatementDue'),
            nextAccountsCompaniesHouseDue: pickEarliest('nextAccountsCompaniesHouseDue'),
            nextAccountsHMRCDue: pickEarliest('nextAccountsHMRCDue'),
            nextFYEndDate: pickEarliest('nextFYEndDate')
        };

        const deadlines = {
            nextConfirmationStatementDue: consensus.nextConfirmationStatementDue.date,
            nextAccountsCompaniesHouseDue: consensus.nextAccountsCompaniesHouseDue.date,
            nextAccountsHMRCDue: consensus.nextAccountsHMRCDue.date,
            nextFYEndDate: consensus.nextFYEndDate.date
        };

        // Summary of providers that successfully contributed
        const successfulProviders: string[] = [];
        if (dataOA) successfulProviders.push("OpenAI (4o-Mini)");
        if (dataGE) successfulProviders.push("Gemini (2.0-Flash)");
        const providerSummary = successfulProviders.join(" & ");

        // Capture old values for comparison
        const oldDeadlines = {
            nextConfirmationStatementDue: settings.nextConfirmationStatementDue?.toISOString().split('T')[0],
            nextAccountsCompaniesHouseDue: settings.nextAccountsCompaniesHouseDue?.toISOString().split('T')[0],
            nextAccountsHMRCDue: settings.nextAccountsHMRCDue?.toISOString().split('T')[0],
            nextFYEndDate: settings.nextFYEndDate?.toISOString().split('T')[0]
        };

        const justification = dataGE?.justification || dataOA?.justification || "No explicit justification provided by AI.";

        // Update Database
        await prisma.companySettings.update({
            where: { id: settings.id },
            data: {
                nextConfirmationStatementDue: new Date(deadlines.nextConfirmationStatementDue),
                nextAccountsCompaniesHouseDue: new Date(deadlines.nextAccountsCompaniesHouseDue),
                nextAccountsHMRCDue: new Date(deadlines.nextAccountsHMRCDue),
                nextFYEndDate: new Date(deadlines.nextFYEndDate),
                // Sync legacy fields
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

        // Record Audit if there are changes
        if (changes.length > 0) {
            await prisma.neuralAudit.create({
                data: {
                    provider: providerSummary,
                    changeLog: changes.join(", "),
                    justification: justification,
                    totalChanges: changes.length,
                    status: "UPDATED"
                }
            });
        }

        console.log(`[Compliance-Service] ✅ Consensus reached via ${providerSummary}. Changes: ${changes.length}`);

        return {
            deadlines,
            provider: providerSummary,
            changes: changes.length > 0 ? changes : null,
            details: consensus,
            justification
        };

    } catch (error: any) {
        console.error("[Compliance-Service] ❌ Failed to auto-recalculate deadlines:", error.message);
        throw error;
    }
}
