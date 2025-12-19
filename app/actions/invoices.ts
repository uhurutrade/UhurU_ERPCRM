'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getAIClient } from '@/lib/ai/ai-service';

export async function uploadAndAnalyzeInvoice(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        // 1. Get AI Client (Provider selected in Settings)
        const ai = await getAIClient();

        // 2. Save file locally
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

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

        const analysis = await ai.analyzeInvoice(file.name, fileText);

        if (!analysis.isInvoice) {
            return {
                success: false,
                error: `This document doesn't look like a valid invoice or expense. Reason: ${analysis.reason || 'Unknown'}`,
                analysis
            };
        }

        // 3. Save Attachment with Extracted Metadata
        const attachment = await prisma.attachment.create({
            data: {
                path: publicPath,
                originalName: file.name,
                fileType: file.type,
                extractedData: analysis as any
            }
        });

        // 4. Try to find potential matches in General Ledger
        const potentialMatches = await findPotentialMatches(analysis);

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

async function findPotentialMatches(analysis: any) {
    const { issuer, amount, date, currency } = analysis;
    const targetDate = new Date(date);

    // Search window: Entire calendar year of the invoice
    const dateStart = new Date(targetDate.getFullYear(), 0, 1);
    const dateEnd = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59);

    // Matching criteria:
    // 1. Amount should be close (within 5% for FX or fees)
    // 2. Date within window
    // 3. Description/Counterparty contains issuer name

    const matches = await prisma.bankTransaction.findMany({
        where: {
            AND: [
                { date: { gte: dateStart, lte: dateEnd } },
                {
                    OR: [
                        { description: { contains: issuer, mode: 'insensitive' } },
                        { counterparty: { contains: issuer, mode: 'insensitive' } },
                        { merchant: { contains: issuer, mode: 'insensitive' } }
                    ]
                }
            ]
        },
        include: {
            bankAccount: {
                include: { bank: true }
            },
            attachments: true
        },
        take: 5
    });

    // Score and filter matches
    return matches.map(m => {
        let score = 0;
        // Amount match
        const diff = Math.abs(Number(m.amount) - amount);
        const percentDiff = diff / amount;
        if (percentDiff < 0.01) score += 50;
        else if (percentDiff < 0.05) score += 30;

        // Currency match
        if (m.currency === currency) score += 20;

        // Exact name match
        if (m.description.toLowerCase().includes(issuer.toLowerCase()) ||
            (m.counterparty && m.counterparty.toLowerCase().includes(issuer.toLowerCase()))) {
            score += 30;
        }

        return {
            ...m,
            matchScore: score
        };
    }).sort((a, b) => b.matchScore - a.matchScore);
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
