'use server';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Get attachment info first
        const attachment = await prisma.attachment.findUnique({
            where: { id: params.id }
        });

        if (!attachment) {
            return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
        }

        // Eliminar archivo físico y Chunks del RAG de forma unificada
        const { purgeDocument } = await import('@/lib/ai/rag-engine');
        await purgeDocument(params.id, attachment.path);

        // Delete from database
        await prisma.attachment.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete attachment error:', error);
        return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 });
    }
}
