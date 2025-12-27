/**
 * AUTO-SYNC RAG ENGINE
 * 
 * Sistema de sincronización automática y NO BLOQUEANTE del RAG.
 * Todas las operaciones se ejecutan en segundo plano sin afectar la UX.
 */

import { prisma } from '../prisma';
import { ingestText } from './rag-engine';

/**
 * Helper para disparar sincronizaciones en segundo plano de forma segura
 */
export function triggerSync(moduleName: string, syncFn: () => Promise<void>) {
    // Usamos setTimeout 0 para asegurar que la respuesta principal ya se envió al cliente
    setTimeout(async () => {
        try {
            console.log(`[RAG Auto-Sync] 🛰️ Iniciando sincronización de: ${moduleName}`);
            await syncFn();
            console.log(`[RAG Auto-Sync] ✅ Sincronización finalizada: ${moduleName}`);
        } catch (e: any) {
            console.error(`[RAG Auto-Sync] ❌ Error sincronizando ${moduleName}:`, e.message);
        }
    }, 0);
}

/**
 * Sincronización unificada de configuración y cumplimiento
 */
export async function triggerComplianceSync() {
    triggerSync('COMPLIANCE_AND_SETTINGS', async () => {
        await syncComplianceAndReturnProvider();
    });
}

export async function syncComplianceAndReturnProvider() {
    // 1. Sync RAG first
    await syncCompanySettings();

    // 2. Recalculate Compliance Deadlines via AI
    try {
        const { recalculateComplianceDeadlines } = await import("./compliance-service");
        const result = await recalculateComplianceDeadlines();
        return result || { provider: 'unknown', changes: null };
    } catch (e) {
        console.error("[RAG Auto-Sync] ❌ AI Recalculation failed:", e);
        return { provider: 'failed', changes: null };
    }
}

/**
 * Sincroniza TODA la base de datos al RAG de forma asíncrona
 */
export function syncAllSystemData() {
    triggerSync('FULL_SYSTEM_SYNC', async () => {
        // CORE BUSINESS DATA
        await triggerComplianceSync(); // Includes RAG sync + AI Dates
        await syncBankingOverview();
        await syncRecentTransactions();
        await syncCryptoWallets();
        await syncCryptoTransactions();

        // DOCUMENTS & COMPLIANCE
        await syncComplianceDocuments();
        await syncTaxObligations();
        await syncFiscalYears();
        await syncComplianceEvents();

        // CRM
        await syncCRMOrganizations();
        await syncCRMContacts();
        await syncCRMLeads();
        await syncCRMDeals();

        // INVOICING
        await syncInvoices();

        // TASKS & ACTIVITIES
        await syncTasks();
        await syncActivities();

        // ASSETS
        await syncAssets();

        // AUDIT & METADATA
        await syncDeletedTransactions();
        await syncTransactionCategories();

        /**
         * FUTURE MODULES REGISTRY
         * ========================
         * 1. Create your sync function below (e.g., syncMarketing())
         * 2. Await it here for Full Sync
         * 3. Call it from your Server Actions in background:
         *    const { syncMyModule } = await import('@/lib/ai/auto-sync-rag');
         *    syncMyModule();
         */

        // await syncMarketing();
        // await syncInventory();

        console.log('[RAG Auto-Sync] ✅ Sincronización COMPLETA finalizada');
    });
}

// ============================================================================
// COMPANY & SETTINGS
// ============================================================================

