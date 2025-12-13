import { createHash } from 'crypto';

export interface BankStatementRow {
    date: Date;
    description: string;
    amount: number;
    currency: string;
    reference?: string;
}

export function generateTransactionHash(row: BankStatementRow): string {
    const data = `${row.date.toISOString()}_${row.amount}_${row.description}_${row.currency}`;
    return createHash('md5').update(data).digest('hex');
}

export function parseAmount(amountStr: string): number {
    // Remove currency symbols and normalize decimal separator
    // Assuming standard format like "1,234.56" or "-1234.56"
    // If user has European format "1.234,56", we might need detection logic, 
    // but for now let's assume standard programming float format or simple UK/US CSVs.

    const cleanStr = amountStr.replace(/[^\d.-]/g, '');
    const val = parseFloat(cleanStr);
    return isNaN(val) ? 0 : val;
}

export function parseCSVLines(content: string): BankStatementRow[] {
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    const rows: BankStatementRow[] = [];

    // Simple auto-detection: assume header is line 0
    // Detect columns: Date, Amount, Description/Narration
    if (lines.length === 0) return [];

    const header = lines[0].toLowerCase();
    const columns = header.split(',').map(c => c.replace(/"/g, '').trim());

    const dateIdx = columns.findIndex(c => c.includes('date'));
    const amountIdx = columns.findIndex(c => c.includes('amount') || c.includes('value'));
    const descIdx = columns.findIndex(c => c.includes('desc') || c.includes('narration') || c.includes('reference'));

    if (dateIdx === -1 || amountIdx === -1) {
        throw new Error("Could not detect 'Date' or 'Amount' columns in CSV.");
    }

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Basic CSV splitting (doesn't handle commas inside quotes perfectly, using a library usually better but keeping it zero-dep for now)
        const parts = line.split(',');

        if (parts.length < columns.length) continue;

        const dateStr = parts[dateIdx];
        const amountStr = parts[amountIdx];
        const descStr = descIdx !== -1 ? parts[descIdx] : 'No description';

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) continue; // Skip invalid dates

        rows.push({
            date: date,
            amount: parseAmount(amountStr),
            description: descStr.replace(/"/g, ''),
            currency: 'GBP' // Default to GBP for now, could be passed in
        });
    }

    return rows;
}
