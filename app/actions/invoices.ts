'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getAIClient } from '@/lib/ai/ai-service';
import { createHash } from 'crypto';

export async function uploadAndAnalyzeInvoice(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const documentRole = formData.get('documentRole') as string; // 'EMITTED' or 'RECEIVED'

        if (!file) {
            return { success: false, error: 'No file provided' };
        }
        if (!documentRole) {
            return { success: false, error: 'Document type is mandatory' };
        }

        // 1. Get AI Client (Provider selected in Settings)
        const ai = await getAIClient();

        // 2. Save file locally
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 2b. Calculate hash for exact match detection
        const fileHash = createHash('sha256').update(buffer).digest('hex');

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'invoices');
        await mkdir(uploadDir, { recursive: true });

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const extension = file.name.split('.').pop() || 'bin';
        const filename = `${uniqueSuffix}.${extension}`;
        const filepath = join(uploadDir, filename);
        const publicPath = `/uploads/invoices/${filename}`;

        await writeFile(filepath, buffer);

        // 3. AI Analysis
        let fileText = "";
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            try {
                // pdf-parse is a CommonJS module
                const pdf = require('pdf-parse');
                const pdfData = await pdf(buffer);
                fileText = pdfData.text;
            } catch (err) {
                console.error("Error parsing PDF:", err);
                fileText = `[Unable to extract text from PDF directly, falling back to raw read] ${await file.text()}`;
            }
        } else {
            fileText = await file.text();
        }

        const analysis = await ai.analyzeInvoice(file.name, fileText, buffer, file.type);

        if (!analysis.isInvoice) {
            return {
                success: false,
                error: `This document doesn't look like a valid invoice or expense. Reason: ${analysis.reason || 'Unknown'}`,
                analysis
            };
        }

        // 3. Duplicate Detection
        // Check for exact file contents or very similar metadata
        const existingByHash = await (prisma.attachment.findFirst as any)({
            where: { fileHash }
        });

        const existingByMetadata = await (prisma.attachment.findFirst as any)({
            where: {
                extractedData: {
                    path: ['issuer'],
                    equals: analysis.issuer
                },
                AND: [
                    {
                        extractedData: {
                            path: ['amount'],
                            equals: analysis.amount
                        }
                    },
                    {
                        extractedData: {
                            path: ['date'],
                            equals: analysis.date
                        }
                    }
                ]
            }
        });

        const existingDuplicate = existingByHash || existingByMetadata;

        if (existingDuplicate && !formData.get('confirmDuplicate')) {
            return {
                success: true,
                isDuplicate: true,
                existingId: existingDuplicate.id,
                analysis
            };
        }

        // 4. Save Attachment with Extracted Metadata
        const attachment = await (prisma.attachment.create as any)({
            data: {
                path: publicPath,
                originalName: file.name,
                fileType: file.type,
                fileHash,
                extractedData: {
                    ...analysis,
                    documentRole // Save whether it's emitted or received
                } as any
            }
        });

        // 4. Try to find potential matches in General Ledger
        const potentialMatches = await findPotentialMatches(analysis, documentRole);

        revalidatePath('/dashboard/invoices');

        return {
            success: true,
            attachmentId: attachment.id,
            analysis,
            potentialMatches
        };

    } catch (error: any) {
        console.error('Invoice upload/analysis error:', error);
        return { success: false, error: error.message || 'Failed to process invoice' };
    }
}

