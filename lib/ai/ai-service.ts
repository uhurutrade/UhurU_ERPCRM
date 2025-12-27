import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

async function pdfToImage(buffer: Buffer): Promise<Buffer | null> {
    const tempIn = join(tmpdir(), `temp_${Date.now()}.pdf`);
    const tempOutBase = join(tmpdir(), `temp_out_${Date.now()}`);
    const tempOut = `${tempOutBase}.png`;

    try {
        writeFileSync(tempIn, buffer);
        // Convert only the first page to PNG (multimodal vision)
        execSync(`pdftocairo -png -singlefile -f 1 -l 1 "${tempIn}" "${tempOutBase}"`);
        const imageBuffer = readFileSync(tempOut);

        // Clean up
        unlinkSync(tempIn);
        unlinkSync(tempOut);

        return imageBuffer;
    } catch (err) {
        // Silently fail if tool missing or conversion fails, fallback to text
        try { unlinkSync(tempIn); } catch { }
        try { unlinkSync(tempOut); } catch { }
        return null;
    }
}

export interface AIExtractionResult {
    isInvoice: boolean;
    issuer: string;
    date: string;
    amount: number;
    currency: string;
    confidence: number;
    reason?: string;
}

async function getCompanyContext() {
    try {
        const settings = await prisma.companySettings.findFirst();
        if (!settings) return "";

        const combinedInstructions = [
            "# IDENTITY & SYSTEM ROLE:",
            settings.aiSystemPrompt || "You are the official Strategic AI Assistant.",
            "\n# STRATEGIC DIRECTIVES & BUSINESS LOGIC:",
            settings.aiStrategicDirectives || "Follow standard UK compliance and business best practices.",
            "\n# ADAPTIVE MEMORY & USER BEHAVIOR:",
            settings.aiMemoryPrompt || "Adjust to user style over time.",
            "\n# LEGACY CONTEXT:",
            (settings as any).aiCustomInstructions || "N/A"
        ].join('\n');

        return `# PRIMARY BEHAVIORAL DIRECTIVE (MANDATORY):
${combinedInstructions}

# LANGUAGE POLICY:
- Your communication with the Director must ALWAYS be in SPANISH (Castellano).
- Maintain this language even when analyzing documents in English.

# ENTITY CONTEXT:
- Company: ${settings.companyName}
- Type: ${settings.companyType}
- Location: ${settings.registeredCity}, ${settings.registeredCountry}
- Additional Details: ${settings.notes || 'N/A'}`;
    } catch {
        return "";
    }
}

/**
 * AI Service Manager
 * Handles switching between OpenAI and Google Gemini based on Company Settings.
 */
export async function getAIClient() {
    const settings = await prisma.companySettings.findFirst();
    const provider = (settings as any)?.aiProvider || 'openai';
    const companyContext = await getCompanyContext();

    return {
        provider,
        companyContext,

        async analyzeInvoice(filename: string, text: string, buffer?: Buffer, mimeType?: string): Promise<AIExtractionResult> {
            if (provider === 'gemini') {
                return analyzeWithGemini(filename, text, companyContext, buffer, mimeType);
            }
            return analyzeWithOpenAI(filename, text, companyContext, buffer, mimeType);
        },

        async analyzeStrategicDoc(filename: string, text: string, buffer?: Buffer, mimeType?: string, userNotes?: string): Promise<any> {
            if (provider === 'gemini') {
                return analyzeStrategicWithGemini(filename, text, companyContext, buffer, mimeType, userNotes);
            }
            return analyzeStrategicWithOpenAI(filename, text, companyContext, buffer, mimeType, userNotes);
        },

        async analyzeLeadImport(text: string): Promise<any> {
            if (provider === 'gemini') {
                return analyzeLeadWithGemini(text, companyContext);
            }
            return analyzeLeadWithOpenAI(text, companyContext);
        },

        async chat(message: string, systemPrompt: string, history: any[] = [], contextData?: string): Promise<string> {
            // Role and Behavior strictly in System Prompt - Trimmed to be concise
            const roleAndBehavior = `${companyContext.trim()}\n\nSPECIALIZED TASK INSTRUCTIONS:\n${systemPrompt.trim()}\n\nREMINDER: You MUST strictly adhere to the PRIMARY IDENTITY & STRATEGIC BEHAVIOR defined above.`.trim();

            if (provider === 'gemini') {
                return chatWithGemini(message, roleAndBehavior, history, contextData);
            }
            return chatWithOpenAI(message, roleAndBehavior, history, contextData);
        }
    };
}

/**
 * Specialized helper to get responses from both providers for consensus
 */
