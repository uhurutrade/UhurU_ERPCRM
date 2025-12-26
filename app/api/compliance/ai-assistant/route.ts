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

        const { message, history, contextFiles } = await req.json();
        const chatHistory = history || [];

        // 2. FETCH LEDGER & TAX CONTEXT
        const { getFinancialContext } = require('@/lib/ai/financial-context');
        const financialContext = await getFinancialContext();

        let systemPrompt = `Provide support as a UK Compliance assistant. 
        Help the user analyze financial data and RAG documents.
        
        - Respond in SPANISH (Technical terms in English).

        - Provide download links as: [Filename](DOWNLOAD_URL).

        - Maintain strategic continuity.
        
        CURRENT BUSINESS FINANCIAL DATA (ERP):
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

        // 4. Call AI with history
        const reply = await ai.chat(message, systemPrompt, chatHistory);

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error('AI Assistant Error:', error);
        return NextResponse.json(
            { error: error.message || 'An error occurred while communicating with the AI.' },
            { status: 500 }
        );
    }
}
