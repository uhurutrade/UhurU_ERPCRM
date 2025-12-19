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
        const existingByHash = await prisma.attachment.findFirst({
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

    // Fallback if AI produced an invalid date
    if (isNaN(targetDate.getTime())) {
        console.warn(`[Invoice Matching] AI provided invalid date: "${date}". Falling back to current date.`);
        targetDate = new Date();
    }

    // Search window: Entire calendar year of the document (or current year as fallback)
    const dateStart = new Date(targetDate.getFullYear(), 0, 1);
    const dateEnd = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59);

    // Build the query
    const whereConditions: any[] = [
        { date: { gte: dateStart, lte: dateEnd } }
    ];

    // Filter by sign based on role
    if (documentRole === 'RECEIVED') {
        whereConditions.push({ amount: { lt: 0 } });
    } else if (documentRole === 'EMITTED') {
        whereConditions.push({ amount: { gt: 0 } });
    }

    // Only add name matching if issuer is not "Unknown" or too generic
    if (issuer && issuer.toLowerCase() !== 'unknown' && issuer.length > 2) {
        whereConditions.push({
            OR: [
                { description: { contains: issuer, mode: 'insensitive' } },
                { counterparty: { contains: issuer, mode: 'insensitive' } },
                { merchant: { contains: issuer, mode: 'insensitive' } }
            ]
        });
    }

    const matches = await prisma.bankTransaction.findMany({
        where: {
            AND: whereConditions
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
        // Amount match (using absolute values because expenses are negative in bank)
        const diff = Math.abs(Math.abs(Number(m.amount)) - amount);
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
