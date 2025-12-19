'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function uploadToBasket(formData: FormData) {
    try {
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return { success: false, error: 'No files provided' };
        }

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'basket');
        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        const results = [];

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const extension = file.name.split('.').pop() || 'bin';
            const filename = `${uniqueSuffix}.${extension}`;
            const filepath = join(uploadDir, filename);
            const publicPath = `/uploads/basket/${filename}`;

            await writeFile(filepath, buffer);

            // Create record in ComplianceDocument with Type BASKET
            const doc = await prisma.complianceDocument.create({
                data: {
                    filename: file.name,
                    fileType: file.type,
                    documentType: 'BASKET',
                    path: publicPath,
                    size: file.size,
                    isProcessed: false // Until we add RAG processing
                }
            });

            results.push(doc.id);
        }

        revalidatePath('/dashboard/doc-basket');
        revalidatePath('/dashboard/wall');

        return { success: true, count: results.length };

    } catch (error: any) {
        console.error('Basket upload error:', error);
        return { success: false, error: error.message || 'Failed to upload to basket' };
    }
}