export async function getConsensusAI() {
    const companyContext = await getCompanyContext();
    return {
        async chat(message: string, systemPrompt: string): Promise<{ openai: string, gemini: string }> {
            const roleAndBehavior = `${companyContext.trim()}\n\nSPECIALIZED TASK INSTRUCTIONS:\n${systemPrompt.trim()}`.trim();

            const [oa, ge] = await Promise.allSettled([
                chatWithOpenAI(message, roleAndBehavior),
                chatWithGemini(message, roleAndBehavior)
            ]);

            return {
                openai: oa.status === 'fulfilled' ? oa.value : "OPENAI_FAILED",
                gemini: ge.status === 'fulfilled' ? ge.value : "GEMINI_FAILED"
            };
        }
    };
}

// --- OpenAI Implementation ---
async function analyzeWithOpenAI(filename: string, text: string, companyContext: string, buffer?: Buffer, mimeType?: string): Promise<AIExtractionResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API Key is not configured.");

    const openai = new OpenAI({ apiKey });

    const messages: any[] = [
        {
            role: "system",
            content: `You are an expert accountant at ${companyContext}. Analyze the provided invoice.
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

    if (buffer) {
        if (mimeType?.startsWith('image/')) {
            userContent.push({
                type: "image_url",
                image_url: {
                    url: `data:${mimeType};base64,${buffer.toString('base64')}`
                }
            });
        } else if (mimeType === 'application/pdf') {
            const imageBuffer = await pdfToImage(buffer);
            if (imageBuffer) {
                userContent.push({
                    type: "image_url",
                    image_url: {
                        url: `data:image/png;base64,${imageBuffer.toString('base64')}`
                    }
                });
            }
        }
    }

    messages.push({ role: "user", content: userContent });

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
}

async function analyzeStrategicWithOpenAI(filename: string, text: string, companyContext: string, buffer?: Buffer, mimeType?: string, userNotes?: string): Promise<any> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API Key is not configured.");

    const openai = new OpenAI({ apiKey });

    const messages: any[] = [
        {
            role: "system",
            content: `You are a UK Corporate Law & Tax expert representing ${companyContext}. Analyze the provided document for a UK LTD company.
            ${userNotes ? `CONTEXT FROM USER: ${userNotes}\n` : ''}
            Extract details for: relevance, documentDate (YYYY-MM-DD), docTopic, deadlines, vatLiability, and a strategicInsight.
            
            Define:
            1. relevance: Is this relevant to UK business?
            2. documentDate: Effective date (YYYY-MM-DD).
            3. docTopic: A STABLE, UNIFIED topic name (e.g. "OFFICE_LEASE_CONTRACT", "HMRC_VAT_QUARTERLY_NOTICE"). This is used to link versions.
            4. isDuplicate: true if this looks like a generic boilerplate or identical to common known templates without new data.
            5. strategicInsight: Advice for the Director.
            
            Return JSON:
            {
                "isRelevant": boolean,
                "documentDate": "YYYY-MM-DD",
                "docTopic": string,
                "isDuplicate": boolean, 
                "irrelevanceReason": string,
                "deadlines": [{ "date": "YYYY-MM-DD", "title": string, "description": string }],
                "vatLiability": { "mustCharge": boolean, "reason": string },
                "strategicInsightEN": string,
                "strategicInsightES": string, (Faithful Spanish translation of the English insight)
                "summaryEN": string,
                "summaryES": string, (Faithful Spanish translation of the English summary)
                "extractedFacts": object
            }
            
            Note: The docTopic must be consistent. If it's a renewal, the topic must match the previous one.`
        }
    ];

    const userContent: any[] = [
        { type: "text", text: `Filename: ${filename}\n\nExtracted Text: ${text.substring(0, 15000)}` }
    ];

    if (buffer) {
        if (mimeType?.startsWith('image/')) {
            userContent.push({
                type: "image_url",
                image_url: {
                    url: `data:${mimeType};base64,${buffer.toString('base64')}`
                }
            });
        } else if (mimeType === 'application/pdf') {
            const imageBuffer = await pdfToImage(buffer);
            if (imageBuffer) {
                userContent.push({
                    type: "image_url",
                    image_url: {
                        url: `data:image/png;base64,${imageBuffer.toString('base64')}`
                    }
                });
            }
        }
    }

    messages.push({ role: "user", content: userContent });

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
}

