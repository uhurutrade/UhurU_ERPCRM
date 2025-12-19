import { NextResponse } from 'next/server';
import { getAIClient } from '@/lib/ai/ai-service';
import { retrieveContext } from '@/lib/ai/rag-engine';

export async function POST(req: Request) {
    try {
        const ai = await getAIClient();

        // Check for relevant API key based on provider
        if (ai.provider === 'openai' && !process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: 'OpenAI API Key not found.' }, { status: 500 });
        }
        if (ai.provider === 'gemini' && !process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Gemini API Key not found.' }, { status: 500 });
        }

        const { message, contextFiles } = await req.json();

        // 2. FETCH LEDGER & TAX CONTEXT
        const { getFinancialContext } = require('@/lib/ai/financial-context');
        const financialContext = await getFinancialContext();

        let systemPrompt = `You are an expert UK Tax Consultant for HMRC and Companies House compliance. 
        You help the user prepare their tax obligations based on their ERP data and uploaded documents.
        
        Keep responses professional, concise, and focused on UK tax law (VAT, Corporation Tax).
        
        CURRENT BUSINESS FINANCIAL DATA:
        ${financialContext}`;

        // 3. RAG RETRIEVAL (from uploaded docs)
        let ragContext = "";
        try {
            ragContext = await retrieveContext(message);
        } catch (ragError) {
            console.error("RAG Retrieval failed:", ragError);
        }

        if (ragContext) {
            systemPrompt += `\n\nRELEVANT INFORMATION FROM UPLOADED COMPLIANCE DOCUMENTS:\n${ragContext}`;
        } else if (contextFiles && contextFiles.length > 0) {
            systemPrompt += `\n\nCONTEXT FROM UPLOADED FILES:\nThe user has uploaded ${contextFiles.length} documents for analysis.`;
        }

        // 4. Call AI
        const reply = await ai.chat(message, systemPrompt);

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error('AI Assistant Error:', error);
        return NextResponse.json(
            { error: error.message || 'An error occurred while communicating with the AI.' },
            { status: 500 }
        );
    }
}
