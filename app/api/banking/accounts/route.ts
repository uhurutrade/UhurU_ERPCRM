import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const account = await prisma.bankAccount.findFirst();

        return NextResponse.json({ account });
    } catch (error) {
        console.error('Error fetching bank accounts:', error);
        return NextResponse.json({ account: null }, { status: 500 });
    }
}