async function analyzeLeadWithOpenAI(text: string, companyContext: string): Promise<any> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API Key is not configured.");

    const openai = new OpenAI({ apiKey });

    const messages: any[] = [
        {
            role: "system",
            content: `You are a high-level Strategic Sales Assistant for ${companyContext}. Your goal is to extract structured lead data and provide a deep contextual analysis.
            
            KEY INSTRUCTIONS:
            1. BILINGUAL LOCALIZATION (PRIORITY): You must handle English and Spanish inputs. To maintain CRM consistency, ALWAYS provide the "summary" and "organizationSector" in professional, localized Spanish, even if the input text is English.
            2. CONTEXTUAL INTELLIGENCE: Analyze the entire conversation or profile. Identify:
               - The core intent (what do they actually want?).
               - Pain points (what problems are they solving?).
               - Opportunity value (why is this lead important for ${companyContext}?).
            3. LOGICAL SUMMARY: The summary must be a strategic synthesis in Spanish, not just a list of facts.
            
            Return a JSON object with:
            {
                "contactName": string,
                "email": string,
                "phone": string,
                "role": string,
                "organizationName": string,
                "organizationSector": string,
                "summary": string (Professional Strategic Summary in Spanish),
                "confidence": number (0-1),
                "language": "es" | "en" (Original input language)
            }`
        },
        { role: "user", content: `Raw Text: ${text.substring(0, 10000)}` }
    ];

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
}

async function chatWithOpenAI(message: string, systemPrompt: string, history: any[] = [], contextData?: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API Key is not configured.");

    const openai = new OpenAI({ apiKey });

    // Prepend context data to the user message for consistency
    const fullUserMessage = contextData
        ? `RELEVANT CONTEXT & DATA:\n${contextData}\n\nUSER QUESTION: ${message}`
        : message;

    const messages: any[] = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: fullUserMessage }
    ];

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.2
    });

    return response.choices[0].message.content || "No response from AI.";
}

// --- Gemini Implementation ---
async function analyzeWithGemini(filename: string, text: string, companyContext: string, buffer?: Buffer, mimeType?: string): Promise<AIExtractionResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key (GEMINI_API_KEY) is not configured.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are an expert accountant for ${companyContext}. Analyze the following invoice and return a JSON object with:
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

async function chatWithGemini(message: string, systemPrompt: string, history: any[] = [], contextData?: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key (GEMINI_API_KEY) is not configured.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Format history for Gemini
    const chat = model.startChat({
        history: history.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        })),
        systemInstruction: {
            role: 'system',
            parts: [{ text: systemPrompt }]
        }
    });

    // Prepend context data to the user message to keep systemInstruction clean and avoid 400 Errors
    const fullUserMessage = contextData
        ? `RELEVANT CONTEXT DATA:\n${contextData}\n\nUSER QUESTION: ${message}`
        : message;

    const result = await chat.sendMessage(fullUserMessage);
    const response = await result.response;
    return response.text();
}

async function analyzeStrategicWithGemini(filename: string, text: string, companyContext: string, buffer?: Buffer, mimeType?: string, userNotes?: string): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key is not configured.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Analyze this document as a UK LTD corporate expert for ${companyContext}. Filename: ${filename}.
    ${userNotes ? `CONTEXT FROM USER: ${userNotes}\n` : ''}
    Determine if it is relevant to business/tax/legal management (isRelevant).
    Extract the effective date (documentDate) and a specific topic name (docTopic) used for versioning.
    
    Return JSON:
    {
        "isRelevant": boolean,
        "documentDate": "YYYY-MM-DD",
        "docTopic": string,
        "isDuplicate": boolean,
        "irrelevanceReason": string,
        "deadlines": [{ "date": "YYYY-MM-DD", "title": string, "description": string }],
        "vatLiability": { "mustCharge": boolean, "reason": string },
        "strategicInsightEN": string,
        "strategicInsightES": string,
        "summaryEN": string,
        "summaryES": string,
        "extractedFacts": object
    }
    
    If it's a business document, identify the STABLE 'docTopic'. If it's a newer version of an existing theme, use the same 'docTopic'.
    Provide a concise summary and strategic insight in both English (EN) and Spanish (ES).
    The Spanish versions (summaryES and strategicInsightES) must be professional, faithful translations of the English ones to ensure consistency.
    If no text is provided or if text extraction failed, analyze the visual content of the file if provided.`;

    const contents: any[] = [];

    // Add file data if available (Multimodal)
    if (buffer && (mimeType === 'application/pdf' || mimeType?.startsWith('image/'))) {
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

async function analyzeLeadWithGemini(text: string, companyContext: string): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key is not configured.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `As a Strategic Sales Assistant for ${companyContext}, analyze this text (LinkedIn chat, email, or profile) to extract structured data.
    
    CRITICAL INSTRUCTIONS:
    - BILINGUAL: Support Spanish/English. ALWAYS provide the "summary" and "organizationSector" in professional SPANISH for CRM consistency.
    - CONTEXTUAL ANALYSIS: Dig deep into the conversation intent, identifying current needs and potential value for ${companyContext}.
    
    Return JSON:
    {
        "contactName": string,
        "email": string,
        "phone": string,
        "role": string,
        "organizationName": string,
        "organizationSector": string,
        "summary": string (Strategic analysis in Spanish),
        "confidence": number,
        "language": "es" | "en" (Original input language)
    }
    
    Text: ${text.substring(0, 15000)}`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
}
