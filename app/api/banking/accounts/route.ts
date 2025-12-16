import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export async function GET() {
    try {
        const accounts = await prisma.bankAccount.findMany({
            include: {
                bank: true
            },
            orderBy: {
                order: 'asc'
            }
        });

        return NextResponse.json({ accounts });
    } catch (error) {
        console.error('Error fetching bank accounts:', error);
        return NextResponse.json({ account: null }, { status: 500 });
    }
}
