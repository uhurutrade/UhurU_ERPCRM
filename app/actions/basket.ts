'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { getAIClient } from '@/lib/ai/ai-service';

export async function uploadToBasket(formData: FormData) {
    try {
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return { success: false, error: 'No files provided' };
        }

        const ai = await getAIClient();
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'basket');
        await mkdir(uploadDir, { recursive: true });

        const results = [];
        let skippedCount = 0;

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // 1. Deduplication
            const hash = createHash('sha256').update(buffer).digest('hex');
            const existing = await prisma.complianceDocument.findFirst({
                where: { fileHash: hash }
            });

            if (existing) {
                skippedCount++;
                continue;
            }

            // 2. Storage
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const extension = file.name.split('.').pop() || 'bin';
            const filename = `${uniqueSuffix}.${extension}`;
            const filepath = join(uploadDir, filename);
            const publicPath = `/uploads/basket/${filename}`;

            await writeFile(filepath, buffer);

            // 3. AI Strategic Analysis
            let fileText = "";
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                try {
                    const pdf = require('pdf-parse');
                    const pdfData = await pdf(buffer);
                    fileText = pdfData.text;
                } catch (err) {
                    fileText = `[PDF extraction failed]`;
                }
            } else {
                fileText = await file.text();
            }

            const analysis = await ai.analyzeStrategicDoc(file.name, fileText, buffer, file.type);
            const docDate = analysis.documentDate ? new Date(analysis.documentDate) : null;
            const docTopic = analysis.docTopic;

            // 4. Intelligence: Versioning & Invalidation
            if (docTopic && docDate) {
                const others = await prisma.complianceDocument.findMany({
                    where: {
                        documentType: 'BASKET',
                        extractedData: {
                            path: ['docTopic'],
                            equals: docTopic
                        } as any,
                        isSuperseded: false
                    }
                });

                for (const other of others) {
                    if (other.documentDate && docDate > other.documentDate) {
                        await prisma.complianceDocument.update({
                            where: { id: other.id },
                            data: { isSuperseded: true }
                        });
                    }
                }
            }

            // 5. Save to DB
            const doc = await prisma.complianceDocument.create({
                data: {
                    filename: file.name,
                    fileType: file.type,
                    documentType: 'BASKET',
                    path: publicPath,
                    size: file.size,
                    fileHash: hash,
                    extractedData: analysis as any,
                    strategicInsights: analysis.strategicInsight || null,
                    documentDate: docDate,
                    isProcessed: true,
                    isSuperseded: false
                }
            });

            // 5. If analysis found deadlines, create ComplianceEvents
            if (analysis.deadlines && Array.isArray(analysis.deadlines)) {
                for (const d of analysis.deadlines) {
                    await prisma.complianceEvent.create({
                        data: {
                            title: d.title,
                            description: d.description,
                            date: new Date(d.date),
                            type: 'DEADLINE'
                        }
                    });
                }
            }

            results.push(doc.id);
        }

        revalidatePath('/dashboard/doc-basket');
        revalidatePath('/dashboard/wall');

        if (skippedCount > 0 && results.length === 0) {
            return { success: false, error: `All provided files (${skippedCount}) are already in the Basket.`, skipped: skippedCount };
        }

        return {
            success: true,
            count: results.length,
            skipped: skippedCount
        };

    } catch (error: any) {
        console.error('Basket upload error:', error);
        return { success: false, error: error.message || 'Failed to upload to basket', skipped: 0 };
    }
}

export async function getBasketHistory() {
    try {
        const docs = await prisma.complianceDocument.findMany({
            where: { documentType: 'BASKET' },
            orderBy: { uploadedAt: 'desc' },
            take: 20
        });
        return { success: true, data: docs };
    } catch (error) {
        return { success: false, error: 'Failed to fetch history' };
    }
}

export async function removeFromBasket(id: string) {
    try {
        const doc = await prisma.complianceDocument.findUnique({
            where: { id }
        });

        if (!doc) return { success: false, error: 'Document not found' };

        // 1. Delete file from filesystem
        const fs = require('fs/promises');
        const path = require('path');
        const fullPath = path.join(process.cwd(), 'public', doc.path);

        try {
            await fs.unlink(fullPath);
        } catch (err) {
            console.error('File deletion error (might already be gone):', err);
        }

        // 2. Delete from DB
        await prisma.complianceDocument.delete({
            where: { id }
        });

        revalidatePath('/dashboard/doc-basket');
        revalidatePath('/dashboard/wall');

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to remove document' };
    }
}