export async function syncCompanySettings() {
    try {
        const settings = await prisma.companySettings.findFirst({
            select: {
                companyName: true,
                companyNumber: true,
                incorporationDate: true,
                registeredAddress: true,
                registeredCity: true,
                registeredPostcode: true,
                registeredCountry: true,
                tradingAddress: true,
                companyType: true,
                sicCodes: true,
                financialYearEnd: true,
                accountsNextDueDate: true,
                confirmationNextDueDate: true,
                vatRegistered: true,
                vatNumber: true,
                vatRegistrationDate: true,
                vatScheme: true,
                vatReturnFrequency: true,
                utr: true,
                corporationTaxReference: true,
                payeReference: true,
                directors: true,
                companySecretary: true,
                shareCapital: true,
                numberOfShares: true,
                contactEmail: true,
                contactPhone: true,
                website: true,
                accountingSoftware: true,
                accountingMethod: true,
                aiSystemPrompt: true,
                aiStrategicDirectives: true,
                aiMemoryPrompt: true,
                notes: true
            }
        });
        if (!settings) return;

        const content = `
COMPANY PROFILE & SETTINGS
==========================
Company Name: ${settings.companyName}
Company Number: ${settings.companyNumber}
Incorporation Date: ${settings.incorporationDate.toISOString().split('T')[0]}
Registered Address: ${settings.registeredAddress}, ${settings.registeredCity}, ${settings.registeredPostcode}, ${settings.registeredCountry}
Trading Address: ${settings.tradingAddress || 'Same as registered'}
Company Type: ${settings.companyType}
SIC Codes: ${settings.sicCodes}

FINANCIAL & TAX
---------------
Financial Year End: ${settings.financialYearEnd}
Next Accounts Due: ${settings.accountsNextDueDate?.toISOString().split('T')[0] || 'N/A'}
Next Confirmation Statement: ${settings.confirmationNextDueDate?.toISOString().split('T')[0] || 'N/A'}
VAT Registered: ${settings.vatRegistered ? 'Yes' : 'No'}
VAT Number: ${settings.vatNumber || 'N/A'}
VAT Registration Date: ${settings.vatRegistrationDate?.toISOString().split('T')[0] || 'N/A'}
VAT Scheme: ${settings.vatScheme || 'N/A'}
VAT Return Frequency: ${settings.vatReturnFrequency || 'N/A'}
UTR: ${settings.utr || 'N/A'}
Corp Tax Ref: ${settings.corporationTaxReference || 'N/A'}
PAYE Ref: ${settings.payeReference || 'N/A'}

GOVERNANCE
----------
Directors: ${settings.directors || 'N/A'}
Company Secretary: ${settings.companySecretary || 'N/A'}
Share Capital: £${settings.shareCapital || '0.00'} (${settings.numberOfShares || 0} shares)

CONTACT & SYSTEMS
-----------------
Email: ${settings.contactEmail || 'N/A'}
Phone: ${settings.contactPhone || 'N/A'}
Website: ${settings.website || 'N/A'}
Accounting Software: ${settings.accountingSoftware || 'N/A'}
Accounting Method: ${settings.accountingMethod || 'N/A'}
STRATEGIC NEURAL CENTER (AI PROMPTS)
---------------------------------
System Identity: ${settings.aiSystemPrompt || 'N/A'}
Strategic Directives: ${settings.aiStrategicDirectives || 'N/A'}
Adaptive Memory / Log: ${settings.aiMemoryPrompt || 'N/A'}

NOTES
-----
${settings.notes || 'None'}
        `.trim();

        await ingestText('sys_company_settings', 'Company Settings & Legal', content);
        console.log('[RAG Auto-Sync] ✓ Company Settings');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Company Settings:', error.message);
    }
}

// ============================================================================
// BANKING
// ============================================================================

