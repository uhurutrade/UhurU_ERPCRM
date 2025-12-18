import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { retrieveContext } from '@/lib/ai/rag-engine';

export async function POST(req: Request) {
    try {
        // 1. Check for API Key
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'OpenAI API Key not found. Please add OPENAI_API_KEY to your .env file.' },
                { status: 500 }
            );
        }

        const openai = new OpenAI({ apiKey });
        const { message, contextFiles } = await req.json();

        let systemPrompt = `You are an expert UK Tax Consultant for HMRC and Companies House compliance. 
        You help the user prepare their tax obligations based on their ERP data and uploaded documents.
        
        If the user asks about specific numbers and you don't have the context, ask them to upload the relevant document (like previous year's return).
        
        Keep responses professional, concise, and focused on UK tax law (VAT, Corporation Tax).`;

        // 2. RAG RETRIEVAL (Search relevant chunks in your VPS vault)
        let ragContext = "";
        try {
            ragContext = await retrieveContext(message);
        } catch (ragError) {
            console.error("RAG Retrieval failed:", ragError);
        }

        if (ragContext) {
            systemPrompt += `\n\nRELEVANT INFORMATION FROM YOUR DOCUMENTS:\n${ragContext}`;
        } else if (contextFiles && contextFiles.length > 0) {
            systemPrompt += `\n\nCONTEXT FROM UPLOADED FILES:\nThe user has uploaded ${contextFiles.length} documents. Assume these contain valid historical tax data.`;
        }

        // 3. Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.2,
        });

        const reply = completion.choices[0].message.content;

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error('AI Assistant Error:', error);
        return NextResponse.json(
            { error: error.message || 'An error occurred while communicating with the AI.' },
            { status: 500 }
        );
    }
}
