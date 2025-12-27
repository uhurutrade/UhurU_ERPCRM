
import { triggerComplianceSync } from '../lib/ai/auto-sync-rag';

/**
 * CLI Script to force AI compliance recalculation
 * Run with: npx tsx scripts/refresh-compliance.ts
 */
async function main() {
    console.log('🚀 Triggering AI Compliance Recalculation...');

    // We can't use triggerSync (setTimeout 0) in a CLI script that exits immediately
    // So we call the logic directly or wait for it.

    try {
        const { syncCompanySettings } = await import('../lib/ai/auto-sync-rag');
        const { recalculateComplianceDeadlines } = await import('../lib/ai/compliance-service');

        console.log('📡 Syncing Company Settings to RAG...');
        await syncCompanySettings();

        console.log('🤖 Recalculating deadlines via AI...');
        await recalculateComplianceDeadlines();

        console.log('✅ Done! Check the dashboard or settings page.');
    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    }
}

main();
