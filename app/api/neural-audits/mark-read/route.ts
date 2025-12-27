import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { ids, all } = await req.json();

        if (all) {
            await prisma.neuralAudit.updateMany({
                where: { isRead: false },
                data: { isRead: true }
            });
        } else if (ids && Array.isArray(ids)) {
            await prisma.neuralAudit.updateMany({
                where: { id: { in: ids } },
                data: { isRead: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