export async function syncBankingOverview() {
    try {
        const banks = await prisma.bank.findMany({
            select: {
                bankName: true,
                bankType: true,
                swiftBic: true,
                bankCode: true,
                website: true,
                supportEmail: true,
                supportPhone: true,
                bankAddress: true,
                bankCity: true,
                bankPostcode: true,
                isActive: true,
                accounts: {
                    select: {
                        accountName: true,
                        accountType: true,
                        currency: true,
                        currentBalance: true,
                        iban: true,
                        accountNumber: true,
                        sortCode: true,
                        paymentDetails: true,
                        isActive: true,
                        isPrimary: true
                    }
                }
            }
        });
        let bankContent = "BANKING INTELLIGENCE\n====================\n\n";

        for (const bank of banks) {
            bankContent += `BANK: ${bank.bankName} (${bank.bankType})\n`;
            bankContent += `SWIFT/BIC: ${bank.swiftBic || 'N/A'}\n`;
            bankContent += `Bank Code: ${bank.bankCode || 'N/A'}\n`;
            bankContent += `Website: ${bank.website || 'N/A'}\n`;
            bankContent += `Support: ${bank.supportEmail || 'N/A'} | ${bank.supportPhone || 'N/A'}\n`;
            bankContent += `Address: ${bank.bankAddress || 'N/A'}, ${bank.bankCity || ''} ${bank.bankPostcode || ''}\n`;
            bankContent += `Status: ${bank.isActive ? 'Active' : 'Inactive'}\n`;

            if (bank.accounts.length > 0) {
                bankContent += `\nAccounts (${bank.accounts.length}):\n`;
                for (const acc of bank.accounts) {
                    bankContent += `\n  • ${acc.accountName}\n`;
                    bankContent += `    Type: ${acc.accountType} | Currency: ${acc.currency}\n`;
                    bankContent += `    Balance: ${acc.currentBalance || '0.00'} ${acc.currency}\n`;
                    bankContent += `    IBAN: ${acc.iban || acc.accountNumber || 'N/A'}\n`;
                    if (acc.sortCode) bankContent += `    Sort Code: ${acc.sortCode}\n`;
                    if ((acc as any).paymentDetails) bankContent += `    Payment Instructions:\n    ${(acc as any).paymentDetails.replace(/\n/g, '\n    ')}\n`;
                    bankContent += `    Status: ${acc.isActive ? 'Active' : 'Inactive'} | Primary: ${acc.isPrimary ? 'Yes' : 'No'}\n`;
                }
            }
            bankContent += `\n${'='.repeat(60)}\n\n`;
        }

        await ingestText('sys_banking_overview', 'Banking Overview', bankContent);
        console.log('[RAG Auto-Sync] ✓ Banking Overview');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Banking:', error.message);
    }
}

export async function syncRecentTransactions() {
    try {
        const settings = await prisma.companySettings.findFirst();
        const startDate = settings?.lastFYEndDate
            ? new Date(settings.lastFYEndDate)
            : new Date(new Date().setFullYear(new Date().getFullYear() - 1));

        const transactions = await prisma.bankTransaction.findMany({
            where: { date: { gte: startDate } },
            orderBy: { date: 'desc' },
            select: {
                date: true,
                description: true,
                amount: true,
                currency: true,
                type: true,
                counterparty: true,
                category: true,
                bankAccount: {
                    select: {
                        accountName: true,
                        bank: { select: { bankName: true } }
                    }
                }
            }
        });

        let txContent = `BANK TRANSACTIONS (SINCE ${startDate.toLocaleDateString()})\n====================================\n\n`;

        for (const tx of transactions) {
            txContent += `${tx.date.toISOString().split('T')[0]} | ${tx.description}\n`;
            txContent += `Amount: ${tx.amount} ${tx.currency} | Type: ${tx.type || 'N/A'}\n`;
            txContent += `Account: ${tx.bankAccount.accountName} (${tx.bankAccount.bank.bankName})\n`;
            if (tx.counterparty) txContent += `Counterparty: ${tx.counterparty}\n`;
            if (tx.category) txContent += `Category: ${tx.category}\n`;
            txContent += `---\n\n`;
        }

        await ingestText('sys_recent_transactions', 'Financial Transactions Ledger', txContent);
        console.log('[RAG Auto-Sync] ✓ Transactions Ledger');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Transactions:', error.message);
    }
}

// ============================================================================
// CRYPTO
// ============================================================================

