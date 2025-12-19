import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

export interface AIExtractionResult {
    isInvoice: boolean;
    issuer: string;
    date: string;
    amount: number;
    currency: string;
    confidence: number;
    reason?: string;
}

/**
 * AI Service Manager
 * Handles switching between OpenAI and Google Gemini based on Company Settings.
 */
export async function getAIClient() {
    const settings = await prisma.companySettings.findFirst({
        select: { aiProvider: true }
    });

    const provider = settings?.aiProvider || 'openai';

    return {
        provider,

        async analyzeInvoice(filename: string, text: string): Promise<AIExtractionResult> {
            if (provider === 'gemini') {
                return analyzeWithGemini(filename, text);
            }
            return analyzeWithOpenAI(filename, text);
        },

        async chat(message: string, systemPrompt: string): Promise<string> {
            if (provider === 'gemini') {
                return chatWithGemini(message, systemPrompt);
            }
            return chatWithOpenAI(message, systemPrompt);
        }
    };
}

// --- OpenAI Implementation ---
async function analyzeWithOpenAI(filename: string, text: string): Promise<AIExtractionResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API Key is not configured.");

    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are an expert accountant. Analyze the following invoice text and return a JSON object with:
                {
                    "isInvoice": boolean,
                    "issuer": string,
                    "date": string (ISO),
                    "amount": number,
                    "currency": string (ISO code),
                    "confidence": number,
                    "reason": string (if not an invoice)
                }`
            },
            {
                role: "user",
                content: `Filename: ${filename}\n\nContent:\n${text.substring(0, 10000)}`
            }
        ],
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
}

async function chatWithOpenAI(message: string, systemPrompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API Key is not configured.");

    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ],
        temperature: 0.2
    });

    return response.choices[0].message.content || "No response from AI.";
}

// --- Gemini Implementation ---
async function analyzeWithGemini(filename: string, text: string): Promise<AIExtractionResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key (GEMINI_API_KEY) is not configured.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are an expert accountant. Analyze the following invoice text/data and return a JSON object with:
    {
        "isInvoice": boolean,
        "issuer": string,
        "date": string (ISO),
        "amount": number,
        "currency": string (ISO code),
        "confidence": number,
        "reason": string (if not an invoice)
    }
    
    Filename: ${filename}
    Content Preview: ${text.substring(0, 15000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
}

async function chatWithGemini(message: string, systemPrompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key (GEMINI_API_KEY) is not configured.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(`${systemPrompt}\n\nUser Message: ${message}`);
    const response = await result.response;
    return response.text();
}
