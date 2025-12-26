
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function GET() {
    try {
        const docs = await prisma.complianceDocument.findMany({
            orderBy: { uploadedAt: 'desc' },
            select: {
                id: true,
                filename: true,
                uploadedAt: true,
                isProcessed: true
            }
        });
        return NextResponse.json(docs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const doc = await prisma.complianceDocument.findUnique({ where: { id } });
        if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // 1. Eliminar archivo físico y Chunks del RAG de forma unificada
        const { purgeDocument } = await import('@/lib/ai/rag-engine');
        await purgeDocument(id, doc.path);

        // 2. Eliminar de la base de datos
        await prisma.complianceDocument.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}

```
