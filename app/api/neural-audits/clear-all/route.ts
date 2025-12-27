import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
    try {
        await prisma.neuralAudit.deleteMany();
        return NextResponse.json({ success: true, message: 'All audits cleared successfully' });
    } catch (error) {
        console.error('Error clearing neural audits:', error);
        return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
    }
}
