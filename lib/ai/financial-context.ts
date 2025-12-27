import { prisma } from '@/lib/prisma';

export async function getFinancialContext() {
    try {
        const [transactions, invoices, obligations, settings] = await Promise.all([
            prisma.bankTransaction.findMany({
                orderBy: { date: 'desc' },
                take: 50, // Recent relevant transactions
                include: { bankAccount: true }
            }),
            prisma.invoice.findMany({
                orderBy: { date: 'desc' },
                take: 20,
                include: { organization: true }
            }),
            prisma.taxObligation.findMany({
                where: { status: 'PENDING' },
                orderBy: { dueDate: 'asc' }
            }),
            prisma.companySettings.findFirst()
        ]);

        // Calculate some basic totals for the AI
        const totals = transactions.reduce((acc: any, tx) => {
            const amt = Number(tx.amount);
            if (amt > 0) acc.totalInbound += amt;
            else acc.totalOutbound += Math.abs(amt);
            return acc;
        }, { totalInbound: 0, totalOutbound: 0 });

        const context = `
COMPANY PROFILE (UK COMPLIANCE):
- Company: ${settings?.companyName || 'N/A'} (No. ${settings?.companyNumber || 'N/A'})
- Incorporation Date: ${settings?.incorporationDate?.toLocaleDateString() || 'N/A'}
- Financial Year End Reference: ${settings?.financialYearEnd || 'N/A'}
- Last CompaniesHouse Confirmation Filed: ${settings?.lastConfirmationStatementDate?.toLocaleDateString() || 'N/A'}
- Last CompaniesHouse Accounts Filed: ${settings?.lastAccountsCompaniesHouseDate?.toLocaleDateString() || 'N/A'}
- Last HMRC Accounts Filed: ${settings?.lastAccountsHMRCDate?.toLocaleDateString() || 'N/A'}
- Last Fiscal Year End: ${settings?.lastFYEndDate?.toLocaleDateString() || 'N/A'}
- Current Predicted Next Confirmation: ${settings?.nextConfirmationStatementDue?.toLocaleDateString() || 'N/A'}
- Current Predicted Next Accounts: ${settings?.nextAccountsCompaniesHouseDue?.toLocaleDateString() || 'N/A'}

FINANCIAL SUMMARY (GENERAL LEDGER):
- Total Recent Inbound: £${totals.totalInbound.toLocaleString()}
- Total Recent Outbound: £${totals.totalOutbound.toLocaleString()}

RECENT TRANSACTIONS:
${transactions.map(t => `- ${t.date.toLocaleDateString()}: ${t.description} (${t.currency} ${Number(t.amount).toLocaleString()})`).join('\n')}

RECENT ISSUED INVOICES:
${invoices.map(i => `- ${i.date.toLocaleDateString()}: ${i.number} to ${i.organization.name} (${i.total} ${i.currency}) - Status: ${i.status}`).join('\n')}

UPCOMING TAX OBLIGATIONS:
${obligations.map(o => `- ${o.type}: Due ${o.dueDate.toLocaleDateString()} (${o.amountActual || o.amountEstimated ? (o.amountActual || o.amountEstimated) + ' GBP' : 'Amount TBD'})`).join('\n')}
        `;

        return context;
    } catch (error) {
        console.error("Error fetching financial context:", error);
        return "Unable to fetch live financial data at this moment.";
    }
}
