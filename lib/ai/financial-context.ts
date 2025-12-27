import { prisma } from '@/lib/prisma';

export async function getFinancialContext() {
    try {
        const settings = await prisma.companySettings.findFirst();

        // Define the start date: Last Fiscal Year End or 1 year ago as fallback
        const startDate = settings?.lastFYEndDate
            ? new Date(settings.lastFYEndDate)
            : new Date(new Date().setFullYear(new Date().getFullYear() - 1));

        const [transactions, invoices, obligations] = await Promise.all([
            prisma.bankTransaction.findMany({
                where: {
                    date: { gte: startDate }
                },
                orderBy: { date: 'desc' },
                include: { bankAccount: true }
            }),
            prisma.invoice.findMany({
                where: {
                    date: { gte: startDate }
                },
                orderBy: { date: 'desc' },
                include: { organization: true }
            }),
            prisma.taxObligation.findMany({
                where: { status: 'PENDING' },
                orderBy: { dueDate: 'asc' }
            })
        ]);

        // Calculate basic totals for the AI context
        const totals = transactions.reduce((acc: any, tx) => {
            const amt = Number(tx.amount);
            if (amt > 0) acc.totalInbound += amt;
            else acc.totalOutbound += Math.abs(amt);
            return acc;
        }, { totalInbound: 0, totalOutbound: 0 });

        const context = `
# FULL FISCAL PERIOD CONTEXT (SINCE ${startDate.toLocaleDateString()}):
This context includes EVERY transaction and invoice recorded since the last Fiscal Year End (FYE).
The goal is to provide a complete picture for UK Corporation Tax, VAT, and Spanish DLA/Tax residency compliance.

COMPANY PROFILE:
- Company: ${settings?.companyName || 'N/A'} (No. ${settings?.companyNumber || 'N/A'})
- Last Fiscal Year End: ${settings?.lastFYEndDate?.toLocaleDateString() || 'N/A'}
- Predicted Next confirmation Statement: ${settings?.nextConfirmationStatementDue?.toLocaleDateString() || 'N/A'}
- Predicted Next Annual Accounts: ${settings?.nextAccountsCompaniesHouseDue?.toLocaleDateString() || 'N/A'}

PERIOD FINANCIAL SUMMARY (LIVE DATA):
- Inbound (Current Period): £${totals.totalInbound.toLocaleString()}
- Outbound (Current Period): £${totals.totalOutbound.toLocaleString()}
- Net Flow: £${(totals.totalInbound - totals.totalOutbound).toLocaleString()}

DETAILED LEDGER (CURRENT FISCAL PERIOD):
TRANSACTIONS:
${transactions.length > 0
                ? transactions.map(t => `- [${t.date.toLocaleDateString()}] ${t.description}: ${t.currency} ${Number(t.amount).toLocaleString()}`).join('\n')
                : 'No transactions found in this period.'}

INVOICES ISSUED:
${invoices.length > 0
                ? invoices.map(i => `- [${i.date.toLocaleDateString()}] ${i.number} to ${i.organization.name}: ${i.total} ${i.currency} (Status: ${i.status})`).join('\n')
                : 'No invoices found in this period.'}

UPCOMING COMPLIANCE & TAX OBLIGATIONS:
${obligations.map(o => `- ${o.type}: Due ${o.dueDate.toLocaleDateString()} (${o.amountActual || o.amountEstimated ? (o.amountActual || o.amountEstimated) + ' GBP' : 'Amount TBD'})`).join('\n')}
        `;

        return context;
    } catch (error) {
        console.error("Error fetching financial context:", error);
        return "Unable to fetch live financial data at this moment.";
    }
}