export async function syncCryptoWallets() {
    try {
        const wallets = await prisma.cryptoWallet.findMany({
            select: {
                walletName: true,
                walletType: true,
                blockchain: true,
                network: true,
                asset: true,
                currentBalance: true,
                balanceUSD: true,
                walletAddress: true,
                isActive: true,
                isMultiSig: true
            }
        });

        let cryptoContent = "CRYPTO WALLETS & ASSETS\n=======================\n\n";

        for (const wallet of wallets) {
            cryptoContent += `Wallet: ${wallet.walletName} (${wallet.walletType})\n`;
            cryptoContent += `Blockchain: ${wallet.blockchain} (${wallet.network})\n`;
            cryptoContent += `Asset: ${wallet.asset} | Balance: ${wallet.currentBalance || '0'} ${wallet.asset} ($${wallet.balanceUSD || '0'})\n`;
            cryptoContent += `Address: ${wallet.walletAddress}\n`;
            cryptoContent += `Status: ${wallet.isActive ? 'Active' : 'Inactive'} | Multi-Sig: ${wallet.isMultiSig ? 'Yes' : 'No'}\n`;
            cryptoContent += `---\n\n`;
        }

        await ingestText('sys_crypto_wallets', 'Crypto Wallets', cryptoContent);
        console.log('[RAG Auto-Sync] ✓ Crypto Wallets');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Crypto:', error.message);
    }
}

export async function syncCryptoTransactions() {
    try {
        const settings = await prisma.companySettings.findFirst();
        const startDate = settings?.lastFYEndDate
            ? new Date(settings.lastFYEndDate)
            : new Date(new Date().setFullYear(new Date().getFullYear() - 1));

        const transactions = await prisma.cryptoTransaction.findMany({
            where: { timestamp: { gte: startDate } },
            orderBy: { timestamp: 'desc' },
            select: {
                timestamp: true,
                type: true,
                amount: true,
                asset: true,
                amountUSD: true,
                fromAddress: true,
                toAddress: true,
                status: true,
                txHash: true,
                description: true,
                wallet: { select: { walletName: true } }
            }
        });

        let cryptoTxContent = `CRYPTO TRANSACTIONS (SINCE ${startDate.toLocaleDateString()})\n====================================\n\n`;

        for (const tx of transactions) {
            cryptoTxContent += `${tx.timestamp.toISOString().split('T')[0]} | ${tx.type} | ${tx.amount} ${tx.asset} (${tx.status})\n`;
            cryptoTxContent += `Value: $${tx.amountUSD || 'N/A'} | Wallet: ${tx.wallet.walletName}\n`;
            if (tx.description) cryptoTxContent += `Notes: ${tx.description}\n`;
            cryptoTxContent += `Hash: ${tx.txHash}\n`;
            cryptoTxContent += `---\n\n`;
        }

        await ingestText('sys_crypto_recent_transactions', 'Crypto Movemements Ledger', cryptoTxContent);
        console.log('[RAG Auto-Sync] ✓ Crypto Transactions Ledger');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Crypto Transactions:', error.message);
    }
}

// ============================================================================
// TAX & COMPLIANCE
// ============================================================================

export async function syncTaxObligations() {
    try {
        const obligations = await prisma.taxObligation.findMany({
            orderBy: { dueDate: 'asc' },
            select: {
                type: true,
                status: true,
                dueDate: true,
                amountEstimated: true,
                amountActual: true
            }
        });

        let taxContent = "TAX OBLIGATIONS\n===============\n\n";

        for (const ob of obligations) {
            taxContent += `${ob.type} | Status: ${ob.status}\n`;
            taxContent += `Due: ${ob.dueDate.toISOString().split('T')[0]}\n`;
            taxContent += `Amount: £${ob.amountEstimated || ob.amountActual || 'TBD'}\n`;
            taxContent += `---\n\n`;
        }

        await ingestText('sys_tax_obligations', 'Tax Obligations', taxContent);
        console.log('[RAG Auto-Sync] ✓ Tax Obligations');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Tax:', error.message);
    }
}

