import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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

        // 2. Simulate RAG Retrieval (In a real app, we would query a vector DB here)
        // For this demo, we'll pretend we read the uploaded files and found relevant info.
        let systemPrompt = `You are an expert UK Tax Consultant for HMRC and Companies House compliance. 
        You help the user prepare their tax obligations based on their ERP data and uploaded documents.
        
        If the user asks about specific numbers and you don't have the context, ask them to upload the relevant document (like previous year's return).
        
        Keep responses professional, concise, and focused on UK tax law (VAT, Corporation Tax).`;

        if (contextFiles && contextFiles.length > 0) {
            systemPrompt += `\n\nCONTEXT FROM UPLOADED FILES:\nThe user has uploaded ${contextFiles.length} documents. Assume these contain valid historical tax data.`;
        }

        // 3. Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4", // Or gpt-3.5-turbo if you prefer speed/cost
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.2, // Low temperature for factual responses
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
