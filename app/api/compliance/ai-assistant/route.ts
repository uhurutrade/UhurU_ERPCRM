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
        
        - ALWAYS respond in SPANISH.
        - Handle technical terms in English (explain in Spanish if needed).

        - Provide download links as: [Filename](DOWNLOAD_URL).

        - Maintain strategic continuity.
        
        // 3. RAG RETRIEVAL (from uploaded docs)
        let ragContext = "";
        try {
            ragContext = await retrieveContext(message);
        } catch (ragError) {
            console.error("RAG Retrieval failed:", ragError);
        }

        // 4. PREPARE CONTEXT DATA (Outside of System Instructions to avoid Gemini 400 errors)
        const combinedContext = `
FINANCIAL DATA(ERP):
${ financialContext }

${ ragContext ? `RAG DOCUMENTS CONTEXT:\n${ragContext}` : (contextFiles && contextFiles.length > 0 ? `The user has uploaded ${contextFiles.length} documents for analysis.` : '') }
        `;

        // 5. Call AI with history and contextData separately
        const reply = await ai.chat(message, systemPrompt, chatHistory, combinedContext);

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error('AI Assistant Error:', error);
        return NextResponse.json(
            { error: error.message || 'An error occurred while communicating with the AI.' },
            { status: 500 }
        );
    }
}
