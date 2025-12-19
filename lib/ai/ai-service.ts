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
    const settings = await prisma.companySettings.findFirst();
    const provider = (settings as any)?.aiProvider || 'openai';

    return {
        provider,

        async analyzeInvoice(filename: string, text: string, buffer?: Buffer, mimeType?: string): Promise<AIExtractionResult> {
            if (provider === 'gemini') {
                return analyzeWithGemini(filename, text, buffer, mimeType);
            }
            return analyzeWithOpenAI(filename, text, buffer, mimeType);
        },

        async analyzeStrategicDoc(filename: string, text: string, buffer?: Buffer, mimeType?: string): Promise<any> {
            if (provider === 'gemini') {
                return analyzeStrategicWithGemini(filename, text, buffer, mimeType);
            }
            return analyzeStrategicWithOpenAI(filename, text, buffer, mimeType);
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
async function analyzeWithOpenAI(filename: string, text: string, buffer?: Buffer, mimeType?: string): Promise<AIExtractionResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API Key is not configured.");

    const openai = new OpenAI({ apiKey });

    const messages: any[] = [
        {
            role: "system",
            content: `You are an expert accountant. Analyze the provided invoice.
            Return a JSON object with:
            {
                "isInvoice": boolean,
                "issuer": string,
                "date": string (YYYY-MM-DD),
                "amount": number,
                "currency": string (ISO code),
                "confidence": number,
                "reason": string
            }`
        }
    ];

    const userContent: any[] = [
        { type: "text", text: `Filename: ${filename}\n\nExtracted Text: ${text.substring(0, 10000)}` }
    ];

    if (buffer && mimeType?.startsWith('image/')) {
        userContent.push({
            type: "image_url",
            image_url: {
                url: `data:${mimeType};base64,${buffer.toString('base64')}`
            }
        });
    }

    messages.push({ role: "user", content: userContent });

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
}

async function analyzeStrategicWithOpenAI(filename: string, text: string, buffer?: Buffer, mimeType?: string): Promise<any> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API Key is not configured.");

    const openai = new OpenAI({ apiKey });

    const messages: any[] = [
        {
            role: "system",
            content: `You are a UK Corporate Law & Tax expert. Analyze the provided document for a UK LTD company.
            Extract details for: relevance, documentDate (YYYY-MM-DD), docTopic, deadlines, vatLiability, and a strategicInsight.
            
            Return JSON:
            {
                "isRelevant": boolean,
                "documentDate": "YYYY-MM-DD",
                "docTopic": string,
                "irrelevanceReason": string,
                "deadlines": [{ "date": "YYYY-MM-DD", "title": string, "description": string }],
                "vatLiability": { "mustCharge": boolean, "reason": string },
                "strategicInsight": string,
                "extractedFacts": object
            }`
        }
    ];

    const userContent: any[] = [
        { type: "text", text: `Filename: ${filename}\n\nExtracted Text: ${text.substring(0, 15000)}` }
    ];

    if (buffer && mimeType?.startsWith('image/')) {
        userContent.push({
            type: "image_url",
            image_url: {
                url: `data:${mimeType};base64,${buffer.toString('base64')}`
            }
        });
    }

    messages.push({ role: "user", content: userContent });

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
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
async function analyzeWithGemini(filename: string, text: string, buffer?: Buffer, mimeType?: string): Promise<AIExtractionResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key (GEMINI_API_KEY) is not configured.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are an expert accountant. Analyze the following invoice and return a JSON object with:
    {
        "isInvoice": boolean,
        "issuer": string,
        "date": string (YYYY-MM-DD),
        "amount": number,
        "currency": string (ISO code),
        "confidence": number,
        "reason": string (if not an invoice)
    }
    
    Filename: ${filename}`;

    const contents: any[] = [];
    if (buffer && (mimeType === 'application/pdf' || mimeType?.startsWith('image/'))) {
        contents.push({
            inlineData: {
                data: buffer.toString('base64'),
                mimeType: mimeType
            }
        });
    }
    contents.push({ text: `${prompt}\n\nExtracted Text: ${text.substring(0, 15000)}` });

    const result = await model.generateContent(contents);
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

async function analyzeStrategicWithGemini(filename: string, text: string, buffer?: Buffer, mimeType?: string): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key is not configured.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Analyze this document as a UK LTD corporate expert. Filename: ${filename}.
    Determine if it is relevant to business/tax/legal management (isRelevant).
    Extract the effective date (documentDate) and a specific topic name (docTopic) used for versioning.
    
    Return JSON:
    {
        "isRelevant": boolean,
        "documentDate": "YYYY-MM-DD",
        "docTopic": string,
        "irrelevanceReason": string,
        "deadlines": [{ "date": "YYYY-MM-DD", "title": string, "description": string }],
        "vatLiability": { "mustCharge": boolean, "reason": string },
        "strategicInsight": string,
        "extractedFacts": object
    }
    
    If no text is provided or if text extraction failed, analyze the visual content of the file if provided.`;

    const contents: any[] = [];

    // Add file data if available (Multimodal)
    if (buffer && mimeType === 'application/pdf') {
        contents.push({
            inlineData: {
                data: buffer.toString('base64'),
                mimeType: mimeType
            }
        });
    }

    // Add text extracted (as fallback or additional context)
    contents.push({
        text: `${prompt}\n\nExtracted Text (can be empty): ${text.substring(0, 20000)}`
    });

    const result = await model.generateContent(contents);
    const response = await result.response;
    return JSON.parse(response.text());
}
