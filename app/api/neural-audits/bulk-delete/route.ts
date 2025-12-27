import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { ids } = await req.json();

        if (ids === 'ALL') {
            await prisma.neuralAudit.deleteMany({});
        } else if (ids && Array.isArray(ids)) {
            await prisma.neuralAudit.deleteMany({
                where: { id: { in: ids } }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