async function findPotentialMatches(analysis: any, documentRole: string) {
    const { issuer, amount, date, currency } = analysis;

    let targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
        targetDate = new Date();
    }

    // Search window: +/- 730 days (2 years) from the invoice date
    const dateStart = new Date(targetDate.getTime() - (730 * 24 * 60 * 60 * 1000));
    const dateEnd = new Date(targetDate.getTime() + (730 * 24 * 60 * 60 * 1000));

    // Initial search: Wide enough to find both exact and converted amounts
    // We'll search for transactions in the date range with a pre-filter to ensure likely matches are fetched
    const issuerKeywords = (issuer || '').split(/[\s,.-]+/).filter((w: string) => w.length > 3).slice(0, 4);
    const amountStrDot = amount.toFixed(2);
    const amountStrComma = amountStrDot.replace('.', ',');

    console.log(`[InvoiceMatch] Searching for: issuer=${issuer}, amount=${amount}, date=${targetDate.toISOString()}`);
    console.log(`[InvoiceMatch] Keywords: ${issuerKeywords.join(', ')}`);

    const candidates = await prisma.bankTransaction.findMany({
        where: {
            date: { gte: dateStart, lte: dateEnd },
            OR: [
                // 1. Amount matches roughly (FX/Conversion - up to 80% variation)
                { amount: { gte: amount * 0.1, lte: amount * 3.0 } },
                { amount: { gte: -amount * 3.0, lte: -amount * 0.1 } },
                // 2. Exact amount digits found in description (dot or comma)
                { description: { contains: amountStrDot, mode: 'insensitive' } },
                { description: { contains: amountStrComma, mode: 'insensitive' } },
                // 3. Any issuer keywords in description/counterparty/merchant
                ...issuerKeywords.map((kw: string) => ({ description: { contains: kw, mode: 'insensitive' } })),
                ...issuerKeywords.map((kw: string) => ({ counterparty: { contains: kw, mode: 'insensitive' } })),
                ...issuerKeywords.map((kw: string) => ({ merchant: { contains: kw, mode: 'insensitive' } }))
            ]
        },
        include: {
            bankAccount: {
                include: { bank: true }
            },
            attachments: true
        },
        orderBy: { date: 'desc' },
        take: 200
    });

    console.log(`[InvoiceMatch] Found ${candidates.length} potential candidates in DB.`);

    // Score and filter candidates
    return candidates.map(m => {
        let score = 0;
        const transAmount = Math.abs(Number(m.amount));
        const cleanDesc = m.description.toLowerCase();

        // --- 1. Amount Scoring ---
        const diff = Math.abs(transAmount - amount);
        const percentDiff = diff / amount;

        // Logical check: Is the amount mentioned in the description? 
        // (Crucial for card payments in foreign currencies)
        const amountStrDot = amount.toFixed(2);
        const amountStrComma = amountStrDot.replace('.', ',');
        const amountInDesc = cleanDesc.includes(amountStrDot) || cleanDesc.includes(amountStrComma);

        // Also check if the integer part is present (e.g. "538" in description)
        const integerPart = amountStrDot.split('.')[0];
        const integerInDesc = integerPart.length > 2 && cleanDesc.includes(integerPart);

        if (percentDiff < 0.001) score += 75;      // Perfect match
        else if (amountInDesc) score += 70;         // Exact amount mention in text (Highest Priority for cards)
        else if (percentDiff < 0.1) score += 65;    // Within 10% (User requested priority)
        else if (percentDiff < 0.25) score += 30;   // Reasonable conversion range
        else if (percentDiff < 0.5) score += 15;    // Broad conversion range
        else if (integerInDesc) score += 15;        // Integer match in description (Bonus)

        // --- 1b. Date Proximity Scoring ---
        const timeDiff = Math.abs(m.date.getTime() - targetDate.getTime());
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        if (daysDiff <= 4) score += 20;             // High bonus for being within +/- 4 days (User requested)
        else if (daysDiff <= 15) score += 5;        // Small bonus for being close-ish

        // --- 2. Currency & Exchange Rate Scoring ---
        if (m.currency === currency) {
            score += 15;
        } else if (cleanDesc.includes(currency.toLowerCase())) {
            score += 10; // Currency mentioned in text
        }

        // --- 3. Provider/Issuer match ---
        if (issuer && issuer.toLowerCase() !== 'unknown' && issuer.length > 2) {
            const cleanIssuer = issuer.toLowerCase().trim();
            const cp = (m.counterparty || '').toLowerCase();
            const merch = (m.merchant || '').toLowerCase();

            if (cleanDesc.includes(cleanIssuer) || cp.includes(cleanIssuer) || merch.includes(cleanIssuer)) {
                score += 30;
            } else {
                const words = cleanIssuer.split(/\s+/).filter((w: string) => w.length > 3);
                const hasWordMatch = words.some((w: string) => cleanDesc.includes(w) || cp.includes(w) || merch.includes(w));
                if (hasWordMatch) score += 15;
            }
        }

        // --- 4. Role Match (Bonus) ---
        if ((documentRole === 'RECEIVED' && Number(m.amount) < 0) ||
            (documentRole === 'EMITTED' && Number(m.amount) > 0)) {
            score += 10;
        }

        return {
            ...m,
            matchScore: score
        };
    })
        .filter(m => m.matchScore >= 40) // Only show semi-likely matches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);
}

export async function linkAttachmentToTransaction(attachmentId: string, transactionId: string) {
    try {
        await prisma.attachment.update({
            where: { id: attachmentId },
            data: { transactionId }
        });
        revalidatePath('/dashboard/invoices');
        revalidatePath('/dashboard/banking');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteAttachment(id: string) {
    try {
        const att = await prisma.attachment.findUnique({ where: { id } });
        if (!att) return { success: false, error: 'Not found' };

        // delete from db
        await prisma.attachment.delete({ where: { id } });

        // revalidate
        revalidatePath('/dashboard/invoices');
        revalidatePath('/dashboard/banking');

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
