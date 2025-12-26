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

        console.log(`[UPLOAD] 📁 Doc Basket: ${files.length} file(s) - [${files.map(f => `"${f.name}"`).join(', ')}]`);

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

            // 4. Intelligence: Semantic Deduplication & Versioning
            let isAutoSuperseded = false;
            if (docTopic && docDate) {
                // Check for Semantic Duplicate (Same Topic + Same Date)
                const semanticDuplicate = await prisma.complianceDocument.findFirst({
                    where: {
                        documentType: 'BASKET',
                        documentDate: docDate,
                        extractedData: {
                            path: ['docTopic'],
                            equals: docTopic
                        } as any
                    }
                });

                if (semanticDuplicate || analysis.isDuplicate === true) {
                    skippedCount++;
                    continue;
                }

                // Handle Invalidation (Same Topic + Incoming is Newer)
                const olderVersions = await prisma.complianceDocument.findMany({
                    where: {
                        documentType: 'BASKET',
                        extractedData: {
                            path: ['docTopic'],
                            equals: docTopic
                        } as any,
                        documentDate: { lt: docDate },
                        isSuperseded: false
                    }
                });

                for (const oldDoc of olderVersions) {
                    await prisma.complianceDocument.update({
                        where: { id: oldDoc.id },
                        data: { isSuperseded: true }
                    });
                }

                // If we upload an OLD document, it should be marked as superseded immediately
                const newerVersionsCount = await prisma.complianceDocument.count({
                    where: {
                        documentType: 'BASKET',
                        extractedData: {
                            path: ['docTopic'],
                            equals: docTopic
                        } as any,
                        documentDate: { gt: docDate }
                    }
                });

                if (newerVersionsCount > 0) {
                    isAutoSuperseded = true;
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
                    strategicInsights: analysis.strategicInsightEN || analysis.strategicInsight || null,
                    documentDate: docDate,
                    isProcessed: true,
                    isSuperseded: isAutoSuperseded
                }
            });

            // --- TRIGGER RAG VECTORIZATION ---
            const { ingestDocument } = await import('@/lib/ai/rag-engine');
            await ingestDocument(doc.id, publicPath).catch(err =>
                console.error(`[RAG] Error vectorizing basket doc ${doc.id}:`, err)
            );

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

        // Always return success, even if some/all files were skipped
        return {
            success: true,
            count: results.length,
            skipped: skippedCount,
            message: results.length > 0
                ? `Uploaded ${results.length} file(s)${skippedCount > 0 ? `, skipped ${skippedCount} duplicate(s)` : ''}`
                : `All ${skippedCount} file(s) were already in the Basket`
        };

    } catch (error: any) {
        console.error('Basket upload error:', error);
        return { success: false, error: error.message || 'Failed to upload to basket', skipped: 0 };
    }
}

export async function getBasketHistory(page = 1, itemsPerPage = 20) {
    try {
        const [total, docs] = await Promise.all([
            prisma.complianceDocument.count({ where: { documentType: 'BASKET' } }),
            prisma.complianceDocument.findMany({
                where: { documentType: 'BASKET' },
                orderBy: { uploadedAt: 'desc' },
                take: itemsPerPage,
                skip: (page - 1) * itemsPerPage
            })
        ]);
        return { success: true, data: docs, total, totalPages: Math.ceil(total / itemsPerPage) };
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

        // 1. Eliminar archivo físico y Chunks del RAG de forma unificada
        const { purgeDocument } = await import('@/lib/ai/rag-engine');
        await purgeDocument(id, doc.path);

        // 2. Eliminar de la base de datos
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

export async function updateDocumentNotes(id: string, notes: string) {
    try {
        await prisma.complianceDocument.update({
            where: { id },
            data: { userNotes: notes }
        });

        revalidatePath('/dashboard/doc-basket');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to update notes' };
    }
}

export async function reprocessDocument(id: string) {
    try {
        const doc = await prisma.complianceDocument.findUnique({
            where: { id }
        });

        if (!doc) return { success: false, error: 'Document not found' };

        const ai = await getAIClient();
        const fs = require('fs/promises');
        const path = require('path');
        const fullPath = path.join(process.cwd(), 'public', doc.path);

        let buffer: Buffer;
        try {
            buffer = await fs.readFile(fullPath);
        } catch (err) {
            return { success: false, error: 'File not found on disk' };
        }

        let fileText = "";
        if (doc.filename.toLowerCase().endsWith('.pdf')) {
            try {
                const pdf = require('pdf-parse');
                const pdfData = await pdf(buffer);
                fileText = pdfData.text;
            } catch (err) {
                fileText = `[PDF extraction failed]`;
            }
        } else {
            fileText = buffer.toString('utf-8');
        }

        const analysis = await ai.analyzeStrategicDoc(doc.filename, fileText, buffer, doc.fileType || undefined, doc.userNotes || undefined);

        await prisma.complianceDocument.update({
            where: { id },
            data: {
                extractedData: analysis as any,
                strategicInsights: analysis.strategicInsightEN || analysis.strategicInsight || doc.strategicInsights,
                documentDate: analysis.documentDate ? new Date(analysis.documentDate) : doc.documentDate
            }
        });

        // 5. RE-TRIGGER RAG VECTORIZATION (Background)
        // This ensures updated insights/notes are in the RAG
        const { ingestDocument } = await import('@/lib/ai/rag-engine');
        ingestDocument(id, doc.path).catch(err =>
            console.error(`[RAG] Error re-vectorizing ${id}:`, err)
        );

        revalidatePath('/dashboard/doc-basket');
        return { success: true };
    } catch (error: any) {
        console.error('Reprocess error:', error);
        return { success: false, error: error.message || 'Failed to reprocess document' };
    }
}

