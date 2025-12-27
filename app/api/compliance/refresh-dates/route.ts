import { NextResponse } from 'next/server';
import { triggerComplianceSync } from '@/lib/ai/auto-sync-rag';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const isFullSync = body.fullSync === true;

        let provider = 'unknown';

        if (isFullSync) {
            const { syncAllSystemData } = await import('@/lib/ai/auto-sync-rag');
            syncAllSystemData();
            // Full sync also triggers compliance, but we want the provider back
            const { syncComplianceAndReturnProvider } = await import('@/lib/ai/auto-sync-rag');
            provider = await syncComplianceAndReturnProvider();
        } else {
            const { syncComplianceAndReturnProvider } = await import('@/lib/ai/auto-sync-rag');
            provider = await syncComplianceAndReturnProvider();
        }

        return NextResponse.json({
            success: true,
            provider,
            message: isFullSync ? "Full Intelligence Sync triggered" : "AI Refresh triggered"
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
