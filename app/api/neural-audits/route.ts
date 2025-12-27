import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const audits = await prisma.neuralAudit.findMany({
            orderBy: { timestamp: 'desc' },
            take: 20
        });
        return NextResponse.json(audits);
    } catch (error) {
        console.error('Error fetching neural audits:', error);
        return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 });
    }
}