export async function syncFiscalYears() {
    try {
        const fiscalYears = await prisma.fiscalYear.findMany({
            include: { obligations: true },
            orderBy: { year: 'desc' }
        });

        let fyContent = "FISCAL YEARS\n============\n\n";

        for (const fy of fiscalYears) {
            fyContent += `FY ${fy.year}: ${fy.startDate.toISOString().split('T')[0]} to ${fy.endDate.toISOString().split('T')[0]}\n`;
            fyContent += `Status: ${fy.isClosed ? 'Closed' : 'Open'} | Obligations: ${fy.obligations.length}\n`;
            fyContent += `---\n\n`;
        }

        await ingestText('sys_fiscal_years', 'Fiscal Years', fyContent);
        console.log('[RAG Auto-Sync] ✓ Fiscal Years');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Fiscal Years:', error.message);
    }
}

export async function syncComplianceEvents() {
    try {
        const events = await prisma.complianceEvent.findMany({
            orderBy: { date: 'desc' },
            take: 100
        });

        let evContent = "COMPLIANCE EVENTS\n=================\n\n";

        for (const ev of events) {
            evContent += `${ev.date.toISOString().split('T')[0]} | ${ev.title} (${ev.type})\n`;
            evContent += `Completed: ${ev.isCompleted ? 'Yes' : 'No'}\n`;
            if (ev.description) evContent += `Notes: ${ev.description}\n`;
            evContent += `---\n\n`;
        }

        await ingestText('sys_compliance_events', 'Compliance Events', evContent);
        console.log('[RAG Auto-Sync] ✓ Compliance Events');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Compliance Events:', error.message);
    }
}

export async function syncComplianceDocuments() {
    try {
        const docs = await prisma.complianceDocument.findMany({
            orderBy: { uploadedAt: 'desc' },
            take: 50 // Ingest high-level metadata for last 50 docs
        });

        let docContent = "OFFICIAL COMPLIANCE DOCUMENTS\n============================\n\n";

        for (const doc of docs) {
            docContent += `File: ${doc.filename}\n`;
            docContent += `Type: ${doc.documentType || 'General Document'} | Date: ${doc.documentDate?.toISOString().split('T')[0] || 'N/A'}\n`;
            docContent += `Uploaded: ${doc.uploadedAt.toISOString().split('T')[0]}\n`;
            if (doc.strategicInsights) docContent += `Strategic Insight: ${doc.strategicInsights}\n`;
            if (doc.userNotes) docContent += `User Notes: ${doc.userNotes}\n`;
            docContent += `---\n\n`;
        }

        await ingestText('sys_compliance_documents', 'Institutional Compliance Documents', docContent);
        console.log('[RAG Auto-Sync] ✓ Compliance Documents');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Compliance Documents:', error.message);
    }
}

// ============================================================================
// CRM
// ============================================================================

export async function syncCRMOrganizations() {
    try {
        const organizations = await prisma.organization.findMany({
            select: {
                name: true,
                sector: true,
                email: true,
                phone: true,
                address: true,
                city: true,
                postcode: true,
                isBillable: true,
                taxId: true,
                contacts: { select: { id: true } },
                deals: { select: { id: true } },
                invoices: { select: { id: true } }
            }
        });

        let crmContent = "CRM ORGANIZATIONS\n=================\n\n";

        for (const org of organizations) {
            crmContent += `${org.name} | Sector: ${org.sector || 'N/A'}\n`;
            crmContent += `Contact: ${org.email || 'N/A'} | ${org.phone || 'N/A'}\n`;
            crmContent += `Address: ${org.address || 'N/A'}, ${org.city || ''} ${org.postcode || ''}\n`;
            crmContent += `Billable: ${org.isBillable ? 'Yes' : 'No'}`;
            if (org.isBillable) crmContent += ` | Tax ID: ${org.taxId || 'N/A'}`;
            crmContent += `\nContacts: ${org.contacts.length} | Deals: ${org.deals.length} | Invoices: ${org.invoices.length}\n`;
            crmContent += `---\n\n`;
        }

        await ingestText('sys_crm_organizations', 'CRM Organizations', crmContent);
        console.log('[RAG Auto-Sync] ✓ CRM Organizations');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing CRM Orgs:', error.message);
    }
}

