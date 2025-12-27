import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const overrideProvider = searchParams.get('provider');

        const settings = await prisma.companySettings.findFirst();
        const provider = overrideProvider || settings?.aiProvider || 'openai';
        let model = provider === 'openai' ? "gpt-4o-mini" : "gemini-2.0-flash-exp";
        let status = "online";
        let message = "System Operational";

        const openaiKey = process.env.OPENAI_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        if (provider === 'openai') {
            if (!openaiKey) {
                status = "offline";
                message = "Missing OpenAI API Key";
            } else {
                try {
                    const openai = new OpenAI({ apiKey: openaiKey, timeout: 5000 });
                    // Explicit minimal question to verify response
                    await openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [{ role: 'user', content: 'hi' }],
                        max_tokens: 1
                    });
                } catch (e: any) {
                    status = "offline";
                    message = e.message || "OpenAI Connection Error";
                }
            }
        } else if (provider === 'gemini') {
            if (!geminiKey) {
                status = "offline";
                message = "Missing Gemini API Key";
            } else {
                try {
                    const genAI = new GoogleGenerativeAI(geminiKey);
                    const genModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
                    // Explicit minimal question to verify response
                    const result = await genModel.generateContent({
                        contents: [{ role: 'user', parts: [{ text: 'hi' }] }],
                        generationConfig: { maxOutputTokens: 1 }
                    });
                    await result.response;
                } catch (e: any) {
                    status = "offline";
                    message = e.message || "Gemini Connection Error";
                }
            }
        }

        return NextResponse.json({
            provider,
            model,
            status,
            message
        });
    } catch (error) {
        return NextResponse.json({
            status: "offline",
            message: "Internal Server Error",
            error: String(error)
        }, { status: 500 });
    }
}
