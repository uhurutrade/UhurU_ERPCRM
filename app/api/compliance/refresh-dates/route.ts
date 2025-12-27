import { NextResponse } from 'next/server';
import { triggerComplianceSync } from '@/lib/ai/auto-sync-rag';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const isFullSync = body.fullSync === true;

        let provider = 'unknown';
        let result: any = null;

        if (isFullSync) {
            const { syncAllSystemData, syncComplianceAndReturnProvider } = await import('@/lib/ai/auto-sync-rag');
            // Foreground: Get consensus for legal dates immediately to return to user
            result = await syncComplianceAndReturnProvider();
            provider = result.provider;

            // Background: Trigger full system RAG sync (banking, crm, etc.)
            // We pass true to skip compliance since we just did it in foreground
            syncAllSystemData(true);
        } else {
            const { syncComplianceAndReturnProvider } = await import('@/lib/ai/auto-sync-rag');
            result = await syncComplianceAndReturnProvider();
            provider = result.provider;
        }

        return NextResponse.json({
            success: true,
            provider,
            changes: result?.changes,
            message: isFullSync ? "Full Intelligence Sync triggered" : "AI Refresh triggered"
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