export async function syncCRMContacts() {
    try {
        const contacts = await prisma.contact.findMany({
            select: {
                name: true,
                role: true,
                email: true,
                phone: true,
                isClient: true,
                organization: { select: { name: true } }
            }
        });

        let contactContent = "CRM CONTACTS\n============\n\n";

        for (const contact of contacts) {
            contactContent += `${contact.name} | ${contact.role || 'N/A'}\n`;
            contactContent += `Email: ${contact.email || 'N/A'} | Phone: ${contact.phone || 'N/A'}\n`;
            contactContent += `Organization: ${contact.organization?.name || 'Independent'}\n`;
            contactContent += `Client: ${contact.isClient ? 'Yes' : 'No'}\n`;
            contactContent += `---\n\n`;
        }

        await ingestText('sys_crm_contacts', 'CRM Contacts', contactContent);
        console.log('[RAG Auto-Sync] ✓ CRM Contacts');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing CRM Contacts:', error.message);
    }
}

export async function syncCRMLeads() {
    try {
        const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });

        let leadContent = "CRM LEADS\n=========\n\n";

        for (const lead of leads) {
            leadContent += `${lead.name} | ${lead.email || 'N/A'}\n`;
            leadContent += `Source: ${lead.source || 'N/A'} | Status: ${lead.status}\n`;
            leadContent += `---\n\n`;
        }

        await ingestText('sys_crm_leads', 'CRM Leads', leadContent);
        console.log('[RAG Auto-Sync] ✓ CRM Leads');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing CRM Leads:', error.message);
    }
}

export async function syncCRMDeals() {
    try {
        const deals = await prisma.deal.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                title: true,
                amount: true,
                currency: true,
                stage: true,
                closeDate: true,
                organization: { select: { name: true } }
            }
        });

        let dealContent = "CRM DEALS\n=========\n\n";

        for (const deal of deals) {
            dealContent += `${deal.title} | ${deal.organization.name}\n`;
            dealContent += `Amount: ${deal.amount || '0'} ${deal.currency} | Stage: ${deal.stage}\n`;
            dealContent += `Close Date: ${deal.closeDate?.toISOString().split('T')[0] || 'TBD'}\n`;
            dealContent += `---\n\n`;
        }

        await ingestText('sys_crm_deals', 'CRM Deals', dealContent);
        console.log('[RAG Auto-Sync] ✓ CRM Deals');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing CRM Deals:', error.message);
    }
}

// ============================================================================
// INVOICING
// ============================================================================

export async function syncInvoices() {
    try {
        const settings = await prisma.companySettings.findFirst();
        const startDate = settings?.lastFYEndDate
            ? new Date(settings.lastFYEndDate)
            : new Date(new Date().setFullYear(new Date().getFullYear() - 1));

        const invoices = await prisma.invoice.findMany({
            where: { date: { gte: startDate } },
            orderBy: { date: 'desc' },
            select: {
                number: true,
                date: true,
                dueDate: true,
                total: true,
                currency: true,
                status: true,
                organization: { select: { name: true } }
            }
        });

        let invContent = `INVOICES ISSUED (SINCE ${startDate.toLocaleDateString()})\n====================================\n\n`;

        for (const inv of invoices) {
            invContent += `Invoice #${inv.number} | ${inv.organization.name}\n`;
            invContent += `Date: ${inv.date.toISOString().split('T')[0]} | Due: ${inv.dueDate.toISOString().split('T')[0]}\n`;
            invContent += `Total: ${inv.total} ${inv.currency} | Status: ${inv.status}\n`;
            invContent += `---\n\n`;
        }

        await ingestText('sys_invoices', 'Institutional Invoicing History', invContent);
        console.log('[RAG Auto-Sync] ✓ Invoices History');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Invoices:', error.message);
    }
}

// ============================================================================
// TASKS & ACTIVITIES
// ============================================================================

