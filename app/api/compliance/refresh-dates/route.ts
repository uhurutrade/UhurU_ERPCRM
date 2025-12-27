import { NextResponse } from 'next/server';
import { triggerComplianceSync } from '@/lib/ai/auto-sync-rag';

export async function POST() {
    try {
        await triggerComplianceSync();
        return NextResponse.json({
            success: true,
            message: "AI Refresh triggered in background. The dates will be updated in a few seconds."
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
