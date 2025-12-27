import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const [audits, total] = await Promise.all([
            prisma.neuralAudit.findMany({
                orderBy: { timestamp: 'desc' },
                skip,
                take: limit
            }),
            prisma.neuralAudit.count()
        ]);

        return NextResponse.json({
            audits,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching neural audits:', error);
        return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 });
    }
}