export async function syncTasks() {
    try {
        const tasks = await prisma.task.findMany({
            orderBy: { dueDate: 'asc' },
            select: {
                title: true,
                dueDate: true,
                completed: true,
                assignedTo: { select: { name: true } }
            }
        });

        let taskContent = "TASKS\n=====\n\n";

        for (const task of tasks) {
            taskContent += `${task.title} | Assigned: ${task.assignedTo?.name || 'Unassigned'}\n`;
            taskContent += `Due: ${task.dueDate?.toISOString().split('T')[0] || 'No deadline'} | Done: ${task.completed ? 'Yes' : 'No'}\n`;
            taskContent += `---\n\n`;
        }

        await ingestText('sys_tasks', 'Tasks', taskContent);
        console.log('[RAG Auto-Sync] ✓ Tasks');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Tasks:', error.message);
    }
}

export async function syncActivities() {
    try {
        const activities = await prisma.activity.findMany({
            orderBy: { date: 'desc' },
            take: 100,
            select: {
                date: true,
                type: true,
                notes: true,
                contact: { select: { name: true } }
            }
        });

        let actContent = "ACTIVITIES\n==========\n\n";

        for (const act of activities) {
            actContent += `${act.date.toISOString().split('T')[0]} | ${act.type} | ${act.contact?.name || 'N/A'}\n`;
            if (act.notes) actContent += `Notes: ${act.notes}\n`;
            actContent += `---\n\n`;
        }

        await ingestText('sys_activities', 'Activities', actContent);
        console.log('[RAG Auto-Sync] ✓ Activities');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Activities:', error.message);
    }
}

// ============================================================================
// ASSETS
// ============================================================================

export async function syncAssets() {
    try {
        const assets = await prisma.asset.findMany({
            orderBy: { purchaseDate: 'desc' },
            select: {
                name: true,
                type: true,
                purchaseDate: true,
                cost: true,
                currency: true
            }
        });

        let assetContent = "ASSETS\n======\n\n";

        for (const asset of assets) {
            assetContent += `${asset.name} | Type: ${asset.type}\n`;
            assetContent += `Purchased: ${asset.purchaseDate.toISOString().split('T')[0]} | Cost: ${asset.cost} ${asset.currency}\n`;
            assetContent += `---\n\n`;
        }

        await ingestText('sys_assets', 'Assets', assetContent);
        console.log('[RAG Auto-Sync] ✓ Assets');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Assets:', error.message);
    }
}

// ============================================================================
// AUDIT
// ============================================================================

export async function syncDeletedTransactions() {
    try {
        const deleted = await prisma.deletedTransaction.findMany({
            orderBy: { deletedAt: 'desc' },
            take: 50,
            select: {
                date: true,
                description: true,
                amount: true,
                currency: true,
                deletedAt: true,
                reason: true
            }
        });

        let delContent = "DELETED TRANSACTIONS LOG\n========================\n\n";

        for (const del of deleted) {
            delContent += `${del.date.toISOString().split('T')[0]} | ${del.description}\n`;
            delContent += `Amount: ${del.amount} ${del.currency} | Deleted: ${del.deletedAt.toISOString().split('T')[0]}\n`;
            delContent += `Reason: ${del.reason || 'Not specified'}\n`;
            delContent += `---\n\n`;
        }

        await ingestText('sys_deleted_transactions', 'Deleted Transactions', delContent);
        console.log('[RAG Auto-Sync] ✓ Deleted Transactions');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Deleted Transactions:', error.message);
    }
}

// ============================================================================
// METADATA & CATEGORIES
// ============================================================================

export async function syncTransactionCategories() {
    try {
        const categories = await prisma.transactionCategory.findMany({
            orderBy: { name: 'asc' }
        });

        let catContent = "TRANSACTION CATEGORIES\n======================\n\n";
        catContent += "These categories are used to classify bank transactions and expenses:\n\n";

        for (const cat of categories) {
            catContent += `• ${cat.name}\n`;
        }

        await ingestText('sys_transaction_categories', 'Transaction Categories', catContent);
        console.log('[RAG Auto-Sync] ✓ Transaction Categories');
    } catch (error: any) {
        console.error('[RAG Auto-Sync] Error syncing Categories:', error.message);
    }
}
