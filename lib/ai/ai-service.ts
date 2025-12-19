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

        async analyzeInvoice(filename: string, text: string): Promise<AIExtractionResult> {
            if (provider === 'gemini') {
                return analyzeWithGemini(filename, text);
            }
            return analyzeWithOpenAI(filename, text);
        },

        async analyzeStrategicDoc(filename: string, text: string): Promise<any> {
            if (provider === 'gemini') {
                return analyzeStrategicWithGemini(filename, text);
            }
            return analyzeStrategicWithOpenAI(filename, text);
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
                content: `You are an expert accountant. Analyze the provided invoice text/data.
                Even if the text seems fragmented or contains unreadable characters, try your best to extract the core details.
                
                Return a JSON object with:
                {
                    "isInvoice": boolean,
                    "issuer": string (Company name if found),
                    "date": string (YYYY-MM-DD format if found),
                    "amount": number (Total amount),
                    "currency": string (ISO code, e.g., 'USD', 'EUR', 'GBP'),
                    "confidence": number (0 to 1),
                    "reason": string (Explanation if analysis is difficult or if it's not an invoice)
                }
                
                If you find a filename like 'INV25-8', it is a strong hint that it IS an invoice.
                If no text is provided, use the filename to make a best guess if possible, otherwise explain the missing data.`
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

async function analyzeStrategicWithOpenAI(filename: string, text: string): Promise<any> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API Key is not configured.");

    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: `You are a UK Corporate Law & Tax expert. Analyze the provided document for a UK LTD company.
                Extract:
                1. Relevance: Is this document related to UK company management, tax, legal, or strategy?
                2. Document Date: What is the effective or signing date of this document?
                3. Topic: What is the short, specific topic (e.g. "Shareholder Agreement", "HMRC VAT Notice", "Office Lease")?
                4. Legal deadlines (Companies House, HMRC).
                5. VAT obligations (Should they charge VAT? Based on what?).
                6. Financial commitments or liabilities.
                7. A concise "Strategic Insight" for the董事 (Director).
                
                Return JSON:
                {
                    "isRelevant": boolean,
                    "documentDate": "YYYY-MM-DD",
                    "docTopic": string,
                    "irrelevanceReason": string (if not relevant),
                    "deadlines": [{ "date": "YYYY-MM-DD", "title": string, "description": string }],
                    "vatLiability": { "mustCharge": boolean, "reason": string },
                    "strategicInsight": string,
                    "extractedFacts": object
                }`
            },
            {
                role: "user",
                content: `Filename: ${filename}\n\nContent:\n${text.substring(0, 15000)}`
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
        "date": string (YYYY-MM-DD),
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

async function analyzeStrategicWithGemini(filename: string, text: string): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key is not configured.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Analyze this document as a UK LTD corporate expert. Filename: ${filename}. Content: ${text.substring(0, 20000)}
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
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
}
