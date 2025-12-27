'use server';

import { prisma } from '@/lib/prisma';
import { ingestText } from '@/lib/ai/rag-engine';

export async function syncSystemDataToRag() {
    try {
        const { syncAllSystemData } = await import('@/lib/ai/auto-sync-rag');
        syncAllSystemData(); // This handles triggerSync internally
        return { success: true };
    } catch (error: any) {
        console.error('Sync System Data Error:', error);
        return { success: false, error: error.message };
    }
}
