import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        if (!id) {
            return NextResponse.json({ error: 'Audit ID is required' }, { status: 400 });
        }

        await prisma.neuralAudit.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Audit deleted successfully' });
    } catch (error) {
        console.error('Error deleting neural audit:', error);
        return NextResponse.json({ error: 'Failed to delete audit' }, { status: 500 });
    }
}
