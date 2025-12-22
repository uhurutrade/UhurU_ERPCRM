'use server';

import { prisma } from '@/lib/prisma';
import { ingestText } from '@/lib/ai/rag-engine';

export async function syncSystemDataToRag() {
    try {
        console.log('🔄 Syncing System Data to RAG...');

        // 1. Company Settings
        const settings = await prisma.companySettings.findFirst();
        if (settings) {
            const content = `
COMPANY PROFILE & SETTINGS
--------------------------
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
UTR: ${settings.utr || 'N/A'}
Corp Tax Ref: ${settings.corporationTaxReference || 'N/A'}
PAYE Ref: ${settings.payeReference || 'N/A'}
Directors: ${settings.directors || 'N/A'}
Share Capital: ${settings.shareCapital} (${settings.numberOfShares} shares)

NOTES
-----
${settings.notes || 'None'}
            `.trim();

            await ingestText('sys_company_settings', 'Company Settings & Legal', content);
        }

        // 2. Banks & Accounts
        const banks = await prisma.bank.findMany({ include: { accounts: true } });
        let bankContent = "BANKING INTELLIGENCE\n--------------------\n";

        for (const bank of banks) {
            bankContent += `BANK: ${bank.bankName} (${bank.bankType})\n`;
            for (const acc of bank.accounts) {
                bankContent += `  - Account: ${acc.accountName}\n`;
                bankContent += `    Type: ${acc.accountType}\n`;
                bankContent += `    Currency: ${acc.currency}\n`;
                bankContent += `    Total Balance: ${acc.currentBalance} ${acc.currency}\n`;
                bankContent += `    Iban/Number: ${acc.iban || acc.accountNumber || 'N/A'}\n`;
                if (acc.sortCode) bankContent += `    Sort Code: ${acc.sortCode}\n`;
                bankContent += `    Status: ${acc.isActive ? 'Active' : 'Inactive'}\n\n`;
            }
        }
        await ingestText('sys_banking_overview', 'Banking Overview', bankContent);

        // 3. Tax Obligations
        const obligations = await prisma.taxObligation.findMany({
            where: { status: 'PENDING' },
            orderBy: { dueDate: 'asc' }
        });
        let taxContent = "PENDING TAX OBLIGATIONS\n-----------------------\n";
        if (obligations.length === 0) taxContent += "No pending obligations found.\n";
        for (const ob of obligations) {
            taxContent += `Type: ${ob.type}\nDue Date: ${ob.dueDate.toISOString().split('T')[0]}\nEstimated: ${ob.amountEstimated || 'TBD'}\nActual: ${ob.amountActual || 'TBD'}\n\n`;
        }
        await ingestText('sys_tax_obligations', 'Pending Tax Obligations', taxContent);

        // 4. Recent Transactions
        const transactions = await prisma.bankTransaction.findMany({
            take: 50,
            orderBy: { date: 'desc' },
            include: { bankAccount: true }
        });
        let txContent = "RECENT BANK TRANSACTIONS (LAST 50)\n----------------------------------\n";
        for (const tx of transactions) {
            txContent += `${tx.date.toISOString().split('T')[0]} | ${tx.description} | ${tx.amount} ${tx.currency} | Account: ${tx.bankAccount.accountName}\n`;
        }
        await ingestText('sys_recent_transactions', 'Recent Bank Transactions', txContent);

        // 5. CRM (Basic)
        const orgs = await prisma.organization.findMany({ take: 20 });
        let crmContent = "KEY ORGANIZATIONS\n-----------------\n";
        for (const org of orgs) {
            crmContent += `${org.name} | Sector: ${org.sector}\n`;
        }
        await ingestText('sys_crm_sample', 'CRM Sample', crmContent);

        return { success: true };
    } catch (error: any) {
        console.error('Sync System Data Error:', error);
        return { success: false, error: error.message };
    }
}
