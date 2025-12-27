import { prisma } from "../prisma";
import { getAIClient } from "./ai-service";

/**
 * Registra un reporte de auditoría estratégica generado por IA.
 * Se encarga de analizar el cambio y argumentar su importancia para la coherencia de la empresa.
 * Si la IA no está disponible, guarda la información básica y marca el reporte para análisis posterior.
 */
export async function recordStrategicAudit(action: string, details: string, type: string = "OPERATIONAL") {
    let justificationJson = {
        en: "System log recorded. AI analysis pending or unavailable.",
        es: "Registro de sistema guardado. Análisis de IA pendiente o no disponible."
    };
    let providerName = "System Core";
    let status = type;

    try {
        const ai = await getAIClient();

        const prompt = `
            You are a Data Auditor for UhurU ERP. 
            User Action: ${action}
            Data Change Detail (JSON): ${details}
            
            Task:
            1. Analyze the JSON data which contains 'changedFields' and 'values'.
            2. Provide a single, HIGHLY PROFESSIONAL sentence in English and Spanish.
            3. Focus on WHAT was modified and the business context.
            4. If it's a creation, mention the new entity. If it's an update, mention what fields changed.
            
            Example: "User updated contact 'John Doe' changing email and phone number. Ensures CRM data accuracy."
            
            Return JSON: {"en": "...", "es": "..."}
        `;

        const response = await ai.chat(prompt, "You are a senior data governance expert.");

        try {
            // Clean up possible markdown decorators like ```json
            const jsonStr = response.replace(/```json|```/g, "").trim();
            const match = jsonStr.match(/\{[\s\S]*\}/);
            if (match) {
                justificationJson = JSON.parse(match[0]);
                providerName = ai.provider === 'openai' ? "OpenAI 4o-Mini" : "Gemini 2.0-Flash";
                status = "STABLE";
            } else {
                // If it's not JSON but has content, use it directly
                justificationJson = { en: response, es: "" };
                providerName = ai.provider === 'openai' ? "OpenAI 4o-Mini" : "Gemini 2.0-Flash";
            }
        } catch (e) {
            console.error("[Audit-Service] JSON Parse error for AI rationale:", e);
            justificationJson = { en: response, es: "" };
        }

    } catch (error) {
        console.warn("[Audit-Service] ⚠️ AI unavailable for strategic audit. Saving raw log only.");
        status = "LOG_ONLY";
        // justificationJson keeps the default "Analysis pending" values
    }

    try {
        await prisma.neuralAudit.create({
            data: {
                provider: providerName,
                changeLog: action,
                justification: JSON.stringify(justificationJson),
                totalChanges: 1,
                status: status,
                isRead: false
            }
        });

        console.log(`[Audit-Service] ✅ ${status === 'LOG_ONLY' ? 'Raw log' : 'Strategic Audit'} recorded: ${action}`);
    } catch (dbError) {
        console.error("[Audit-Service] ❌ CRITICAL: Failed to save audit even as raw log:", dbError);
    }
}

/**
 * Legacy support/Internal creation
 */
export async function createNeuralAudit({
    provider = "Internal Flow",
    changeLog,
    justification,
    totalChanges = 1,
    status = "UPDATED"
}: {
    provider?: string;
    changeLog: string;
    justification: string;
    totalChanges?: number;
    status?: string;
}) {
    try {
        await prisma.neuralAudit.create({
            data: {
                provider,
                changeLog,
                justification,
                totalChanges,
                status,
                isRead: false
            }
        });
    } catch (error) {
        console.error("[Audit-Service] ❌ Failed to create neural audit:", error);
    }
}
