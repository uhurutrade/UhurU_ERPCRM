"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

export async function getTransactions(filters?: { accountId?: string, search?: string }) {
    return await prisma.bankTransaction.findMany({
        where: {
            bankAccountId: filters?.accountId || undefined,
            description: {
                contains: filters?.search || undefined,
                mode: 'insensitive'
            }
        },
        include: { bankAccount: true, attachments: true },
        orderBy: { date: 'desc' }
    });
}

export async function uploadAttachment(formData: FormData) {
    const file = formData.get('file') as File;
    const txId = formData.get('transactionId') as string;

    if (!file || !txId) throw new Error("Missing file or ID");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filepath = path.join(uploadDir, filename);

    const { mkdir } = await import('fs/promises');
    await mkdir(uploadDir, { recursive: true });

    try {
        await writeFile(filepath, buffer);
    } catch (e) {
        console.error("Error writing file", e);
    }

    const attachment = await prisma.attachment.create({
        data: {
            path: `/uploads/${filename}`,
            originalName: file.name,
            fileType: file.type,
            transactionId: txId
        }
    });

    // TRIGGER RAG VECTORIZATION (Background)
    try {
        const { ingestDocument } = await import('@/lib/ai/rag-engine');
        // We use the full physical path or the relative path depending on how ingestDocument handles it.
        // Looking at rag-engine.ts, it resolves public paths.
        await ingestDocument(attachment.id, attachment.path);
    } catch (e) { console.error("RAG Error:", e); }

    revalidatePath('/dashboard/invoices');
}

export async function updateCategory(txId: string, category: string) {
    await prisma.bankTransaction.update({
        where: { id: txId },
        data: { category }
    });

    // Trigger RAG Sync (Background)
    const { syncRecentTransactions } = await import('@/lib/ai/auto-sync-rag');
    syncRecentTransactions();

    revalidatePath('/dashboard/invoices');
}
